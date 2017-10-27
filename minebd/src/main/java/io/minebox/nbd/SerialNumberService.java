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

import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import com.google.inject.Inject;
import io.minebox.nbd.encryption.EncyptionKeyProvider;

/**
 * Created by andreas on 31.05.17.
 */
public class SerialNumberService {

    private final EncyptionKeyProvider encyptionKeyProvider;
    private String publicId;

    @Inject
    public SerialNumberService(EncyptionKeyProvider encyptionKeyProvider) {
        this.encyptionKeyProvider = encyptionKeyProvider;
    }

    public String getPublicIdentifier() {
        if (publicId == null) {
            publicId = buildPubId(encyptionKeyProvider.getImmediatePassword());
        }
        return publicId;
    }

    private String buildPubId(String key) {
        return Hashing.sha256().newHasher().putString("public", Charsets.UTF_8).putString(key, Charsets.UTF_8).hash().toString();
    }
}
