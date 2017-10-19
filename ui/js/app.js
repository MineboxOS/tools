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

var viewLoader = new ViewLoader( config.views );
var urlInfo = new urlInfo();
var nav = new Nav();

$(document).ready(function() {
  //starts the loop for navigator
  viewLoader.loop();

  //bind #menu li buttons to nav func
  $(config.views.buttons.selector).on('click', function() {
    nav.go( $(this).attr('data-go') );
  });

  //displaying do smth (dummy message) [index.html]
  //setTimeout(function() {$('#dummy-message').fadeIn(100);},500);
  //Loading dashboard instead:
  if ( !window.location.hash ) {
    nav.go('dashboard');
  }
});
