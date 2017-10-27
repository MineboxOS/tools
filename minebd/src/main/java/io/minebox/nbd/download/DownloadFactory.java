/*
 * Copyright 2017 Minebox IT Services GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * Various tools around backups, mostly to get info about them.
 */

package io.minebox.nbd.download;

import com.google.common.base.Joiner;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import io.minebox.sia.SiaUtil;
import io.minebox.nbd.RemoteTokenService;
import io.minebox.nbd.SerialNumberService;
import io.minebox.nbd.SiaSeedService;
import io.minebox.nbd.encryption.EncyptionKeyProvider;
import io.minebox.util.FileUtil;
import org.apache.commons.lang3.tuple.Pair;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Singleton
public class DownloadFactory implements Provider<DownloadService> {
    private final MetaDataStatus.MetaDataStatusProvider metaDataStatusProvider;
    private RemoteTokenService remoteTokenService;
    private final String metadataUrl;
    private final Path siaDir;
    private final List<String> parentDirs;
    private final SiaUtil siaUtil;
    private final SiaSeedService siaSeedService;


    static final private Logger LOGGER = LoggerFactory.getLogger(DownloadFactory.class);
    private volatile DownloadService initializedDownloadService;
    private final SiaProcessController siaProcessController;
    private final SerialNumberService serialNumberService;

    @Inject
    public DownloadFactory(MetaDataStatus.MetaDataStatusProvider metaDataStatusProvider,
                           RemoteTokenService remoteTokenService,
                           @Named("httpMetadata") String metadataUrl,
                           @Named("siaDataDirectory") String siaDataDirectory,
                           @Named("parentDirs") List<String> parentDirs,
                           SiaUtil siaUtil,
                           SiaSeedService siaSeedService,
                           SiaProcessController siaProcessController,
                           SerialNumberService serialNumberService) {

        this.metaDataStatusProvider = metaDataStatusProvider;
        this.remoteTokenService = remoteTokenService;
        this.metadataUrl = metadataUrl;
        siaDir = Paths.get(siaDataDirectory).toAbsolutePath();
        this.parentDirs = parentDirs;
        this.siaUtil = siaUtil;
        this.siaSeedService = siaSeedService;
        this.siaProcessController = siaProcessController;
        this.serialNumberService = serialNumberService;
    }

    @Inject
    public void initMetaData(EncyptionKeyProvider encyptionKeyProvider) {
        LOGGER.info("registering init callback when key is loaded..");
        encyptionKeyProvider.onLoadKey(this::init);
//        if (encyptionKeyProvider.getMasterPassword().isDone()){
//            if (siaUtil.hasSeed()); maybe check the state of sia, if there is no seed file but an initialized sia, something is fishy?
//        }
    }

    private void init() {
        LOGGER.info("assuming key exists, now we can load metadata");
               /*
       cases:
       fresh key, try to reach metadata
       case FreshUnreachable: fresh key, metadata unreachable -> crash, invalid status.
       case FreshEmpty: fresh key, metadata reachable but empty -> ,init sia, NothingTodoDownloadService
       case FreshNonempty: fresh key, metadata reachable -> , init sia, save MetaDataStatus, SiaHostedDownload

       old key: dont try to reach metadata. (apparently no need to init sia, since not the first startup)
       case OldNonempty old key, metadata was loaded -> save MetaDataStatus, continue restore with SiaHostedDownload
       case OldEmpty old key, metadata was empty -> save MetaDataStatus, NothingTodoDownloadService
        */
        if (!metaDataStatusProvider.fileExists()) {
            LOGGER.info("no local metadata found, trying to load it...");
            initFreshKey();
        } else {
            LOGGER.info("local metadata located, using this.");
            initOldKey();
        }
    }

    private void initOldKey() {
        final MetaDataStatus metaDataStatus = metaDataStatusProvider.get();
        if (!metaDataStatus.lookup.isEmpty()) {
//            case OldNonempty
            LOGGER.info("metadata was old and nonempty, we have work to do to restore up to {} files", metaDataStatus.lookup.size());
            //todo count those missing files, maybe we're good already..
            initializedDownloadService = buildSiaDownload(metaDataStatus.lookup);
        } else {
            //we were fresh, nothing to download...
//            case OldEmpty
            LOGGER.info("metadata was old but empty, assuming a fresh file system");
            initializedDownloadService = new NothingTodoDownloadService();
        }
    }

    public boolean existsSomewhere(RecoverableFile recoverableFile) {
        for (File parentDirectory : recoverableFile.parentDirectories) {
            final boolean exists = new File(parentDirectory, recoverableFile.fileName).exists();
            if (exists) return true;
        }
        return false;
    }

    private DownloadService buildSiaDownload(Map<String, String> lookup) {
        final SiaHostedDownload siaHostedDownload = new SiaHostedDownload(siaUtil, lookup);
//

        final List<RecoverableFile> recoverableFiles = lookup.keySet().stream()
                .map(filename -> RecoverableFile.from(filename, serialNumberService.getPublicIdentifier(), parentDirs))
                //files which already exists are not reciverable, they are already recovered
                .filter(file -> !existsSomewhere(file))
                .collect(Collectors.toList());

        return new BackgroundDelegatedDownloadService(siaHostedDownload, recoverableFiles);
//        return siaHostedDownload;
    }

    private void initFreshKey() {
        //no local metadata found, fresh key
        final ImmutableList<String> siaPaths = loadMetaData();
        final Map<String, String> filenameLookup;
        if (siaPaths == null) {
            //case FreshUnreachable
            LOGGER.error("metadata was fresh but unreachable, erroring out");
            throw new IllegalStateException("fresh key, unable to locate metadata ");
        } else if (siaPaths.isEmpty()) {
            //case FreshEmpty
            LOGGER.info("metadata was fresh but empty, assuming a fresh file system");
            initializedDownloadService = new NothingTodoDownloadService();
            filenameLookup = Maps.newHashMap();
        } else {
            LOGGER.info("metadata was fresh and nonempty, we have work to do to restore up to {} files", siaPaths.size());
            //stopping siad here. extractSiaLookupMap will add new files. then restart / init the seed
            siaProcessController.stopProcess();
            filenameLookup = extractSiaLookupMap(siaPaths);
            siaProcessController.startProcess();
            siaUtil.waitForConsensus();
            siaUtil.unlockWallet(siaSeedService.getSiaSeed());
            //todo init the seed. this will take a while. nevertheless we don't want to assign initializedDownloadService just yet, because it would not be ready.
            initializedDownloadService = buildSiaDownload(filenameLookup);
        }
        LOGGER.info("writing out info about metadata so we can later start up even if offline");
        final MetaDataStatus toWrite = new MetaDataStatus();
        toWrite.lookup = filenameLookup;
        metaDataStatusProvider.write(toWrite);
    }


    private static Map<String, String> extractSiaLookupMap(ImmutableList<String> siaPaths) {
        Map<String, String> filenameLookup = Maps.newHashMap();
        for (String loadedSiaPath : siaPaths) {
            final Pair<String, Long> file_created = parseTimestamp(loadedSiaPath);
            final String siaPath = filenameLookup.get(file_created.getLeft());
            if (siaPath != null) {
                final Pair<String, Long> existing = parseTimestamp(siaPath);
                if (existing.getRight() < file_created.getRight()) {
                    filenameLookup.put(file_created.getLeft(), loadedSiaPath);
                }
            } else {
                filenameLookup.put(file_created.getLeft(), loadedSiaPath);
            }
        }
        return filenameLookup;
    }

    @Override
    public DownloadService get() {
        if (initializedDownloadService == null) {
            throw new IllegalStateException("no download service was determined yet, please wait for the key to be initialized");
        }
        return initializedDownloadService;
    }

    private static Pair<String, Long> parseTimestamp(String input) {
        final ArrayList<String> segments = Lists.newArrayList(Splitter.on(".").split(input));
        final String removed = segments.remove(1);//remove timestamp
        return Pair.of(Joiner.on(".").join(segments), Long.parseLong(removed)); // minebox_v1_0.dat
    }

    private ImmutableList<String> loadMetaData() {
        final Optional<String> token = remoteTokenService.getToken();
        if (!token.isPresent()) {
            LOGGER.error("unable to obtain auth token. not trying to fetch the latest meta data");
            return null;
        }
        try {
            final InputStream body = downloadLatestMetadataZip(token.get());
            if (body == null) {
                return ImmutableList.of(); //no metadata loaded
            }
            final ZipInputStream zis = new ZipInputStream(body);
            ZipEntry entry;

            ImmutableList<String> ret = null;
            while ((entry = zis.getNextEntry()) != null) {
                final String entryName = entry.getName();

                if (entryName.equals("fileinfo")) {
                    ret = readSiaPathsFromInfo(zis);
                } else {
                    digestSiaFile(entry, zis);
                }
            }
            //one of those files must have been fileinfo...
            if (ret == null) {
                LOGGER.warn("fileinfo not found in metadata");
                return ImmutableList.of();
            } else {
                LOGGER.info("loaded backup from metadata service");
            }
            return ret;
        } catch (UnirestException | IOException e) {
            LOGGER.error("unable to load backup from metadata service");
            return null;
        }
    }

    protected InputStream downloadLatestMetadataZip(String token) throws UnirestException {
        final HttpResponse<InputStream> response = Unirest.get(metadataUrl + "file/latestMeta")
                .header("X-Auth-Token", token)
                .asBinary();
        if (response.getStatus() == 404) return null;
        return response.getBody();
    }


    private ImmutableList<String> readSiaPathsFromInfo(ZipInputStream zis) {
        ImmutableList<String> ret;
        JSONArray fileInfo = new JSONArray(convertStreamToString(zis));
        final ImmutableList.Builder<String> filenamesBuilder = ImmutableList.builder();
        for (Object o : fileInfo) {
            JSONObject o2 = (JSONObject) o;
            final String siapath = o2.getString("siapath");
            filenamesBuilder.add(siapath);
        }
        ret = filenamesBuilder.build();
        return ret;
    }

    public static String convertStreamToString(java.io.InputStream is) {
        java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }

    protected void digestSiaFile(ZipEntry entry, ZipInputStream zis) {
        final String entryName = entry.getName();
        final Path dest = siaDir.resolve(entryName);
        LOGGER.info("unpacking file {}", dest.toAbsolutePath().toString());
//        if (entryName.startsWith("renter")) {
        try {
            final boolean deleted = Files.deleteIfExists(dest);//yes, we overwrite everything we find
            if (deleted) {
                LOGGER.info("deleted file {}, recreating from metadata", dest);
            }
            Files.copy(zis, dest);
            FileUtil.setOwnership(dest, "sia", "sia", true);
        } catch (IOException e) {
            throw new RuntimeException("unable to create renter file", e);
//            }
        }
    }


    public boolean hasDownloadService() {
        return initializedDownloadService != null;
    }
}
