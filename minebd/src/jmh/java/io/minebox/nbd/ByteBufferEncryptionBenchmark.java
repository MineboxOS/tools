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

package io.minebox.nbd;

import io.minebox.nbd.encryption.BitPatternGenerator;
import io.minebox.nbd.encryption.BitPatternGeneratorTest;
import org.openjdk.jmh.annotations.Benchmark;
import org.openjdk.jmh.annotations.Scope;
import org.openjdk.jmh.annotations.State;

/**
 * Created by andreas on 11.04.17.
 */
@State(value = Scope.Benchmark)
public class ByteBufferEncryptionBenchmark {
    private static ByteBufferEncryptionTest t = new ByteBufferEncryptionTest();
    private BitPatternGenerator bitPatternGenerator;

    final BitPatternGeneratorTest test = new BitPatternGeneratorTest();

    @Benchmark
    public void testSecureRandom() throws Exception {
        test.testSecureRandom();
    }

    @Benchmark
    public void testGuava() throws Exception {
        test.testGuava();
    }

    @Benchmark
    public void testDigest() throws Exception {
        test.testMD();
    }
}
