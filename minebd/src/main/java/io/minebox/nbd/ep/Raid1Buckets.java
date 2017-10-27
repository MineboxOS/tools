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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.List;

public class Raid1Buckets implements Bucket {
    private static final Logger LOGGER = LoggerFactory.getLogger(Raid1Buckets.class);
    private final List<Bucket> buckets;
    private final int bucketIndex;

    public Raid1Buckets(List<Bucket> buckets, int bucketIndex) {
        this.buckets = buckets;
        this.bucketIndex = bucketIndex;
    }

    @Override
    public long putBytes(long offset, ByteBuffer message) throws IOException {
        long bytes = -1;
        for (Bucket bucket : buckets) {
            final ByteBuffer duplByteBuffer = message.duplicate();
            final long written = bucket.putBytes(offset, duplByteBuffer);
            if (bytes != -1 && written != bytes) {
                LOGGER.warn("unexpected differences when writing in bucket:{} lastWritten: {}, nowWritten: {}", bucket.bucketIndex(), bytes, written);
            }
            bytes = written;
        }
        return bytes;
    }

    @Override
    public void trim(long offset, long length) throws IOException {
        for (Bucket bucket : buckets) {
            bucket.trim(offset, length);
        }
    }

    @Override
    public long getBaseOffset() {
        return getDominantBucket().getBaseOffset();
    }

    @Override
    public long getUpperBound() {
        return getDominantBucket().getUpperBound();
    }

    private Bucket getDominantBucket() {
        return buckets.get(getDominantIndex());
    }

    @Override
    public void close() throws IOException {
        for (Bucket bucket : buckets) {
            bucket.close();
        }
    }

    @Override
    public void flush() throws IOException {
        for (Bucket bucket : buckets) {
            bucket.flush();
        }
    }

    @Override
    public long getBytes(ByteBuffer writeInto, long offsetForThisBucket, int length) throws IOException {
        return getDominantBucket().getBytes(writeInto, offsetForThisBucket, length);
    }

    @Override
    public long bucketIndex() {
        return bucketIndex;
    }

    private int getDominantIndex() {
        return bucketIndex % buckets.size();
    }

    @Override
    public long calcLengthInThisBucket(long offsetInThisBucket, long length) {
        return getDominantBucket().calcLengthInThisBucket(offsetInThisBucket, length);
    }
}
