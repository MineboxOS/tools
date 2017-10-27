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

import java.io.IOException;
import java.nio.ByteBuffer;

import com.google.inject.ImplementedBy;

@ImplementedBy(MineboxExport.class)
public interface ExportProvider {

    long open(CharSequence exportName) throws IOException;

    ByteBuffer read(long offset, int length) throws IOException;

    void write(long offset, ByteBuffer message, boolean sync) throws IOException;

    void flush() throws IOException;

    void trim(long offset, long length) throws IOException;

    default boolean supportsClientFlags(int clientFlags) {
        return true; //todo find out what those actually do
    }

    void close() throws IOException;
}
