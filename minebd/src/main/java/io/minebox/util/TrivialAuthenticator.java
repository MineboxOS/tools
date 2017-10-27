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

import java.security.Principal;
import java.util.Optional;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import io.dropwizard.auth.basic.BasicCredentials;
import io.minebox.config.MinebdConfig;

/**
 * Created by andreas on 12.05.17.
 */
@Singleton
public class TrivialAuthenticator implements Authenticator<BasicCredentials, Principal> {
    private final static Principal INSTANCE = () -> "Local Authenticated user";
    private final String password;

    @Inject
    public TrivialAuthenticator(MinebdConfig config) {
        password = FileUtil.readLocalAuth(config.authFile);
    }

    @Override
    public Optional<Principal> authenticate(BasicCredentials credentials) throws AuthenticationException {
        return credentials.getPassword().equals(password) ? Optional.of(INSTANCE) : Optional.empty();
    }
}
