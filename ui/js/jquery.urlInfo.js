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

function urlInfo() {

  function objectify( string ) {
    var obj = {};
    //splitting on &
    var amp = string.split('&');
    //splitting on =
    obj.h = amp[0];
    var eq;
    for ( var n = 1; n < amp.length; n++ ) {
      eq = amp[n].split('=');
      obj[eq[0]] = eq[1];
    }
    return obj;
  }
  function stringify( obj ) {
    var string = '';
    var keys = Object.keys(obj);
    string += obj.h;
    for ( var n = 1; n < keys.length; n++ ) {
      string += '&';
      string += keys[n]; //printing curreny key
      string += '=';
      string += obj[keys[n]]; //printing current value
    }
    return string;
  }

  function get() {
    var hashRaw = window.location.hash;
    var hash = hashRaw.substring(1, hashRaw.length);
    return objectify( hash );
  }
  function update( obj ) {
    window.location.hash = stringify( obj );
  }

  return {
    get: get,
    update: update
  }
}
