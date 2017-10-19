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
//requires tabNavigator

function proveTab() {

	//show a notification if register is empty on ready
	var notify = new Notify({
		message: 'Oops! Lost your track?<br />Seems that you have arrived here refreshing your browser or by magic.<br/>You need to have a valid and verified hostname and private key. Validate them again and provide username and password.<br />Press OK to proceed.',
		onAccept: function() {
			tabNavigator.go('register');
		},
		onClose: function() {
			tabNavigator.go('register');
		}
	});

	if ( !register.seed || !register.hostname ) {
		notify.print();
	}



	//print qr code
	$('body').on('click', '#print-encryption-key-qr-code-reminder', function() {
		window.open('print-qr-code.html');
	});




	var $restoreEncryptionKey = $('.prove-section .restore-encryption-key'),
		$encryptionKeyInputs = $('.prove-section .encryption-word'),
		$typeEncryptionKeyButton = $('.type-encryption-key-button');



	//scan qr code
	//requires instascan, $encryptionKeyInputs, showEncryptionKeyInputs()
	var $webcamButton = $('.webcam-access-button'),
		$closeWebcamButton = $('#close-instascan-button');
	//qr code reader
	$webcamButton.on('click', function() {
		//show camera window
		instascanManager.show();
		//init camera
		instascanManager.scan(function(data) {
			//when scans a QR code returns data
			fillEncryptionKeyInputs(data);
		});
	});

	//close webcam view
	$closeWebcamButton.on('click', function() {
		instascanManager.hide();
	});

	$typeEncryptionKeyButton.on('click', showEncryptionKeyInputs);



	//type qr code
	function fillEncryptionKeyInputs(words) {
		//scroll to the top
		$('html, body').animate({ scrollTop: 0 }, 100);
		//forcing display encryption key fields
		showEncryptionKeyInputs();
		//filling inputs with a interval time in between
		var qrcodewords = words.split(' ');
		var n = 0;
		var interval = setInterval(function() {
			//filling input with current word
			$($encryptionKeyInputs[n]).val( qrcodewords[n] );
			n++;
			if ( n >= $encryptionKeyInputs.length ) {
				//all fields filled
				//trigger keyup in the first input to activate validation process
				$($encryptionKeyInputs[0]).trigger('keyup');
				//stopping interval
				clearInterval(interval);
			}
		}, 150);
	}


	function showEncryptionKeyInputs() {
		$restoreEncryptionKey.fadeIn(300);
	}


	$encryptionKeyInputs.on('keyup', checkRequiredFields);

	//validate all the required fields are filled
	var $requiredFields = $('.prove-section [required]');

	function checkRequiredFields() {
		//any time the user types on a required field check if there is any empty and update register validation object
		for ( var n = 0; n < $requiredFields.length; n++ ) {
			if ( !$($requiredFields[n]).val().length ) {
				submitButtonEnabler(false);
				return false;
			}
		}
		//if we arrived here, everything is filled
		submitButtonEnabler(true);
	}



	//submit button enabler/disabler
	var $submitButton = $('#proved-private-key-button');
	function submitButtonEnabler(enable) {
		if ( enable ) {
			$submitButton.removeAttr('data-disabled');
		} else {
			$submitButton.attr('data-disabled', 'disabled');
		}
	}

	$submitButton.on('click', function() {
		validateEncryptionKey();
	});



	var encryptionKeyRequester = new Requester(),
		encryptionKeyArray = [],
		encryptionKeyString = '';



	function validateEncryptionKey() {
		//encryption key to array
		encryptionKeyArray = []
		for ( var n = 0; n < $encryptionKeyInputs.length; n++ ) {
			encryptionKeyArray.push( $($encryptionKeyInputs[n]).val() );
		}
		//storing it also in string
		encryptionKeyString = encryptionKeyArray.join(' ');

		//matching the generated key and the provided one are the same (checking agains register.seed)
		if ( encryptionKeyString == register.seed ) {
			//they match
			//loading witness
			loadingWitness.start();
			//placing call
			encryptionKeyRequester.setURL( config.mug.url + 'key' );
			encryptionKeyRequester.setMethod('PUT');
			encryptionKeyRequester.setData(encryptionKeyString);
			encryptionKeyRequester.setContentType('text/plain; charset=UTF8');
			encryptionKeyRequester.run(function(data) {
				correct(data);
			}, function(error) {
				fail(error);
			});

			function correct(data) {
				//call to the server completed successfully with a 2xx status code.

				//emptying error field
				$submitButton.siblings('.error').html('');

				progressScreen.open('register');
			}

			function fail(error) {
				//the call to the server failed or returned an error
				if ( error.code == 400 ) {
					var notify = new Notify({message:'There is a key already set or no key was handed over.'});
					notify.print();
				} else if ( error.code == 500 ) {
					var notify = new Notify({message:'Unknown error'});
					notify.print();
				} else if ( error.code == 503 ) {
					var notify = new Notify({message:'MineBD not running.'});
					notify.print();
				}
				$('.prove-section .error').html('Something went wrong. Try again in a few minutes.');

				//loading witness
				loadingWitness.stop();
			}
		} else {
			//they do not match
			$('.prove-section .error').html('The private key you have provided does not match.');
		}

	}




}