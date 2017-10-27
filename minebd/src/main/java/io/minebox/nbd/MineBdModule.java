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

import java.lang.reflect.Field;
import java.util.Set;

import com.codahale.metrics.MetricRegistry;
import com.google.common.collect.ImmutableSet;
import com.google.inject.*;
import com.google.inject.binder.LinkedBindingBuilder;
import com.google.inject.name.Names;
import com.google.inject.spi.Dependency;
import com.google.inject.spi.ProviderWithDependencies;
import io.minebox.config.ApiConfig;
import io.minebox.config.MinebdConfig;

/**
 * Created by andreas on 22.04.17.
 */
public class MineBdModule extends AbstractModule {

    @Override
    protected void configure() {
        bind(NbdStatsReporter.class).asEagerSingleton();
        bind(MetricRegistry.class).asEagerSingleton();
        bindMinebdConfigFields();

    }

    private void bindMinebdConfigFields() {
        for (Field field : MinebdConfig.class.getDeclaredFields()) {

            getObjectBinderFor(field)
                    .toProvider(new ProviderWithDependencies<Object>() {
                        private Provider<MinebdConfig> minebdConfig;

                        @Inject
                        public void setMinebdConfig(Provider<MinebdConfig> minebdConfig) {
                            this.minebdConfig = minebdConfig;
                        }

                        @Override
                        public Object get() {
                            final MinebdConfig minebdConfig = this.minebdConfig.get();
                            try {
                                return field.get(minebdConfig);
                            } catch (IllegalAccessException e) {
                                throw new RuntimeException("unable to do injection of " + field.getName(), e);
                            }
                        }

                        @Override
                        public Set<Dependency<?>> getDependencies() {
                            return ImmutableSet.of(Dependency.get(Key.get(MinebdConfig.class)));
                        }
                    });
        }
    }

    @SuppressWarnings("unchecked")
    private LinkedBindingBuilder<Object> getObjectBinderFor(Field field) {
        return (LinkedBindingBuilder<Object>) bind(TypeLiteral.get(field.getGenericType()))
                .annotatedWith(Names.named(field.getName()));
    }

    @Provides
    public MinebdConfig getConfig(ApiConfig apiConfig) {
        return apiConfig.minebd;
    }
}
