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

function HashManager() {

	//vars
	var CONFIG = {
		lastHash: '',
		event: {
			target: 'body',
			name: 'hashChanged'
		}
	};



	function writeHash( hash ) {
		//function that writes the hash
		window.location.hash = hash;
		$(window).trigger('hashchange');
	}

	
	function readHash() {
		//function that reads the hash, removes the # and returns the string
		var hash = window.location.hash;
		return hash.substr( 1, window.location.hash.length );
	}



	function returnEventConfig() {
		//returns event configuration to ease listening the rising events
		return CONFIG.event;
	}


	window.onhashchange = function() {
		var currentHash = readHash();
		//if hash have changed
		if ( currentHash != CONFIG.lastHash ) {
			//update CONFIG.lastHash
			CONFIG.lastHash = currentHash;
			//rising an event
			$(CONFIG.event.target).trigger(CONFIG.event.name);
		}
	}




	return {
		write: writeHash,
		read: readHash,
		eventConfig: returnEventConfig
	}
}
var hashManager = HashManager();