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

//requires hashManager & progressScreen

function TabNavigator( data ) {

	//data contains
		//buttons DOM selection
		//tabs DOM selection
		//defaultTab string id

	var $buttons = data.buttons;
	var $tabs = data.tabs;



	//vars
	var CONFIG = {
		events: {
			tabShown: {
				name: 'tabShown'
			}
		},
		animationDuration: 600,
		defaultTab: data.defaultTab
	};




	function go( string ) {
		//write hash
		hashManager.write(string);
	}



	function hideAll(cb) {
		$tabs.fadeOut( CONFIG.animationDuration / 2);
		setTimeout(function() {
			$('html,body').scrollTop(0);
			if (cb) {cb();}
		}, CONFIG.animationDuration / 2);

	}




	function showTab($tab,cb) {
		//hidding all tabs
		hideAll(function() {
			$tab.trigger(CONFIG.events.tabShown.name)
				.fadeIn(CONFIG.animationDuration, function() {
				if (cb) {cb();}
			});
		});
	}




	function disable() {
		$(CONFIG.events.hash.target).unbind(CONFIG.events.hash.name);
	}




	$buttons.on('click', function() {
		if ( !$(this).attr('data-disabled') ) {
			go( $(this).attr('data-go') );
		}
	});




	$(document).ready(function() {

		//read hash
		var hash = hashManager.read();

		//sets CONFIG.events.hash configuration inherited from hashManager
		CONFIG.events.hash = hashManager.eventConfig();

		//binding events
		//changed hash
		$(CONFIG.events.hash.target).bind(CONFIG.events.hash.name, function() {
			//reading hash again
			hash = hashManager.read();
			//finding the tab
			var $theTab = null;
			for ( var n = 0; n < $tabs.length; n++ ) {
				if ( $($tabs[n]).attr('data-tab') == hash ) {
					$theTab = $($tabs[n]);
					break;
				}
			}
			if ( $theTab ) {
				//the tab exists
				//show tab
				showTab($theTab);
			}
		});

		if ( !hash.length ) {
			go( CONFIG.defaultTab );
		} else if ( hash != 'running' ) {
			go( hash );
		} else {
			progressScreen.open();
		}

	});

	return {
		go: go,
		hideAll: hideAll,
		disable: disable
	}

}