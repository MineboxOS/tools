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

/**
 * Created by andreas on 24.04.17.
 */
public interface Bucket {
    long putBytes(long offset, ByteBuffer message) throws IOException;

    void trim(long offset, long length) throws IOException;

    long getBaseOffset();

    long getUpperBound();

    void close() throws IOException;

    long calcLengthInThisBucket(long offsetInThisBucket, long length);

    void flush() throws IOException;

    long getBytes(ByteBuffer writeInto, long offsetForThisBucket, int length) throws IOException;

    long bucketIndex();
}
