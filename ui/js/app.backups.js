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

viewLoader.add('backups', Backups);

//requires requester.js
//requires display();
//requires formatDate();
function Backups() {

	var CONFIG = {
		api: {
			loadBackups: {
				url: config.mug.url + 'backup/all/status',
				requester: new Requester()
			},
			loadLatestBackup: {
				url: config.mug.url + 'backup/latest/status',
				requester: new Requester()
			},
			newBackup: {
				url: config.mug.url + 'backup/start',
				requester: new Requester()
			}
		},
		templates: {
			bars: '<div id="backup-{{backup_name}}-{{place}}" class="bar-box backup-status-{{backup_status}} backup-metadata-{{backup_metadata}} backup-{{backup_name}}" data-name="{{backup_name}}" data-timestamp="{{backup_time}}" data-size="{{backup_size}}" data-relative-size="{{backup_relative_size}}" data-progress="{{backup_progress}}" data-relative-progress="{{backup_relative_progress}}" data-files="{{backup_files_number}}" data-status="{{backup_status}}" data-metadata="{{backup_metadata}}"><div class="bar"></div><div class="info"><p class="date"></p><p class="size"></p><p class="progress"></p></div></div>'
		},
		bars: {
			desktop: 16,
			laptop: 10,
			tablet: 6,
			phone: 3
		},
		backups: [],
		messages: {
			loadBackups: {
				fail: 'We couldn\'t get your backup list. Try again in a few minutes.'
			},
			takeNewBackup: {
				fail: 'Something happened and we couldn\'t take this backup. Please try again.'
			},
			loadNewestBackup: {
				fail: 'We couldn\'t retrieve data from current backups. Try again later.'
			},
			newBackupAlert: 'Your Minebox takes automatically a new backup everyday.<br />Hosting backups on Sia network consume funds.<br />Are you sure you want to take a new backup?'
		}
	};

	var $newFilesBox = $('#new-files'),
		$cumulativeFilesBox = $('#cumulative-files'),
		$timelineBox = $('#timeline'),
		$timelineBarsBox = $('#timeline-bars'),
		$graph = $('#graph'),
		$graphContainer = $('#graph-inner'),
		$scrollWindow = $('#timeline .window'),
		$panelButtons = $('.panel-button'),
		$newBackupButton = $('#new-backup-button'),
		$sizeScale = $('#size-scale'),
		$relativeSizeGraphBars,
		$absoluteSizeGraphBars,
		$timelineBars,
		numberOfBars,
		backupInterface = backupInterface(CONFIG);






	function init() {
		//load backups
		loadBackupsFunc();
		//making .window draggable
		$scrollWindow.draggable({
			axis: 'x',
			containment: '#timeline'
		}).bind('drag', backupInterface.handleScroll);
	}








	function loadBackupsFunc() {

		//start loading
		loadingManager.add('Backups');

		//loading all backup names
		CONFIG.api.loadBackups.requester.setURL( CONFIG.api.loadBackups.url );
		CONFIG.api.loadBackups.requester.setMethod('GET');
		CONFIG.api.loadBackups.requester.setCache(false);
		CONFIG.api.loadBackups.requester.setCredentials(true);
		CONFIG.api.loadBackups.requester.setTimeoutTime(60000);
		CONFIG.api.loadBackups.requester.run(function(backups) {

			//saving backups arrays
			CONFIG.backups = backups.reverse();
			//reverse to oldest first.
			//The method used to print is PREPEND, so new created backups are prepended at the beggining of the list

			//iterating through backups and setting timestamp to milliseconds
			for ( var n = 0; n < CONFIG.backups.length; n++ ) {
				//converting timestamp into milliseconds
				CONFIG.backups[n].time_snapshot = CONFIG.backups[n].time_snapshot * 1000;
			}

			//once backups array is filled with info, print them and build the interface
			backupInterface.print(CONFIG.backups);
			backupInterface.build();

			//stop loading
			loadingManager.remove('Backups');

		}, function(error) {

			//stop loading
			loadingManager.remove('Backups');

			//printing message
			var notify = new Notify({ message: CONFIG.messages.loadBackups.fail });
			notify.print();

		});

	}














	function backupInterface(cfg) {

		//vars
		var htmlStringForAbsoluteGraph,
			htmlStringForRelativeGraph,
			htmlStringForTimelineGraph,
			graphContainerWidth,
			windowScrollRatio,
			scrollingWindowData = {};








	/*
	 * FUNCTIONS FOR PRINTING
	 * Functions that actually prints the html by given an array
	 */ 
		//printing bars ( array, destination )
		function printBars( array ) {
			//printing each iteration
			for ( var n = 0; n < array.length; n++ ) {
				//preparing HTML string
				htmlStringForAbsoluteGraph = cfg.templates.bars;
				htmlStringForAbsoluteGraph = replaceAll( htmlStringForAbsoluteGraph, '{{place}}', 'absolute' );
				htmlStringForAbsoluteGraph = replaceAll( htmlStringForAbsoluteGraph, '{{backup_name}}', array[n].name );
				htmlStringForAbsoluteGraph = replaceAll( htmlStringForAbsoluteGraph, '{{backup_status}}', array[n].status.toLowerCase() );
				htmlStringForAbsoluteGraph = replaceAll( htmlStringForAbsoluteGraph, '{{backup_metadata}}', array[n].metadata.toLowerCase() );
				htmlStringForAbsoluteGraph = replaceAll( htmlStringForAbsoluteGraph, '{{backup_size}}', array[n].size );
				htmlStringForAbsoluteGraph = replaceAll( htmlStringForAbsoluteGraph, '{{backup_relative_size}}', array[n].relative_size );
				htmlStringForAbsoluteGraph = replaceAll( htmlStringForAbsoluteGraph, '{{backup_progress}}', array[n].progress );
				htmlStringForAbsoluteGraph = replaceAll( htmlStringForAbsoluteGraph, '{{backup_relative_progress}}', array[n].relative_progress );
				htmlStringForAbsoluteGraph = replaceAll( htmlStringForAbsoluteGraph, '{{backup_time}}', array[n].time_snapshot );
				htmlStringForAbsoluteGraph = replaceAll( htmlStringForAbsoluteGraph, '{{backup_files_number}}', array[n].numFiles );
				//preparing HTML string
				htmlStringForRelativeGraph = cfg.templates.bars;
				htmlStringForRelativeGraph = replaceAll( htmlStringForRelativeGraph, '{{place}}', 'relative' );
				htmlStringForRelativeGraph = replaceAll( htmlStringForRelativeGraph, '{{backup_name}}', array[n].name );
				htmlStringForRelativeGraph = replaceAll( htmlStringForRelativeGraph, '{{backup_status}}', array[n].status.toLowerCase() );
				htmlStringForRelativeGraph = replaceAll( htmlStringForRelativeGraph, '{{backup_metadata}}', array[n].metadata.toLowerCase() );
				htmlStringForRelativeGraph = replaceAll( htmlStringForRelativeGraph, '{{backup_size}}', array[n].size );
				htmlStringForRelativeGraph = replaceAll( htmlStringForRelativeGraph, '{{backup_relative_size}}', array[n].relative_size );
				htmlStringForRelativeGraph = replaceAll( htmlStringForRelativeGraph, '{{backup_progress}}', array[n].progress );
				htmlStringForRelativeGraph = replaceAll( htmlStringForRelativeGraph, '{{backup_relative_progress}}', array[n].relative_progress );
				htmlStringForRelativeGraph = replaceAll( htmlStringForRelativeGraph, '{{backup_time}}', array[n].time_snapshot );
				htmlStringForRelativeGraph = replaceAll( htmlStringForRelativeGraph, '{{backup_files_number}}', array[n].numFiles );
				//preparing HTML string
				htmlStringForTimelineGraph = cfg.templates.bars;
				htmlStringForTimelineGraph = replaceAll( htmlStringForTimelineGraph, '{{place}}', 'timeline' );
				htmlStringForTimelineGraph = replaceAll( htmlStringForTimelineGraph, '{{backup_name}}', array[n].name );
				htmlStringForTimelineGraph = replaceAll( htmlStringForTimelineGraph, '{{backup_status}}', array[n].status.toLowerCase() );
				htmlStringForTimelineGraph = replaceAll( htmlStringForTimelineGraph, '{{backup_metadata}}', array[n].metadata.toLowerCase() );
				htmlStringForTimelineGraph = replaceAll( htmlStringForTimelineGraph, '{{backup_size}}', array[n].size );
				htmlStringForTimelineGraph = replaceAll( htmlStringForTimelineGraph, '{{backup_relative_size}}', array[n].relative_size );
				htmlStringForTimelineGraph = replaceAll( htmlStringForTimelineGraph, '{{backup_progress}}', array[n].progress );
				htmlStringForTimelineGraph = replaceAll( htmlStringForTimelineGraph, '{{backup_relative_progress}}', array[n].relative_progress );
				htmlStringForTimelineGraph = replaceAll( htmlStringForTimelineGraph, '{{backup_time}}', array[n].time_snapshot );
				htmlStringForTimelineGraph = replaceAll( htmlStringForTimelineGraph, '{{backup_files_number}}', array[n].numFiles );
				//printing in relative graph
				$newFilesBox.prepend( htmlStringForRelativeGraph );
				//printing in absolute graph
				$cumulativeFilesBox.prepend( htmlStringForAbsoluteGraph );
				//printing in timeline
				$timelineBarsBox.prepend( htmlStringForTimelineGraph );
			}
			//once everything is printed, update selection elements
			updateBarsSelectors();
		}













	/*
	 * FUNCTIONS FOR BUILD
	 * Functions that build windows, containers and bars width
	 */ 
		//gathering functionalities
		function build() {
			setGraphContainerWidth();
			setWindowScrollerWidth();
			setGraphBarsWidth();
			renderGraphBars();
			setTimelineBarsWidth();
		}

















		//select bars
		function updateBarsSelectors() {
			//updating elements
			$relativeSizeGraphBars = $('#new-files .bar-box');
			$absoluteSizeGraphBars = $('#cumulative-files .bar-box');
			$timelineBars = $('#timeline-bars .bar-box');
		}

















		//get bar numbers by screen width
		function getBarsByScreen() {
			return cfg.bars[ display() ];
		}

















		//set graph bars width -> called on init and on resize
		function setGraphBarsWidth() {
			//the width is the result of dividing available space (100%) between the number of bars
			//init var for preventing bars to be wider than they should in case there are less bars than barsByScreen()
			var barsTotal;
			if ( $absoluteSizeGraphBars.length < getBarsByScreen() ) {
				barsTotal = getBarsByScreen();
			} else {
				barsTotal = $absoluteSizeGraphBars.length;
			}
			//setting its width
			$relativeSizeGraphBars.css( 'width', 100 / barsTotal + '%' );
			$absoluteSizeGraphBars.css( 'width', 100 / barsTotal + '%' );
		}

















		//set timeline bars width -> called on init and on resize
		function setTimelineBarsWidth() {
			//the width is the result of dividing available space (100%) between the number of bars
			$timelineBars.css( 'width', 100 / $timelineBars.length + '%' );
		}

















		//set graph container width
		function setGraphContainerWidth() {
			//getting the number of bars, divinding it by barsByScreen and multiplying the result by 100, we will get the percent scale of current screen size (#graphContainer's parent is same width as screen)
			//if happens that we get as a result less than 100%, we will force it to be at least 100% width of its parent
			graphContainerWidth = ( $absoluteSizeGraphBars.length / getBarsByScreen() ) * 100;
			if ( graphContainerWidth < 100 ) {
				graphContainerWidth = 100;
			}
			//setting the percent width
			$graphContainer.css( 'width', graphContainerWidth + '%' );
		}

















		//set window scroller width
		function setWindowScrollerWidth() {
			//getting the ratio for visible bars within the screen
			windowScrollRatio = $absoluteSizeGraphBars.length / getBarsByScreen();
			//preventing ratio to go under 1, so scrollWindow never goes above 100%
			if ( windowScrollRatio < 1 ) {
				windowScrollRatio = 1;
			}
			//setting the percent
			$scrollWindow.css( 'width', 100 / windowScrollRatio + '%' );
		}

















		function renderGraphBars() {
			renderRelativeGraphBarsHeight(getRelativeGraphBars());
			renderAbsoluteGraphBarsHeight(getAbsoluteGraphBars());
			renderTimelineBarsHeight();
		}

















		function renderRelativeGraphBarsHeight( $bars ) {
			//init maximum & vars
			var maximumSize = 0;
			var minimumSize = parseInt( $($bars[0]).attr('data-relative-size') ); //giving it a value to start with
			//iterating through timelineBars to know the maximumSize and minimumSize
			for ( var n = 0; n < $bars.length; n++ ) {
				if ( parseInt( $($bars[n]).attr('data-relative-size') ) > maximumSize ) {
					maximumSize = parseInt( $($bars[n]).attr('data-relative-size') );
				}
				if ( parseInt( $($bars[n]).attr('data-relative-size') ) < minimumSize ) {
					minimumSize = parseInt( $($bars[n]).attr('data-relative-size') );
				}
			}
			
			//iterating through timelineBars again to apply the height and fill the data
			for ( var n = 0; n < $bars.length; n++ ) {
				$($bars[n])
					.find('.bar')
					.css({
						'height': linearScale( maximumSize, $($bars[n]).attr('data-relative-size') ) + '%'
					});
			}

			//adjust size scale values
			adjustSizeScaleValuesTop( maximumSize );
		}

















		function renderAbsoluteGraphBarsHeight($bars) {
			//init maximum & vars
			var maximumSize = 0;
			var minimumSize = parseInt( $($bars[0]).attr('data-size') ); //giving it a value to start with
			//iterating through timelineBars to know the maximumSize and minimumSize
			for ( var n = 0; n < $bars.length; n++ ) {
				if ( parseInt( $($bars[n]).attr('data-size') ) > maximumSize ) {
					maximumSize = parseInt( $($bars[n]).attr('data-size') );
				}
				if ( parseInt( $($bars[n]).attr('data-size') ) < minimumSize ) {
					minimumSize = parseInt( $($bars[n]).attr('data-size') );
				}
			}
			
			//iterating through timelineBars again to apply the height and fill the data
			for ( var n = 0; n < $bars.length; n++ ) {
				$($bars[n])
					.find('.bar')
					.css({
						'height': linearScale( maximumSize, $($bars[n]).attr('data-size') ) + '%'
					});
				printData( $($bars[n]) );
			}

			//adjust size scale values
			adjustSizeScaleValuesBottom( maximumSize );
		}

















		var rendering = null;
		function renderTimelineBarsHeight() {
			if ( rendering ) {
				clearTimeout(rendering);
				rendering = null;
			}
			rendering = setTimeout(function() {
				//init maximum var
				var maximum = 0;
				var minimum = parseInt( $($timelineBars[0]).attr('data-size') ); //giving it a value to start with
				//iterating through visible to know the maximum and minimum
				for ( var n = 0; n < $timelineBars.length; n++ ) {
					if ( parseInt( $($timelineBars[n]).attr('data-size') ) > maximum ) {
						maximum = parseInt( $($timelineBars[n]).attr('data-size') );
					}
					if ( parseInt( $($timelineBars[n]).attr('data-size') ) < minimum ) {
						minimum = parseInt( $($timelineBars[n]).attr('data-size') );
					}
				}

				//iterating through visible again to apply the maximum
				for ( var n = 0; n < $timelineBars.length; n++ ) {
					$($timelineBars[n])
						.find('.bar')
						.css({
							'height': linearScale( maximum, $($timelineBars[n]).attr('data-size') ) + '%'
						});
				}
			}, 600);
		}

















		function linearScale(max,size) {
			return size / max * 100;
		}
		function logScale(min,max,size) {
			size = parseInt(size);
			return Math.log10(size)*10;
		}

















		function printData($element) {
			var d = new Date( parseInt($element.attr('data-timestamp')) );
			var info = {
				date: make2Digits( d.getDate() ) + '/' + make2Digits( d.getMonth() + 1 ) + '/' + d.getFullYear(),
				//name: '#' + $element.attr('data-name'),
				size: formatNumber( parseInt( $element.attr('data-size') ) / 1000000 ) + ' MB',
				//relative_size: formatNumber( parseInt( $element.attr('data-relative-size') ) / 1000000 ) + ' MB'
				progress: formatNumber( $element.attr('data-progress') ) + '%'
			};
			$element.find('.date').html( info.date );
			//$element.find('.name').html( info.name );
			$element.find('.size').html( info.size );
			//$element.find('.relative-size').html( info.relative_size );
			$element.find('.progress').html( info.progress );
		}

















		function adjustSizeScaleValuesTop( maximum ) {
			//robert's formula
			var mbLine = 2 * Math.pow(10, Math.floor(Math.log10(maximum)));
			var position = linearScale( maximum, mbLine );
			var currentPosition = position;

			$sizeScale.find('.positive .first-line').css('bottom', position + '%').html( formatNumber( mbLine / 1000000 ) + ' MB' );
			$sizeScale.find('.positive .second-line').css('bottom', 2*position + '%').html( formatNumber( 2*mbLine / 1000000 ) + ' MB' );
			$sizeScale.find('.positive .third-line').css('bottom', 3*position + '%').html( formatNumber( 3*mbLine / 1000000 ) + ' MB' );
			$sizeScale.find('.positive .fourth-line').css('bottom', 4*position + '%').html( formatNumber( 4*mbLine / 1000000 ) + ' MB' );
		}

















		function adjustSizeScaleValuesBottom( maximum ) {
			//robert's formula
			var mbLine = 2 * Math.pow(10, Math.floor(Math.log10(maximum)));
			var position = linearScale( maximum, mbLine );
			var currentPosition = position;

			$sizeScale.find('.negative .first-line').css('top', position + '%').html( formatNumber( mbLine / 1000000 ) + ' MB' );
			$sizeScale.find('.negative .second-line').css('top', 2*position + '%').html( formatNumber( 2*mbLine / 1000000 ) + ' MB' );
			$sizeScale.find('.negative .third-line').css('top', 3*position + '%').html( formatNumber( 3*mbLine / 1000000 ) + ' MB' );
			$sizeScale.find('.negative .fourth-line').css('top', 4*position + '%').html( formatNumber( 4*mbLine / 1000000 ) + ' MB' );
		}

















		function takeNewBackup() {
			var takeNewBackupAlert = new Notify({
				message: CONFIG.messages.newBackupAlert,
				cancelText: 'Cancel',
				onAccept: function() {
					//disable new backup button
					$newBackupButton.attr('disabled', 'disabled');

					//start loading
					loadingManager.add('Take backup');

					CONFIG.api.newBackup.requester.setURL( CONFIG.api.newBackup.url );
					CONFIG.api.newBackup.requester.setMethod( 'POST' );
					CONFIG.api.newBackup.requester.setCache( false );
					CONFIG.api.newBackup.requester.setCredentials( true );
					CONFIG.api.newBackup.requester.run(function(response) {
						//success

						CONFIG.api.loadLatestBackup.requester.setURL( config.mug.url + 'backup/' + response.name + '/status' );
						CONFIG.api.loadLatestBackup.requester.setMethod( 'GET' );
						CONFIG.api.loadLatestBackup.requester.setCache( false );
						CONFIG.api.loadLatestBackup.requester.setCredentials( true );
						CONFIG.api.loadLatestBackup.requester.run(function(latestBackup) {

							//enabling back new backup button
							$newBackupButton.removeAttr('disabled');

							//stop loading
							loadingManager.remove('Take backup');

							//converting timestamp to milliseconds
							latestBackup.time_snapshot = parseInt(latestBackup.time_snapshot) * 1000;

							//print and build latest backup
							printBars([latestBackup]); //sending it as an array
							build();

						}, function(error) {

							//enabling back new backup button
							$newBackupButton.removeAttr('disabled');

							//stop loading
							loadingManager.remove('Take backup');

							//print error
							var loadNewestBackupError = new Notify({message: CONFIG.messages.loadNewestBackup.fail});
							loadNewestBackupError.print();

						});
					}, function(error) {

						//enabling back new backup button
						$newBackupButton.removeAttr('disabled');

						//stop loading
						loadingManager.remove('Take backup');

						//print error
						var takeNewBackupError = new Notify({message: CONFIG.messages.takeBackup.fail});
						takeNewBackupError.print();
					});
				}
			});
			takeNewBackupAlert.print();
		}



















	/*
	 * FUNCTIONS FOR NAVIGATION
	 * Functions that handle window position
	 */
		//handle drag and drop in scrolling window
		function handleScrollingWindow() {
			scrollingWindowData.leftPos = $scrollWindow.offset().left;
			scrollingWindowData.offset = $scrollWindow.width() / 2;
			scrollingWindowData.minimum = scrollingWindowData.offset;
			scrollingWindowData.maximum = window.innerWidth - scrollingWindowData.offset;
			scrollingWindowData.total = scrollingWindowData.maximum - scrollingWindowData.minimum;
			scrollingWindowData.percent = ( 100 - ( 100 / ( scrollingWindowData.total / scrollingWindowData.leftPos ) ) );
			$graphContainer.css({
				'transform': 'translateX(' + scrollingWindowData.percent + '%)',
				'margin-right': ( scrollingWindowData.percent * window.innerWidth ) / 100 + 'px'
			});
		}

















		function getTimelineBars() {
			return $timelineBars;
		}

















		function getAbsoluteGraphBars() {
			return $absoluteSizeGraphBars;
		}

















		function getRelativeGraphBars() {
			return $relativeSizeGraphBars;
		}










		//handle click and point in scrolling window
		var clickAndPointData = {};
		$timelineBarsBox.on('click', function(e) {
			//preventing event to go deeper on DOM
			e.stopPropagation();
			//storing clicked point and offset
			clickAndPointData.offset = $scrollWindow.width() / 2;
			clickAndPointData.clicked = e.pageX;
			//preventing "click" out of the margin area
			if ( clickAndPointData.clicked < clickAndPointData.offset ) {
				//if clicked too on the left
				clickAndPointData.go = 0;
			} else if ( clickAndPointData.clicked > window.innerWidth - clickAndPointData.offset ) {
				//if clicked too on the right
				clickAndPointData.go = (window.innerWidth - clickAndPointData.offset) - clickAndPointData.offset;
			} else {
				//if clicked within the margins
				clickAndPointData.go = clickAndPointData.clicked - clickAndPointData.offset;
			}
			//moving
			$scrollWindow.css('left', clickAndPointData.go).trigger('drag');
		});












	/*
	 * FUNCTIONS FOR PANEL
	 * Functions that handle button's panel activity
	 */
		//handle button .activity
		$panelButtons.on('click', function() {
			if ( $(this).attr('id') != 'new-backup-button' ) {
				if ( $(this).hasClass('active') ) {
					$(this).removeClass('active');
				} else {
					$(this).addClass('active');
				}
			}
			buttonClicked( $(this) );
			$(this).blur();
		});

		$newBackupButton.on('click', function() {
			takeNewBackup();
		});

















		function buttonClicked( $clicked ) {
			if ( $clicked.attr('id') == 'display-size-scale-button' ) {
				displaySizeScale();
			} else if ( $clicked.attr('id') == 'navigator-button' ) {
				displayTimeline();
			}
		}

















		function displaySizeScale() {
			if ( $sizeScale.hasClass('active') ) {
				$sizeScale.removeClass('active');
			} else {
				$sizeScale.addClass('active');
			}
		}

















		function displayTimeline() {
			if ( $timelineBox.hasClass('active') ) {
				$timelineBox.removeClass('active');
				$graph.addClass('expand');
			} else {
				$timelineBox.addClass('active');
				$graph.removeClass('expand');
			}
		}










	/*
	 * FUNCTIONS FOR BARS INTERACTION
	 * Functions that handle bars activity
	 */
		//handle .bar events
		$('body').on('click', '#graph .bar-box', function() {
			//only if clicked bar is not active already
			if ( !$(this).hasClass('active') ) {
				//removing class on all bars
				$('#graph .bar-box').removeClass('active');
				//getting current element
				var current = $(this).attr('data-name');
				//add class to clicked
				$('#graph .bar-box.backup-' + current).addClass('active');
			}
			//loading contents
			backupDataViewer.show();
			var data = {
				name: $(this).attr('data-name'),
				relative_progress: $(this).attr('data-relative-progress'),
				total_progress: $(this).attr('data-progress'),
				date: $(this).attr('data-timestamp'),
				status: $(this).attr('data-status'),
				metadata: $(this).attr('data-metadata'),
				files_number: $(this).attr('data-files'),
				size: $(this).find('.info .size').html()
			};
			backupDataViewer.fill(data);
		});







		$('body').on('mouseover', '#graph .bar-box', function() {
			mouseOutBoxes();
			mouseOverBox( $(this).attr('data-name') );
		});







		$('body').on('mouseout', '#graph .bar-box', function() {
			mouseOutBoxes();
		});







		function mouseOverBox( backupName ) {
			$('#graph .backup-' + backupName).addClass('hover');
		}







		function mouseOutBoxes() {
			$relativeSizeGraphBars.removeClass('hover');
			$absoluteSizeGraphBars.removeClass('hover');
		}








		return {
			build: build,
			print: printBars,
			handleScroll: handleScrollingWindow
		}

	}






	function BackupDataViewer() {

		var $backupDataViewer = $('#backup-data-viewer'),
			$obfuscationLayer = $backupDataViewer.find('.obfuscation-layer'),
			$closeButton = $backupDataViewer.find('.generic-close-button');


		function show() {
			$backupDataViewer.fadeIn(300);
		}
		function hide() {
			$backupDataViewer.fadeOut(300, empty);
		}


		function empty() {
			var data = {
				name: '',
				relative_progress: 0,
				total_progress: 0,
				date: '',
				status: '',
				metadata: '',
				files_number: '',
				size: ''
			};
			fill(data);
		}
		function fill(data) {
			//formatting date
			var d = new Date( parseInt(data.date) );
			d = formatDate( d, 'HH:mm dd/MM/yyyy' );
			data.date = d;
			$backupDataViewer.find('.backup-name .value').html( data.name );
			$backupDataViewer.find('.relative-progress-value').html( formatNumber(data.relative_progress) );
			$backupDataViewer.find('.relative-progress .bar').width( data.relative_progress + '%' );
			$backupDataViewer.find('.total-progress-value').html( formatNumber(data.total_progress) );
			$backupDataViewer.find('.total-progress .bar').width( data.total_progress + '%' );
			$backupDataViewer.find('.date .value').html( data.date );
			$backupDataViewer.find('.status .value').html( data.status );
			$backupDataViewer.find('.metadata .value').html( data.metadata );
			$backupDataViewer.find('.files .value').html( data.files_number );
			$backupDataViewer.find('.size .value').html( data.size );
			$backupDataViewer.find('.progress .value').html( formatNumber(data.total_progress) + '%' );
		}


		$obfuscationLayer.on('click', hide);
		$closeButton.on('click', hide);


		return {
			show: show,
			hide: hide,
			fill: fill
		}


	}
	var backupDataViewer = BackupDataViewer();






	$(document).ready(function() {
		init();
	});

	$(window).resize(function() {
		backupInterface.build();
		backupInterface.handleScroll();
	});

}
