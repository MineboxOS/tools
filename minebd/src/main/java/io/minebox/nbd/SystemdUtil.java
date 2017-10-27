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

import info.faljse.SDNotify.SDNotify;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class SystemdUtil {
    private static final boolean hasEnv;
    private final static Logger LOGGER = LoggerFactory.getLogger(SystemdUtil.class);

    static {
        final String notifySocket = System.getenv().get("NOTIFY_SOCKET");
        hasEnv = !(notifySocket == null || notifySocket.length() == 0);
        if (!hasEnv) {
            LOGGER.info("we appear to run outside systemd");
        } else {
            LOGGER.info("we appear to run inside systemd");
        }
    }

    void sendStopping() {
        LOGGER.info("sendStopping");
        if (hasEnv) {
            SDNotify.sendStopping();
        }
    }

    void sendError(int errno) {
        LOGGER.info("sendErrno {}", errno);
        if (hasEnv) {
            SDNotify.sendErrno(errno);
        }
    }

    void sendNotify() {
        LOGGER.info("sendNotify");
        if (hasEnv) {
            SDNotify.sendNotify();
        }
    }
}
