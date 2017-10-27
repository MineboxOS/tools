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

import java.time.Instant;
import java.time.ZoneId;

import javax.annotation.security.PermitAll;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import io.minebox.nbd.ep.MineboxExport;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path(PauseResource.PATH)
@Produces(MediaType.APPLICATION_JSON)
@Api(PauseResource.PATH)
@Singleton
public class PauseResource {
    public static final String PATH = "/pause";
    private static final Logger LOGGER = LoggerFactory.getLogger(PauseResource.class);

    private final Provider<MineboxExport> mineboxExportProvider;

    @Inject
    public PauseResource(Provider<MineboxExport> mineboxExportProvider) {
        this.mineboxExportProvider = mineboxExportProvider;
    }

    @PUT
    @ApiOperation(value = "causes the MineBD deamon to not flush files for 1.5 seconds. this is to avoid having nonequal .dat files with equal last-write date",
            response = String.class)

    @Produces("text/plain")
    @PermitAll
    public String pause() {
        final Instant instant = mineboxExportProvider.get().blockFlushFor1500Millis();
        return "Not flushing files until " + instant.atZone(ZoneId.systemDefault()).toString() + "\n";
    }


}