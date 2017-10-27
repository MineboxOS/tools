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

package io.minebox.nbd.transmission;

import io.netty.buffer.ByteBuf;

class OperationParameters {

    static final OperationParameters LIMBO_STATE = new OperationParameters(State.LIMBO);
    static final OperationParameters RECEIVE_STATE = new OperationParameters(State.TM_RECEIVE_CMD);

    final short cmdFlags;
    final short cmdType;
    final long cmdHandle;
    final long cmdOffset;
    final long cmdLength;
    final State state;

    private OperationParameters(ByteBuf message) {
        cmdFlags = message.readShort();
        cmdType = message.readShort();
        cmdHandle = message.readLong();
        cmdOffset = message.readLong();
        cmdLength = message.readUnsignedInt();
        state = State.TM_RECEIVE_CMD_DATA;
    }

    private OperationParameters(State state) {
        this.state = state;
        cmdFlags = -1;
        cmdType = -1;
        cmdHandle = -1;
        cmdOffset = -1;
        cmdLength = -1;
    }

    static OperationParameters readFromMessage(ByteBuf message) {
        return new OperationParameters(message);
    }
}
