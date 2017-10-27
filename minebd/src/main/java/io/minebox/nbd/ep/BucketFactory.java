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

package io.minebox.nbd.ep;

import com.google.inject.Inject;
import com.google.inject.Provider;
import io.minebox.config.MinebdConfig;
import io.minebox.nbd.Encryption;
import io.minebox.nbd.SerialNumberService;
import io.minebox.nbd.download.DownloadService;
import io.minebox.nbd.download.RecoverableFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static io.minebox.nbd.download.RecoverableFile.from;

public class BucketFactory {
    private static final Logger LOGGER = LoggerFactory.getLogger(BucketFactory.class);
    private final SerialNumberService serialNumberService;
    private final List<String> parentDirs;
    private final long size;
    private final Encryption encryption;
    private final Provider<DownloadService> downloadService;
    private List<File> parentFolders;
    private boolean parentFoldersCreated = false;

    @Inject
    public BucketFactory(SerialNumberService serialNumberService, MinebdConfig config, Encryption encryption, Provider<DownloadService> downloadService) {
        this.serialNumberService = serialNumberService;
        this.parentDirs = config.parentDirs;
        this.size = config.bucketSize.toBytes();
        this.encryption = encryption;
        this.downloadService = downloadService;
    }

    private void createParentFolders() {
        if (parentFoldersCreated) {
            return;
        }
        parentFoldersCreated = true;
        parentFolders = parentDirs.stream()
                .map(dir -> new File(dir, serialNumberService.getPublicIdentifier()))
                .collect(Collectors.toList());
        parentFolders.forEach(File::mkdirs);
    }

    Bucket create(Integer bucketIndex) {
        createParentFolders();
        final String fileName = "minebox_v1_" + bucketIndex + ".dat";
        final RecoverableFile recoverableFile = from(fileName, serialNumberService.getPublicIdentifier(), parentDirs);
//        recoverableFile.forEach(file -> ensureFileExists(bucketIndex, file));
        ensureFileExists(bucketIndex, recoverableFile);
        final List<Bucket> buckets = parentFolders.stream()
                .map(parentFolder -> new SingleFileBucket(bucketIndex, size, encryption, new File(parentFolder, fileName)))
                .collect(Collectors.toList());

        return new Raid1Buckets(buckets, bucketIndex);
    }

    private void ensureFileExists(Integer bucketIndex, RecoverableFile recoverableFile) {
        boolean oneFileExists = false;
        List<File> missingFiles = new ArrayList<>();
        for (File parentDirectory : recoverableFile.parentDirectories) {
            final File file1 = new File(parentDirectory, recoverableFile.fileName);
            if (file1.exists()) {
                oneFileExists = true;
            } else {
                missingFiles.add(file1);
            }
        }

        if (oneFileExists) {
            //todo repair files which are missing
            //determine newest file
            //copy file over to other destinations
        } else {
            DownloadService.RecoveryStatus wasDownloaded = downloadService.get().downloadIfPossible(recoverableFile);
            if (DownloadService.RecoveryStatus.ERROR.equals(wasDownloaded)) {
                throw new RuntimeException("i was unable to obtain the expected file");
            } else if (DownloadService.RecoveryStatus.NO_FILE.equals(wasDownloaded)) {
                recoverableFile.forEach(this::createEmptyFile);
            } else if (DownloadService.RecoveryStatus.RECOVERED.equals(wasDownloaded)) {
                LOGGER.info("bucket {} is now happy that we got the file {}", bucketIndex, recoverableFile.fileName);
            } else {
                throw new IllegalStateException("unexpected recovery state:" + wasDownloaded);
            }
        }
    }

    private void createEmptyFile(File file) {
        final boolean created;
        try {
            created = file.createNewFile();
        } catch (IOException e1) {
            throw new IllegalStateException("unable to create file");
        }
        if (!created) {
            throw new IllegalStateException("file already existed");
        }
    }

}
