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

package io.minebox.resource;

import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import com.google.common.util.concurrent.ListenableFuture;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.minebox.nbd.SiaSeedService;
import io.minebox.nbd.download.DownloadFactory;
import io.minebox.nbd.encryption.EncyptionKeyProvider;
import io.swagger.annotations.Api;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by andreas on 05.07.17.
 */
@Path(SiaWalletSeed.PATH)
@Singleton
@Api(SiaWalletSeed.PATH)
public class SiaWalletSeed {

    public static final String PATH = "siawalletseed";
    private static final Logger LOGGER = LoggerFactory.getLogger(SiaWalletSeed.class);
    private final SiaSeedService siaSeedService;
    private final EncyptionKeyProvider encyptionKeyProvider;
    private final DownloadFactory downloadFactory;

    @Inject
    public SiaWalletSeed(SiaSeedService siaSeedService, EncyptionKeyProvider encyptionKeyProvider, DownloadFactory downloadFactory) {
        this.siaSeedService = siaSeedService;
        this.encyptionKeyProvider = encyptionKeyProvider;
        this.downloadFactory = downloadFactory;
    }

    @GET
    @Produces("text/plain")
    @PermitAll
    public Response getSerialNumber() {
        final ListenableFuture<String> masterPassword = encyptionKeyProvider.getMasterPassword();
        if (!masterPassword.isDone()) {
            final String msg = "Key is not set yet..";
            LOGGER.warn(msg);
            return Response.status(Response.Status.PRECONDITION_FAILED)
                    .entity(msg)
                    .build();
        } else if (!downloadFactory.hasDownloadService()) {
            final String msg = "Key set, but download service not initialized";
            LOGGER.warn(msg);
            return Response.status(Response.Status.PRECONDITION_FAILED)
                    .entity(msg)
                    .build();

        } else {
            return Response
                    .ok(siaSeedService.getSiaSeed())
                    .build();
        }
    }
}
