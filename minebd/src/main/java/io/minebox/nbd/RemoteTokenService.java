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

import java.time.Instant;
import java.util.Optional;

import com.google.common.base.Charsets;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.inject.Inject;
import com.google.inject.name.Named;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import io.minebox.nbd.encryption.EncyptionKeyProvider;
import org.bitcoinj.core.ECKey;
import org.bitcoinj.core.Sha256Hash;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by andreas on 21.05.17.
 */
public class RemoteTokenService {
    private static final Logger LOGGER = LoggerFactory.getLogger(RemoteTokenService.class);
    final private EncyptionKeyProvider encyptionKeyProvider;
    private final String rootPath;

    @Inject
    public RemoteTokenService(@Named("httpMetadata") String rootPath, EncyptionKeyProvider encyptionKeyProvider) {
        this.rootPath = rootPath;
        this.encyptionKeyProvider = encyptionKeyProvider;
    }

    public Optional<String> getToken() {
        final ListenableFuture<String> masterPassword = encyptionKeyProvider.getMasterPassword();
        if (!masterPassword.isDone()) {
            return Optional.empty();
        }
        final String key = encyptionKeyProvider.getImmediatePassword();
        final String s = key + " meta";
        final ECKey privKey = ECKey.fromPrivate(Sha256Hash.twiceOf(s.getBytes(Charsets.UTF_8)).getBytes());

/*
        @POST
        @Path("/token")
        @Produces(MediaType.APPLICATION_OCTET_STREAM)
        public Response createToken(@QueryParam("timestamp") Long nonce, @QueryParam("signature") String signature) {
*/

//        }
        final long timeStamp = Instant.now().toEpochMilli();
        try {
            final String url = rootPath + "auth/token";
            final HttpResponse<String> token = Unirest.post(url)
                    .queryString("timestamp", timeStamp)
                    .queryString("signature", privKey.signMessage(String.valueOf(timeStamp)))
                    .asString();
            if (token.getStatus() != 200) {
                return Optional.empty();
            }
            return Optional.of(token.getBody());
        } catch (UnirestException e) {
            LOGGER.error("exception from remote service when trying to get token", e);
            return Optional.empty();
        }

    }

}
