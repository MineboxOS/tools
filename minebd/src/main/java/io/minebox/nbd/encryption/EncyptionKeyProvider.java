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

import javax.annotation.Nullable;

import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.inject.ImplementedBy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by andreas on 18.05.17.
 */
@ImplementedBy(LazyEncyptionKeyProvider.class)
public interface EncyptionKeyProvider {
    Logger LOGGER = LoggerFactory.getLogger(EncyptionKeyProvider.class);

    ListenableFuture<String> getMasterPassword();

    String getImmediatePassword();

    default void onLoadKey(Runnable runnable) {
        Futures.addCallback(getMasterPassword(), new FutureCallback<String>() {
            @Override
            public void onSuccess(@Nullable String result) {
                runnable.run();
            }

            @Override
            public void onFailure(Throwable t) {
                LOGGER.error("failed to run callback " + runnable.toString() + " due to unexpected error while waiting for keyfile: ", t);
            }
        });
    }
}
