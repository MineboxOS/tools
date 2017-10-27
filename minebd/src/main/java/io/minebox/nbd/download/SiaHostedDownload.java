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

import com.google.inject.Inject;
import io.minebox.sia.SiaUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Map;

public class SiaHostedDownload implements DownloadService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SiaHostedDownload.class);
    private final SiaUtil siaUtil;
    private final Map<String, String> lookup;


    @Inject
    SiaHostedDownload(SiaUtil siaUtil, Map<String, String> lookup) {
        this.siaUtil = siaUtil;
        this.lookup = lookup;
    }

    @Override
    public RecoveryStatus downloadIfPossible(RecoverableFile file) {
        final String siaPath = lookup.get(file.fileName);
        if (siaPath == null) {
            return RecoveryStatus.NO_FILE;
        }
        final File firstFile = new File(file.parentDirectories.get(0), file.fileName);
        final boolean download = siaUtil.download(siaPath, firstFile.toPath());
        copyFirstToOthers(file, firstFile);
        if (download) {
            return RecoveryStatus.RECOVERED;
        }
        return RecoveryStatus.ERROR;

    }

    private void copyFirstToOthers(RecoverableFile file, File firstFile) {
        for (int i = 1; i < file.parentDirectories.size(); i++) {
            final File copy = file.parentDirectories.get(i);
            try {
                Files.copy(firstFile.toPath(), copy.toPath());
            } catch (IOException e) {
                throw new RuntimeException("error copying over file" + firstFile, e);
            }
        }
    }

    @Override
    public boolean hasMetadata() {
        return true;
    }

    @Override
    public boolean connectedMetadata() {
        return true;
    }


    @Override
    public double completedPercent(File parentDir) {
        final long missing = lookup.keySet().stream()
                .filter(s -> !new File(parentDir, s).exists())
                .count();
        return 100.0 * (1.0 - (double) missing / lookup.size());
    }
}
