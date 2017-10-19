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

/* jsing dashboard */
viewLoader.add('dashboard', Dashboard);


//interval handler
var dashboardLoopFunction = null;
// requires
	//requester.js
	//loadingManager.js
	//replaceAll();
	//getRandomString();
	//getRandomInt();
	//formatDate();
function Dashboard() {
  

	var CONFIG = {
		api: {
			mineboxStatus: {
				url: config.mug.url + 'status',
				requester: new Requester()
			},
			siaStatus: {
				url: config.mug.url + 'sia/status',
				requester: new Requester()
			},
			backupStatus: {
				url: config.mug.url + 'backup/latest/status',
				requester: new Requester()
			}
		},
		events: {
			mineboxStatus: {
				updated: 'mineboxStatusUpdated',
				failed: 'mineboxStatusFailed'
			},
			siaStatus: {
				updated: 'siaStatusUpdated',
				failed: 'siaStatusFailed'
			},
			backupStatus: {
				updated: 'backupStatusUpdated',
				failed: 'backupStatusFailed'
			}
		},
		LEDColors: {
			loading: 'loading',
			good: 'good',
			bad: 'bad',
			check: 'check'
		},
		loop: {
			func: null, //setInterval handler
			time: 60000 // refresh time in ms
		},
		errorHandler: {
			template: '<div style="display:none;" id="{{id}}" class="{{type}} dashboard-notification"><div class="icon-box"><i class="ic ic-cross"></i><i class="ic ic-checkmark"></i><i class="ic ic-warning"></i></div><div class="notification-content"><h3 class="notification-title" style="display:{{title-visibility}}">{{title}}</h3><p class="notification-text">{{message}}</p></div></div>',
			fadeSpeed: 300,
			autoExpire: true,
			autoExpireTimeout: 5000
		},
		messages: {
			mineboxStatusFailed: 'Minebox Status not updated or request timed out. Retrying in several seconds.',
			siaStatusFailed: 'Sia Status not updated or request timed out. Retrying in several seconds.',
			mineBDFailed: 'Looks like Minebox is not running well. Try rebooting your system. If the problem persist, please reach us at minebox.io/support.',
			consensusNotSynced: 'Minebox is currently syncing with consensus. This operation may take up to several hours depending on your Internet connection.',
			walletLockedOrNotEncrypted: 'Minebox wallet is not ready now. If this state remains for more than a few hours, please reach us for support at minebox.io/support',
			backupStatusFailed: 'Latest backup not updated or request timed out. Retrying in several seconds.',
			backupPending: 'You backup will start uploading soon. Please be patient.',
			backupDamaged: 'Last backup seems to be damaged. This can be a temporal error.',
			backupError: 'There\'s an error with your latest backup. Please reach us at minebox.io/support',
			backupMetadataError: 'There\'s an error with your latest backup. Please reach us at minebox.io/support',
			backupUnknown: 'We\'re getting an unknown status for your backup. Retrying in several seconds.'
		}
	};

	//global object for last updated status
	var STATUS = {
		mineboxStatus: {},
		siaStatus: {},
		backupStatus: {}
	};



	//witness elements
	var $minebd_running_witness = $('#minebd_running_witness'),
		$minebd_encrypted_witness = $('#minebd_encrypted_witness'),
		$minebd_storage_mounted_witness = $('#minebd_storage_mounted_witness'),
		$sia_daemon_running_witness = $('#sia_daemon_running_witness'),
		$consensus_synced_witness = $('#consensus_synced_witness'),
		$consensus_height_witness = $('#consensus_height_witness'),
		$contracts_witness = $('#contracts_witness'),
		$wallet_unlocked_witness = $('#wallet_unlocked_witness'),
		$wallet_encrypted_witness = $('#wallet_encrypted_witness'),
		$wallet_balance_witness = $('#wallet_balance_witness'),
		$wallet_unconfirmed_balance_witness = $('#wallet_unconfirmed_balance_witness'),
		$backup_widget = $('#backup-widget'),
		$backup_name = $('#backup_name'),
		$backup_progress_bar = $('#backup-widget .widget-progress-bar .fill'),
		$backup_progress_bar_value = $('#backup-widget .widget-progress-bar .percent-witness .value'),
		$backup_timestamp_witness = $('#backup_timestamp_witness'),
		$backup_status_witness = $('#backup_status_witness'),
		$backup_metadata_witness = $('#backup_metadata_witness'),
		$backup_files_number_witness = $('#backup_files_number_witness'),
		$backup_size_witness = $('#backup_size_witness'),
		$backup_relative_size_witness = $('#backup_relative_size_witness'),
		$backup_progress_witness = $('#backup_progress_witness'),
		$backup_relative_progress_witness = $('#backup_relative_progress_witness');



	//LED elements
	var $mineboxStatusLED = $('#status-widget .widget-led-status'),
		$networkStatusLED = $('#network-widget .widget-led-status'),
		$walletStatusLED = $('#wallet-widget .widget-led-status'),
		$backupStatusLED = $('#backup-widget .widget-led-status');




	//getters
	function getMineboxStatus() {
		//adding witness to loop.activeRequests
		loop.addActiveRequest('minebox');

		//requesting status/
		CONFIG.api.mineboxStatus.requester.setURL( CONFIG.api.mineboxStatus.url );
		CONFIG.api.mineboxStatus.requester.setCache(false);
		CONFIG.api.mineboxStatus.requester.setCredentials(true);

		var failedData = {
			id: 'mineboxStatusFailed',
			type: 'error',
			message: CONFIG.messages.mineboxStatusFailed,
			autoExpire: false
		};

		CONFIG.api.mineboxStatus.requester.setTimeoutFunc(function() {
			//changing led color to loading
			mineboxLEDColor( CONFIG.LEDColors.loading );
			//not printing any error because time expiration executes also FAIL function
		});
		CONFIG.api.mineboxStatus.requester.run(function(response) {
			// If an error exists, remove it.
			dashboardErrorHandler.remove(failedData.id);

			//update global object
			STATUS.mineboxStatus = response;
			//rise event
			$('body').trigger(CONFIG.events.mineboxStatus.updated);
			//remove witness from loop
			loop.removeActiveRequest('minebox');

		}, function(error) {
			//display error
			dashboardErrorHandler.print(failedData);
			//update global object (with empty data)
			STATUS.mineboxStatus = {};
			//rise event
			$('body').trigger(CONFIG.events.mineboxStatus.failed);
			//remove witness from loop
			loop.removeActiveRequest('minebox');

		});
	}





	function getSiaStatus() {
		//adding witness to loop.activeRequests
		loop.addActiveRequest('sia');

		//requesting sia/status/
		CONFIG.api.siaStatus.requester.setURL( CONFIG.api.siaStatus.url );
		CONFIG.api.siaStatus.requester.setCache(false);
		CONFIG.api.siaStatus.requester.setCredentials(true);
		CONFIG.api.siaStatus.requester.setTimeoutFunc(function() {
			//changing led color to loading
			siaLEDColor( CONFIG.LEDColors.loading );
			//not printing any error because time expiration executes also FAIL function
		});

		var failedData = {
			id: 'siaStatusFailed',
			type: 'error',
			message: CONFIG.messages.siaStatusFailed,
			autoExpire: false
		};

		CONFIG.api.siaStatus.requester.run(function(response) {
			// If an error exists, remove it.
			dashboardErrorHandler.remove(failedData.id);

			//update global object
			STATUS.siaStatus = response;
			//rise event
			$('body').trigger(CONFIG.events.siaStatus.updated);
			//remove witness from loop
			loop.removeActiveRequest('sia');

		}, function(error) {
			//display error
			dashboardErrorHandler.print(failedData);
			//update global object (with empty data)
			STATUS.siaStatus = {};
			//rise event
			$('body').trigger(CONFIG.events.siaStatus.failed);
			//remove witness from loop
			loop.removeActiveRequest('sia');

		});
	}





	function getBackupStatus() {
		//adding witness to loop.activeRequests
		loop.addActiveRequest('backup');

		//requesting backup/latest/status/
		CONFIG.api.backupStatus.requester.setURL( CONFIG.api.backupStatus.url );
		CONFIG.api.backupStatus.requester.setMethod( 'GET' );
		CONFIG.api.backupStatus.requester.setCache(false);
		CONFIG.api.backupStatus.requester.setCredentials(true);
		CONFIG.api.backupStatus.requester.setTimeoutFunc(function() {
			//changing led color to loading
			backupLEDColor( CONFIG.LEDColors.loading );
			//not printing any error because time expiration executes also FAIL function
		});

		var failedData = {
			id: 'backupStatusFailed',
			type: 'error',
			message: CONFIG.messages.backupStatusFailed,
			autoExpire: false
		};

		CONFIG.api.backupStatus.requester.run(function(response) {
			// If an error exists, remove it.
			dashboardErrorHandler.remove(failedData.id);

			//update global object
			STATUS.backupStatus = response;
			/*
			//use the following object to test different responses
			STATUS.backupStatus = {
			  metadata: "PENDING", 
			  name: "1503494102", 
			  numFiles: 200, 
			  progress: 60.77108501803187, 
			  relative_progress: 50.0, 
			  relative_size: 6733983744, 
			  size: 8264986624, 
			  status: "PENDING", 
			  time_snapshot: 1503494102
			}*/
			//rise event
			$('body').trigger(CONFIG.events.backupStatus.updated);
			//remove witness from loop
			loop.removeActiveRequest('backup');

		}, function(error) {
			//display error
			dashboardErrorHandler.print(failedData);
			//update global object (with empty data)
			STATUS.backupStatus = {};
			//rise event
			$('body').trigger(CONFIG.events.backupStatus.failed);
			//remove witness from loop
			loop.removeActiveRequest('backup');

		});
	}







	//fillers
	//those functions will be executed on events
	function fillMineboxStatus() {
		//fill in all the fields relative to ajax call: getMineboxStatus()
		$minebd_running_witness.text( STATUS.mineboxStatus.minebd_running + '' );
		$minebd_encrypted_witness.text( STATUS.mineboxStatus.minebd_encrypted + '' );
		$minebd_storage_mounted_witness.text( STATUS.mineboxStatus.minebd_storage_mounted + '' );
		$sia_daemon_running_witness.text( STATUS.mineboxStatus.sia_daemon_running + '' );
	}

	function fillSiaStatus() {
		//fill in all the fields relative to ajax call: getSiaStatus()
		if (STATUS.siaStatus.consensus.synced) {
			$consensus_synced_witness.text( 'Synced' );
		} else if (STATUS.siaStatus.consensus.synced == false) {
			$consensus_synced_witness.text( STATUS.siaStatus.consensus.sync_progress + '%' );
		} else {
			$consensus_synced_witness.text( '-' );
		}
		$consensus_height_witness.text( STATUS.siaStatus.consensus.height + '' );
		$contracts_witness.text( STATUS.siaStatus.renting.contracts + '' );
		$wallet_unlocked_witness.text( STATUS.siaStatus.wallet.unlocked + '' );
		$wallet_encrypted_witness.text( STATUS.siaStatus.wallet.encrypted + '' );
		$wallet_balance_witness.text( STATUS.siaStatus.wallet.confirmed_balance_sc + ' SC' );
		$wallet_unconfirmed_balance_witness.text( STATUS.siaStatus.wallet.unconfirmed_delta_sc + ' SC' );
	}




	function fillBackupStatus() {
		//converting values
		if ( STATUS.backupStatus.numFiles < 0 ) {
			STATUS.backupStatus.numFiles = 'Loading';
		}
		if ( STATUS.backupStatus.size < 0 ) {
			STATUS.backupStatus.size = 'Loading';
		} else {
			STATUS.backupStatus.size = formatNumber( parseInt( STATUS.backupStatus.size ) / 1000000 ) + ' MB';
		}
		if ( STATUS.backupStatus.relative_size < 0 ) {
			STATUS.backupStatus.relative_size = 'Loading';
		} else {
			STATUS.backupStatus.relative_size = formatNumber( parseInt( STATUS.backupStatus.relative_size ) / 1000000 ) + ' MB';
		}
		var d = new Date( STATUS.backupStatus.time_snapshot * 1000 );
		d = formatDate( d, 'HH:mm dd/MM/yyyy' );
		//fill in all the fields relative to ajax call: getBackupStatus()
		$backup_name.html( STATUS.backupStatus.name );
		$backup_progress_bar.width( STATUS.backupStatus.progress.toFixed(2) + '%');
		$backup_progress_bar_value.html( STATUS.backupStatus.progress.toFixed(2) + '%' );
		$backup_timestamp_witness.html( d );
		$backup_status_witness.html( STATUS.backupStatus.status );
		$backup_metadata_witness.html( STATUS.backupStatus.metadata );
		$backup_files_number_witness.html( STATUS.backupStatus.numFiles );
		$backup_size_witness.html( STATUS.backupStatus.size );
		$backup_relative_size_witness.html( STATUS.backupStatus.relative_size );
		$backup_progress_witness.html( STATUS.backupStatus.progress.toFixed(2) + '%' );
		$backup_relative_progress_witness.html( STATUS.backupStatus.relative_progress.toFixed(2) + '%' );
	}







	//those functions indicate the LED color for each of the widgets
	function mineboxLEDColor( LEDColor ) {
		if ( !$.isEmptyObject( STATUS.mineboxStatus ) ) {
			//there is data within mineboxStatus
			var failedData = {
				id: 'mineBDFailed',
				type: 'error',
				message: CONFIG.messages.mineBDFailed,
				autoExpire: false
			};

			if ( !STATUS.mineboxStatus.minebd_running || !STATUS.mineboxStatus.sia_daemon_running ) {
				//A reboot may help, but otherwise, Minebox support is needed.
				//changing LED color to red
				$mineboxStatusLED.attr('data-led', CONFIG.LEDColors.bad);
				//print error
				dashboardErrorHandler.print(failedData);
			} else {
				//changing LED color to green
				$mineboxStatusLED.attr('data-led', CONFIG.LEDColors.good);
				// If an error exists, remove it.
				dashboardErrorHandler.remove(failedData.id);

			}

		} else {
			//change to loading
			$mineboxStatusLED.attr('data-led', CONFIG.LEDColors.loading);
		}

		if ( LEDColor ) {
			$mineboxStatusLED.attr('data-led', LEDColor);
		}
	}



	function networkLEDColor( LEDColor ) {
		if ( !$.isEmptyObject( STATUS.siaStatus ) ) {
			//there is data within siaStatus
			var errorData = {
				id: 'consensusNotSynced',
				type: 'warning',
				message: CONFIG.messages.consensusNotSynced,
				autoExpire: false
			};

			if ( !STATUS.siaStatus.consensus.synced ) {
				//changing LED color to YELLOW
				$networkStatusLED.attr('data-led', CONFIG.LEDColors.check);
				//print error
				dashboardErrorHandler.print(errorData);
			} else {
				//changing LED color to green
				$networkStatusLED.attr('data-led', CONFIG.LEDColors.good);
				// If an error exists, remove it.
				dashboardErrorHandler.remove(errorData.id);
			}

		} else {
			//change to loading
			$networkStatusLED.attr('data-led', CONFIG.LEDColors.loading);
		}

		if ( LEDColor ) {
			$networkStatusLED.attr('data-led', LEDColor);
		}
	}




	function siaLEDColor( LEDColor ) {

		if ( !$.isEmptyObject( STATUS.siaStatus ) ) {
			//there is data within siaStatus
			var errorData = {
				id: 'walletLockedOrNotEncrypted',
				type: 'warning',
				message: CONFIG.messages.walletLockedOrNotEncrypted,
				autoExpire: false
			};

			if ( !STATUS.siaStatus.wallet.unlocked || !STATUS.siaStatus.wallet.encrypted ) {
				//change to YELLOW
				$walletStatusLED.attr('data-led', CONFIG.LEDColors.check);
				//print error
				dashboardErrorHandler.print(errorData);
			} else {
				//change to good
				$walletStatusLED.attr('data-led', CONFIG.LEDColors.good);
				// If an error exists, remove it.
				dashboardErrorHandler.remove(errorData.id);
			}

		} else {
			//change to loading
			$walletStatusLED.attr('data-led', CONFIG.LEDColors.loading);
		}

		if ( LEDColor ) {
			$siaStatusLED.attr('data-led', LEDColor);
		}
	}




	function backupLEDColor( LEDColor ) {

		if ( !$.isEmptyObject( STATUS.backupStatus ) ) {
			//there is data within backupStatus
			var backupErrors = {
				'backupPending': {
					type: 'notification',
					message: CONFIG.messages.backupPending,
					autoExpire: false
				},
				'backupDamaged': {
					type: 'error',
					message: CONFIG.messages.backupDamaged,
					autoExpire: false
				},
				'backupError': {
					type: 'error',
					message: CONFIG.messages.backupError,
					autoExpire: false
				},
				'backupMetadataError': {
					type: 'error',
					message: CONFIG.messages.backupMetadataError,
					autoExpire: false
				},
				'backupUnknown': {
					type: 'warning',
					message: CONFIG.messages.backupUnknown,
					autoExpire: false
				},
			};
			var displayError = '';

			if ( STATUS.backupStatus.status == 'FINISHED' ) {
				//change to green
				$backupStatusLED.attr('data-led', CONFIG.LEDColors.good);


			} else if ( STATUS.backupStatus.status == 'UPLOADING' ) {
				//change to good
				$backupStatusLED.attr('data-led', CONFIG.LEDColors.good);


			}  else if ( STATUS.backupStatus.status == 'ARCHIVED' ) {
				//change to good
				$backupStatusLED.attr('data-led', CONFIG.LEDColors.good);


			} else if ( STATUS.backupStatus.status == 'PENDING' ) {
				//change to good
				$backupStatusLED.attr('data-led', CONFIG.LEDColors.good);
				//print error
				var displayError = 'backupPending';
			} else if ( STATUS.backupStatus.status == 'DAMAGED' ) {
				//change to red
				$backupStatusLED.attr('data-led', CONFIG.LEDColors.bad);
				//print error
				var displayError = 'backupDamaged';
			} else if ( STATUS.backupStatus.status == 'ERROR' ) {
				//change to red
				$backupStatusLED.attr('data-led', CONFIG.LEDColors.bad);
				//print error
				var displayError = 'backupError';
			} else if ( STATUS.backupStatus.metadata == 'ERROR' ) {
				//change to red
				$backupStatusLED.attr('data-led', CONFIG.LEDColors.bad);
				//print error
				var displayError = 'backupMetadataError';
			} else {
				//change to loading
				$backupStatusLED.attr('data-led', CONFIG.LEDColors.loading);
				//print error
				var displayError = 'backupUnknown';
			}
			// Display error message if required.
			if (displayError) {
				var errorData = backupErrors[displayError];
				errorData.id = displayError;
				dashboardErrorHandler.print(errorData);
			}
			// Remove all other backup errors if needed.
			for (var errId in backupErrors) {
				if ( displayError != errId ) {
					dashboardErrorHandler.remove(errId);
				}
			}

		} else {
			//change to loading
			$backupStatusLED.attr('data-led', CONFIG.LEDColors.loading);
		}

		if ( LEDColor ) {
			$backupStatusLED.attr('data-led', LEDColor);
		}
	}







	//events that trigger the functions above
	$('body').bind( CONFIG.events.mineboxStatus.updated, function() {
		fillMineboxStatus();
		mineboxLEDColor();
	});
	$('body').bind( CONFIG.events.siaStatus.updated, function() {
		fillSiaStatus();
		siaLEDColor();
		networkLEDColor(); //LED color also depends on siaStatus object because of consensus status and contracts number
	});
	$('body').bind( CONFIG.events.backupStatus.updated, function() {
		handleBackupStatusWidget();
		fillBackupStatus();
		backupLEDColor();
	});





	//error handler
	function DashboardErrorHandler( cfg ) {

		var $dashboardNotificationBox = $('#dashboard-notification-box'),
			$closeAllNotificationsButton = $('#close-all-notifications-button'),
			$notifications = null; //empty var to fill in when $closeAllNotificationsButton is pressed

		var CONFIG = {
			template: '<div style="display:none;" id="{{id}}" class="{{type}} dashboard-notification"><div class="icon-box"><i class="ic ic-cross"></i><i class="ic ic-checkmark"></i><i class="ic ic-warning"></i></div><div class="notification-content"><h3 class="notification-title" style="display:{{title-visibility}}">{{title}}</h3><p class="notification-text">{{message}}</p></div></div>',
			fadeSpeed: 300,
			autoExpire: true,
			autoExpireTimeout: 3000,
			filledClass: 'filled'
		};

		//overriding CONFIG
		$.extend( CONFIG, cfg, true );


		function print( data ) {
			/*
				data: {
					id: 'connectionError',				//STRING containing id 						//required
					type: 'error',						//ERROR || NOTIFICATION || WARNING 			//required
					title: 'My title',					//STRING containing title to display 		//optional
					message: 'My message',				//STRING containing message to display 		//required
					autoExpire: TRUE || FALSE,			//BOOLEAN									//optional		 //default CONFIG.autoExpire
					autoExpireTime: 3000				//INT 										//optional		 //default CONFIG.autoExpireTimeout
				}
			*/

			if ( !data.id || !data.type || !data.message ) {
				return false;
			}

			//if #data.id element already exists, remove it
			if ( $('#' + data.id).length ) {
				$('#' + data.id).remove();
				notificationsCounter();
			}

			var print = CONFIG.template;
			//printing id
			print = replaceAll( print, '{{id}}', data.id );
			//printing type
			print = replaceAll( print, '{{type}}', data.type );
			//printing message
			print = replaceAll( print, '{{message}}', data.message );
			//printing title if any
			if ( print.title && print.title != '' ) {
				print = replaceAll( print, '{{title-visibility}}', 'block' );
				print = replaceAll( print, '{{title}}', data.title );
			} else {
				print = replaceAll( print, '{{title-visibility}}', 'none' );
			}
			//handling data.autoExpire property
			if ( data.autoExpire == undefined ) {
				data.autoExpire = CONFIG.autoExpire;
			}
			//handling data.autoExpireTimeout property
			if ( data.autoExpireTimeout == undefined ) {
				data.autoExpireTimeout = CONFIG.autoExpireTimeout;
			}
			
			//appending it to $dashboardNotificationBox
			$dashboardNotificationBox.append( print );

			//fading it in
			$('#' + data.id).fadeIn( CONFIG.fadeSpeed );
			notificationsCounter();

			//set Timeout to auto-hide if it says so
			if ( data.autoExpire ) {
				setTimeout(function() {
					close( $('#' + data.id) );
				}, data.autoExpireTimeout);
			}
		}


		function close( $element ) {
			$element.fadeOut( CONFIG.fadeSpeed, function() {
				$element.remove();
				notificationsCounter();
			})
		}

		function remove( msgid ) {
			if ( $('#' + msgid).length ) {
				close( $('#' + msgid) );
			}
		}

		function notificationsCounter() {
			if ( $('.dashboard-notification').length ) {
				if ( !$dashboardNotificationBox.hasClass( CONFIG.filledClass ) ) {
					$dashboardNotificationBox.addClass( CONFIG.filledClass );
				} //otherwise just ignore
			} else {
				$dashboardNotificationBox.removeClass( CONFIG.filledClass );
			}
		}


		$dashboardNotificationBox.on('click', '.dashboard-notification', function() {
			close( $(this) );
		});

		$closeAllNotificationsButton.on('click', function() {
			$notifications = $dashboardNotificationBox.find('.dashboard-notification');
			for ( var n = 0; n < $notifications.length; n++ ) {
				//iterate through all notifications and close() them
				close( $($notifications[n]) );
			}
		});

		return {
			print: print,
			remove: remove,
		}

	}
	var dashboardErrorHandler = DashboardErrorHandler( CONFIG.errorHandler );





	//handle backup status widget
	function handleBackupStatusWidget() {
		//this function will be executed everytime backupStatus is updated (listening to event CONFIG.events.backupStatus.updated)

		//show or hide backup contents
		if ( STATUS.backupStatus.status != 'FINISHED' ) {
			//backup is not finished, so showing progress-tab
			$backup_widget.find('.done-tab').fadeOut(100, function() {
				$backup_widget.find('.progress-tab').fadeIn(300);
			});
		} else {
			//backup is finished, so showing done-tab
			$backup_widget.find('.progress-tab').fadeOut(100, function() {
				$backup_widget.find('.done-tab').fadeIn(300);
			});
		}
	}





	//dashboard loop
	function Loop() {

		var activeRequests = [];

		function theLoop() {
			//this function is being executed every CONFIG.loop.timeout and if all calls are 
			getMineboxStatus();
			getSiaStatus();
			getBackupStatus();
		}

		function addActiveRequest( name ) {
			if ( activeRequests.indexOf(name) < 0 ) {
				//if no active requests matches this name, add it
				activeRequests.push(name);
				//exec loading witness controller
				loadingWitnessController();
				return true;
			} else {
				//current name already exists into array
				return false;
			}
		}

		function removeActiveRequest( name ) {
			if ( activeRequests.indexOf(name) < 0 ) {
				//no active requests matching this name
				return false;
			} else {
				//current name exist in active requests
				var index = activeRequests.indexOf(name);
				//removing array's matching index
				activeRequests.splice(index, 1);
				//exec loading witness controller
				loadingWitnessController();
				return true;
			}
		}

		function getActiveRequests() {
			return activeRequests.length;
		}

		function loadingWitnessController() {
			//requires loadingWitness.js
			if ( getActiveRequests() ) {
				//there are active requests
				loadingWitness.start();
			} else {
				loadingWitness.stop();
			}
		}

		function init() {
			//exec loop for first time
			theLoop();
			//init the loop and asigning it to global CONFIG var
			dashboardLoopFunction = setInterval(function() {
				console.log('interval');
				//execting theLoop() on each iteration only if activeRequests is empty
				if ( !getActiveRequests() ) {
					theLoop();
				}
			}, CONFIG.loop.time);
		}

		return {
			init: init,
			addActiveRequest: addActiveRequest,
			removeActiveRequest: removeActiveRequest
		}

	}
	var loop = Loop();

	$(document).ready(function() {
		loop.init();
	});

}

$('body').bind('dashboard-close', function() {
	clearInterval( dashboardLoopFunction );
});