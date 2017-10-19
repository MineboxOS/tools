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

//handle recover functions
function recoverTab() {

	//handle visibility of fieldset.restore-encryption-key
	var $restoreEncryptionKey = $('.recover-section fieldset.restore-encryption-key'),
		$typeEncryptionKeyButton = $('#type-encryption-key');

	function handleEncryptionKeyInputsVisibility() {
		if ( $restoreEncryptionKey.is(':visible') ) {
			$restoreEncryptionKey.fadeOut(300);
		} else {
			showEncryptionKeyInputs();
		}
	}

	function showEncryptionKeyInputs() {
		$restoreEncryptionKey.fadeIn(300);
	}

	$typeEncryptionKeyButton.on('click', handleEncryptionKeyInputsVisibility);





	//validates 12 words of private key
	var $encryptionKeyInputs = $('.recover-section input.encryption-word');
	var $restoreMineboxButton = $('#restore-minebox-button');

	function validateInputs() {
		//this function validates that the twelve inputs contains something in order to enable de "continue" button
		for ( var n = 0; n < $encryptionKeyInputs.length; n++ ) {
			if ( $($encryptionKeyInputs[n]).val() == '' ) {
				return false;
			}
		}
		return true;
	}

	//when user is typing its private key
	$encryptionKeyInputs.on('keyup', function() {
		if ( validateInputs() ) {
			$restoreMineboxButton.removeAttr('disabled');
		}
	});




	//webcam manager
	//requires instascan, $encryptionKeyInputs, showEncryptionKeyInputs()
	var $webcamButton = $('.recover-section .webcam-access-button'),
		$closeWebcamButton = $('#close-instascan-button');
	//qr code reader
	$webcamButton.on('click', function() {
		//show camera window
		instascanManager.show();
		//init camera
		instascanManager.scan(function(data) {
			//when scans a QR code returns data
			//scroll to the top
			$('html, body').animate({ scrollTop: 0 }, 100);
			//forcing display encryption key fields
			showEncryptionKeyInputs();
			//filling inputs with a interval time in between
			var qrcodewords = data.split(' ');
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
		});
	});

	//close webcam view
	$closeWebcamButton.on('click', function() {
		instascanManager.hide();
	});






	//when user clicks on "continue button"
	$restoreMineboxButton.on('click', function() {
		privateKeyValidation();
	});


	var encryptionKeyRequester = new Requester(),
		encryptionKeyArray = [],
		encryptionKeyString = '';

	function privateKeyValidation() {
		//encryption key to array
		encryptionKeyArray = []
		for ( var n = 0; n < $encryptionKeyInputs.length; n++ ) {
			encryptionKeyArray.push( $($encryptionKeyInputs[n]).val() );
		}
		//storing it also in string
		encryptionKeyString = encryptionKeyArray.join(' ');

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
			$restoreMineboxButton.siblings('.error').html('');

			progressScreen.open('recover');
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
			$('.recover-section .error').html('Something went wrong. Try again in a few minutes.');

			//loading witness
			loadingWitness.stop();
		}
	}

}
