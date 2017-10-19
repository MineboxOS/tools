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

/* jsing contracts view */
viewLoader.add('contracts', Contracts);


function Contracts() {

	//requires replaceAll();

	var CONFIG = {
		api: {
			requester: new Requester(),
			url: config.mug.url + 'contracts'
		},
		messages: {
			loadContracts: {
				fail: 'We couldn\t retrieve your renter contracts. Try again in a few minutes.'
			},
			contractNotFound: 'Contract ID not found'
		},
		template: '<li class="contract" data-contract-name="{{contract-name}}"><div class="contract-inner"><p>#{{contract-name}}<p></div></li>',
		contracts: []
	};

	var $contractsList = $('#contracts-list'),
		$contractViewer = $('#contract-viewer'),
		$contractsContents = $('#contract-contents'),
		$contractViewerCloseButton = $contractViewer.find('.generic-close-button');





	function ContractHandler() {

		function load( cb ) {

			//startin loading
			loadingManager.add('Contracts list');

			CONFIG.api.requester.setURL( CONFIG.api.url );
			CONFIG.api.requester.setMethod( 'GET' );
			CONFIG.api.requester.setCache( false );
			CONFIG.api.requester.setCredentials( true );
			CONFIG.api.requester.run(function(response) {

				//stopping loading
				loadingManager.remove('Contracts list');

				//saving response in contracts
				CONFIG.contracts = response;

				//exec cb if any
				if ( cb ) { cb() };

			}, function(error) {

				//stopping loading
				loadingManager.remove('Contracts list');

				//printing error if load fails
				var notify = new Notify({ message: CONFIG.messages.loadContracts.fail });
				notify.print();
			});

		}


		function print() {

			var html = '';

			for ( var n = 0; n < CONFIG.contracts.length; n++ ) {
				html = CONFIG.template;
				html = replaceAll( html, '{{contract-name}}', CONFIG.contracts[n].id );
				$contractsList.append( html );
			}

		}

		function init() {
			load(print);
		}

		return {
			init: init
		}

	}
	var contractHandler = ContractHandler();





	function ContractViewer() {

		function open( id ) {
			//getting contracts details
			var details = null;
			for ( var n = 0; n < CONFIG.contracts.length; n++ ) {
				if ( CONFIG.contracts[n].id == id ) {
					details = CONFIG.contracts[n];
				}
			}
			if ( !details ) {
				var notify = new Notify({ message: CONFIG.messages.contractNotFound });
				notify.print();
				return false;
			}
			empty();
			fill( details );
			$contractViewer.fadeIn(300);
		}

		function fill( data ) {
			$contractsContents.find('.id .value').html( data.id );
			$contractsContents.find('.host .value').html( data.host );
			$contractsContents.find('.funds-remaining .value').html( data.funds_remaining_sc );
			$contractsContents.find('.funds-spent .value').html( data.funds_spent_sc );
			$contractsContents.find('.fees-spent .value').html( data.fees_spent_sc );
			$contractsContents.find('.data-size .value').html( data.data_size );
			$contractsContents.find('.height-end .value').html( data.height_end );
		}

		function empty() {
			var data = {
				id: '',
				host: '',
				funds_remaining_sc: '',
				funds_spent_sc: '',
				fees_spent_sc: '',
				data_size: '',
				height_end: ''
			};
			fill( data );
		}

		function close() {
			$contractViewer.fadeOut(300);
		}

		return {
			open: open,
			close: close,
			fill: fill
		}
	}
	var contractViewer = ContractViewer();





	function init() {
		contractHandler.init();
	}


	$(document).ready(function() {
		init();
	});


	//when user clicks on a contract
	$('body').on('click', '#contracts-list .contract', function() {
		contractViewer.open( $(this).attr('data-contract-name') );
	});

	$contractViewerCloseButton.on('click', contractViewer.close);

}
