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

import java.util.Optional;

import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.minebox.nbd.RemoteTokenService;
import io.swagger.annotations.Api;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path(RemoteTokenResource.PATH)
@Produces(MediaType.APPLICATION_JSON)
@Api(RemoteTokenResource.PATH)
@Singleton
public class RemoteTokenResource {
    public static final String PATH = "/auth";
    private static final Logger LOGGER = LoggerFactory.getLogger(RemoteTokenResource.class);
    private final RemoteTokenService remoteTokenService;


    @Inject
    public RemoteTokenResource(RemoteTokenService remoteTokenService) {
        this.remoteTokenService = remoteTokenService;
    }

    @GET
    @Path("/getMetadataToken")
    @Produces("text/plain")
    @PermitAll
    public Response getMetadataToken() {
        final Optional<String> token = remoteTokenService.getToken();
        if (token.isPresent()) {
            return Response.ok(token).build();
        } else {
            return Response.status(Response.Status.SERVICE_UNAVAILABLE).entity("unable to get token").build();
        }
    }
}