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

import com.google.inject.ProvidedBy;

import java.io.File;

/**
 * Created by andreas on 27.04.17.
 */
@ProvidedBy(DownloadFactory.class)
public interface DownloadService {

    enum RecoveryStatus {
        NO_FILE, RECOVERED, ERROR;
    }

    RecoveryStatus downloadIfPossible(RecoverableFile file);

    boolean hasMetadata();

    boolean connectedMetadata();

    double completedPercent(File parentDir);
}
