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

package io.minebox.config;

import io.dropwizard.util.Size;

import java.util.List;

/**
 * Created by andreas on 11.04.17.
 */
public class MinebdConfig {

    public Integer nbdPort = 10809;
    public Integer maxOpenFiles = 10;
    public List<String> parentDirs;
    public Size reportedSize = Size.gigabytes(4);
    public String encryptionKeyPath;
    public String authFile;
    public Size bucketSize = Size.megabytes(40);
    public Size maxUnflushed = Size.megabytes(100);
    public Size minFreeSystemMem = Size.megabytes(400);
    public String httpMetadata;
    public Boolean ignoreMissingPaths = false;
    public String siaDataDirectory;
    public String siaClientUrl;

    public MinebdConfig() {
        //explicit non-annotated constructor so guice does not accidentally this class badly
    }
}
