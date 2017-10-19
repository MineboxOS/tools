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

//requires tabNavigator & hashManager
function ProgressScreen() {

	var $progressScreenElement = $('#progress-screen');
	var loadingSpace = LoadingSpace();
	var mineboxProcess = null;

	function open(pro) {

		//updating mineboxProcess
		mineboxProcess = pro;

		//init loading space animation
		loadingSpace.init();
		//change hash
		hashManager.write('running');
		//hide all views
		tabNavigator.hideAll(function() {
			//disable tabNavigator 
			tabNavigator.disable();
			//display progress screen
			$progressScreenElement.fadeIn(300);

			//call to rockstorLogin
			rockstorLogin.init(function() {
				//faking "loading screen"
				bootLog(function() {
					//redirecting to home
					window.location.href = '/home';
				});
			});
		});
	}

	function getProcess() {
		return mineboxProcess;
	}

	function bootLog(cb) {
		var $bootLog = $('#boot-log input');
		var n = 0;
		var checkingInt = null;
		var int = setInterval(interval, 3000);

		interval();
		function interval() {
			if ( n > 0) {
				check( $($bootLog[n-1]) );
			}
			checking( $($bootLog[n]) );

			if ( n == $bootLog.length ) {
				clearInterval(int);
				clearInterval(checkingInt);
				if ( cb ) { cb() }
			}

			n++;
		}

		function check( $element ) {
			$element.prop('checked', true);
		}

		function checking( $element ) {
			if ( checkingInt ) {
				clearInterval(checkingInt);
				checkingInt = null;
			}
			checkingInt = setInterval(checkingIntervalFunction, 500); //interval exec
			checkingIntervalFunction(); //first exec
			function checkingIntervalFunction() {
				if ( $element.prop('checked') ) {
					$element.prop('checked', false);
				} else {
					check($element);
				}
			}
		}
	}



	return {
		open: open,
		getProcess: getProcess
	}

}
var progressScreen = ProgressScreen();