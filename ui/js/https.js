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

//requires notify.js

var notify = new Notify({
	message: 'We have detected you\'re not connecting via https. Press OK to redirect.',
	onAccept: function() {
		httpsRedirection();
	},
	onClose: function() {
		httpsRedirection();
	}
});

if ( location.protocol != 'https:' ) {
	notify.print();
}

function httpsRedirection() {
	window.location = 'https:' + window.location.href.substring(window.location.protocol.length);
}