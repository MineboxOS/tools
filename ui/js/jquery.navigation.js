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

/* Requires urlInfo.js to work */

/*
## Navigation system functions. Plan & Explain.

The system will consist of three functions (each on each own file):
nav();
viewLoader();
urlInfo();

The first two functions will require the third to work properly. Let's see each of them separately.


## nav();
Initially nav() will contain go() for doing the navigation work. This function (go()) must be called every time a button or whatever element intended for navigation is clicked, and it will receive as a parameter the "targetID" of the view we are calling to.
nav.go(); must receive as a parameter a target which is the content ID that must be specified on the config file


## viewLoader();
This function will be the responsible of actually showing the requested content into #content. And hiding actual displayed content. It will consist into a loop that will be constantly executed on a interval, reading the url, getting the # value and, when notice a difference: do the job.


## urlInfo();
This function will contain two functions: get(); and update();
When get() is executed, it will read the url and return an object made up with everything it finds on window.location.hash.
When update( obj ) is executed, it expects as parameter an object with the same construction that get() returns. It processes the object, making it up in a string, and updates the url with window.location.hash.

The format of the object will be as it follows:
{
  h: "string", ##whatever it was on the hash without the '#'
  key1: value1, ##the rest of the values separated by '&'
  key2: value2,
  key3: value3,
  ...
}
The format of the string must be like this:
 #[viewID]&key1=value1&key2=value2&key3=value3...
It is mandatory that the rest of the values in the string to be a set of key=value.
 */

function Nav() {

  function go( target ) {
    var obj = urlInfo.get();
    //rising closing event for #obj.h
    $('body').trigger(obj.h + '-close');
    obj.h = target;
    //rising opening event for #obj.h
    $('body').trigger(obj.h + '-open');
    urlInfo.update( obj );
  }

  return {
    go: go
  }
}
