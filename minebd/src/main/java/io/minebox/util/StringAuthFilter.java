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

package io.minebox.util;

import java.io.IOException;
import java.security.Principal;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.container.ContainerRequestContext;

import io.dropwizard.auth.AuthFilter;

/**
 * Created by andreas on 12.05.17.
 */
public class StringAuthFilter<P extends Principal> extends AuthFilter<String, P> {
    private final static String X_AUTH_TOKEN_HEADER = "X-Auth-Token";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        final String credentials =
                requestContext.getHeaders().getFirst(X_AUTH_TOKEN_HEADER);
        if (!authenticate(requestContext, credentials, "SCHEME")) {
            throw new WebApplicationException(unauthorizedHandler.buildResponse(prefix, realm));
        }
    }
}
