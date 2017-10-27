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

package io.minebox.nbd.encryption;

import java.nio.ByteBuffer;

import com.google.inject.Inject;
import io.minebox.nbd.Encryption;

/**
 * Created by andreas on 11.04.17.
 */
public class SymmetricEncryption implements Encryption {
    private final EncyptionKeyProvider encyptionKeyProvider;
    private BitPatternGenerator bitPatternGenerator;

    @Inject
    public SymmetricEncryption(EncyptionKeyProvider encyptionKeyProvider) {
        this.encyptionKeyProvider = encyptionKeyProvider;
    }

    @Override
    public ByteBuffer encrypt(long offset, ByteBuffer message) {
        return encrypt(offset, message.remaining(), message);
    }


    private ByteBuffer encrypt(long offset, int msgSize, ByteBuffer plainBuffer) {
        byte[] blockXor = new byte[0];
        long curentBlockNumber = -1;
        final ByteBuffer result = ByteBuffer.wrap(new byte[msgSize]);

        while (plainBuffer.remaining() > 0) {
            final int pos = plainBuffer.position();

            long blockNumber = (pos + offset) / EncConstants.BLOCKSIZE;
            if (curentBlockNumber != blockNumber) {
                blockXor = createBlockXor(blockNumber);
            }
            curentBlockNumber = blockNumber;
            final byte value = plainBuffer.get();
            final int xorBlockIndex = pos % EncConstants.BLOCKSIZE;
            final byte encrypted = (byte) ((value ^ blockXor[xorBlockIndex]) & 0xFF);
            result.put(encrypted);
        }
        result.flip();
        return result;
    }

    private byte[] createBlockXor(long blockNumber) {
        if (bitPatternGenerator == null) {
            bitPatternGenerator = new BitPatternGenerator(encyptionKeyProvider.getImmediatePassword());
        }
        return bitPatternGenerator.createDeterministicPattern(blockNumber);
    }
}
