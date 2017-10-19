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

function LoadingManager() {

	//requires loadingWitness.js

	var CONFIG = {
		events: {
			loaderAdded: 'loaderAdded',
			loaderRemoved: 'loaderRemoved'
		},
		speed: 200
	};
	var loading = [];

	var $loadingScreen = $('#loading-screen'),
		$loadingContents = $('#loading-contents .loading-contents'),
		$closeButton = $('#loading-screen .generic-close-button');




	//add a new loading ID to loading array
	function addLoader( id ) {

		//adding id to loading array, even if there is already the same id on the list
		loading.push(id);

		//rise the event
		$('body').trigger( CONFIG.events.loaderAdded );
	}



	//removes matching ID from loading array
	function removeLoader( id ) {

		//removing id from the array, only the first occurence since there might be several ID's matching names
		for ( var n = 0; n < loading.length; n++ ) {
			if ( id == loading[n] ) {
				loading.splice( n, 1 );
				break;
			}
		}

		//rise the event
		$('body').trigger( CONFIG.events.loaderRemoved );
	}



	//writes down in #loading-contents whatever is on array
	//it is executed anytime the array have changed
	function updateContents() {
		//filling with current contents
		//not using .toString() because we want spaces between elements
		var html = '';
		for ( var n = 0; n < loading.length; n++ ) {

			if ( n > 0 ) {
				html += ', '; //adding comma and space
			}

			//adding current loading id
			html += loading[n];
		}
		//printing string
		$loadingContents.html(html);
	}




	//displays loading screen
	function show() {
		showLoadingScreen();
		showLoadingWitness();
	}

		function showLoadingScreen() {
			$loadingScreen.fadeIn( CONFIG.speed );
		}
		function showLoadingWitness() {
			loadingWitness.start();
		}



	//hides loading screen
	function hide() {
		hideLoadingScreen();
		hideLoadingWitness();
	}

		function hideLoadingScreen() {
			$loadingScreen.fadeOut( CONFIG.speed );
		}
		function hideLoadingWitness() {
			loadingWitness.stop();
		}


	//when a loader id has been added
	$('body').bind( CONFIG.events.loaderAdded, function() {
		//update array contents witness
		updateContents();

		if ( $loadingScreen.is(':hidden') ) {
			//if $loadingScreen was hidden
			//show $loadingScreen
			show();
		}
	});


	//when a loader id has been removed
	$('body').bind( CONFIG.events.loaderRemoved, function() {
		//update array contents witness
		updateContents();

		if ( !loading.length ) {
			//loading array is empty
			//hide $loadingScreen
			hide();
		}
	});



	//when user clicks on $closeButton hide only loading screen and leave loading witness
	$closeButton.on('click', hideLoadingScreen);


	return {
		add: addLoader,
		remove: removeLoader,
		update: updateContents,
		show: show,
		hide: hide
	}



}

var loadingManager = LoadingManager();