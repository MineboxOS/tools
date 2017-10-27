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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.name.Named;
import io.minebox.nbd.SerialNumberService;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public class MetaDataStatus {

    public Map<String, String> lookup;


    public static class MetaDataStatusProvider implements Provider<MetaDataStatus> {

        private File file;
        private final List<String> parentDirs;
        private final SerialNumberService serialNumberService;

        @Inject
        public MetaDataStatusProvider(
                @Named("parentDirs") List<String> parentDir,
                SerialNumberService serialNumberService) {

            this.parentDirs = parentDir;
            this.serialNumberService = serialNumberService;
        }

        private File getStatusFile(String parentDir, SerialNumberService serialNumberService) {
            final File myDir = new File(parentDir, serialNumberService.getPublicIdentifier());
            return new File(myDir, "MetaDataStatus.json");
        }

        public boolean fileExists() {
            initFile();
            return file.exists();
        }

        @Override
        public MetaDataStatus get() {
            initFile();
            try {
                return new ObjectMapper().readValue(file, MetaDataStatus.class);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        private void initFile() {
            if (file == null) {
                file = getStatusFile(parentDirs.get(0), serialNumberService);
            }
        }

        public void write(MetaDataStatus toWrite) {
            initFile();
            try {
                file.getParentFile().mkdirs();
                new ObjectMapper().writeValue(file, toWrite);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
