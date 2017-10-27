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

import java.io.File;
import java.util.List;
import java.util.function.Consumer;
import java.util.stream.Collectors;

public class RecoverableFile {
    //already includes "public identifier"
    public final List<File> parentDirectories;

    public final String fileName;

    public RecoverableFile(List<File> parentDirectories, String fileName) {
        this.parentDirectories = parentDirectories;
        this.fileName = fileName;
    }

    public static RecoverableFile from(String filename, String publicIdentifier, List<String> parentDirs) {
        final List<File> parentFiles = parentDirs.stream()
                .map(name -> new File(name, publicIdentifier))
                .collect(Collectors.toList());
        return new RecoverableFile(parentFiles, filename);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        RecoverableFile that = (RecoverableFile) o;

        return fileName.equals(that.fileName);
    }

    @Override
    public int hashCode() {
        return fileName.hashCode();
    }

    public void forEach(Consumer<File> fileConsumer) {
        for (File parentDirectory : parentDirectories) {
            fileConsumer.accept(new File(parentDirectory, fileName));
        }
    }
}
