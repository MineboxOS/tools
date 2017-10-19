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

function Requester() {

  var xhr;

  var CONFIG = {
    cache: false,
    timeout: 55000 // ms, just under a minute
  };

  function setMethod(method) {
    CONFIG.method = method;
  }
  function setURL(url) {
    CONFIG.url = url;
  }
  function setData(data) {
    CONFIG.data = data;
  }
  function setType(type) {
    CONFIG.dataType = type;
  }
  function setContentType(type) {
    CONFIG.contentType = type;
  }
  function setCache(cache) {
    CONFIG.cache = cache;
  }
  function setCredentials(credentials) {
    CONFIG.xhrFields = {
      withCredentials: credentials
    };
  }
  function setTimeoutTime(time) {
    CONFIG.timeout = time;
  }
  function setTimeoutFunc(func) {
    timeoutFunction = func;
  }

  function abort() {
    xhr.abort();
  }

  function run( successCallback, errorCallback, callback_func ) {
    xhr = $.ajax(CONFIG)
    .done(function( data ) {
      successCallback( data );
    })
    .fail(function( response, textStatus ) {
      errorCallback( response );

      //executing timeout function if any
      if ( textStatus == 'timeout' && timeoutFunction ) {
        timeoutFunction();
      }
    })
    .always(function() {
      if (callback_func) { callback_func(); }
    });
  }

  return {
    setMethod: setMethod,
    setURL: setURL,
    setData: setData,
    setType: setType,
    setCache: setCache,
    setCredentials: setCredentials,
    setContentType: setContentType,
    setTimeoutTime: setTimeoutTime,
    setTimeoutFunc: setTimeoutFunc,
    abort: abort,
    run: run
  }
}
