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

import com.google.common.eventbus.SubscriberExceptionContext;
import com.google.common.eventbus.SubscriberExceptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GlobalErrorHandler implements SubscriberExceptionHandler, Thread.UncaughtExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalErrorHandler.class);

    public static void handleError(String message, Throwable exception) {
        LOGGER.error(message, exception);
    }

    @Override
    public void handleException(Throwable exception, SubscriberExceptionContext context) {
        handleError("error in thread '" + Thread.currentThread().getName()
                + "' dispatching event to " + context.getSubscriber().getClass() + "." + context.getSubscriberMethod().getName(), exception);
    }

    @Override
    public void uncaughtException(Thread t, Throwable e) {
        handleError("uncaught exception in thread " + t.getName(), e);
    }

}
