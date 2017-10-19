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

var instascanManager = InstascanManager();

function InstascanManager() {

	var $instascanBox = $('#instascan-box');
	var videoElementID = 'instascan-video';
	let scanner = null;

	function scan(cb) {
		scanner = new Instascan.Scanner({
			video: document.getElementById(videoElementID)
		});
		scanner.addListener('scan', function (content) {
			hide(function() {
				cb(content);
			});
		});
		Instascan.Camera.getCameras().then(function (cameras) {
			if (cameras.length > 0) {
				scanner.start(cameras[0]);
			} else {
				alert('No cameras found.');
			}
		}).catch(function (e) {
			console.error(e);
		});
	}

	function show(cb) {
		$instascanBox.addClass('active');
		if ( cb ) { setTimeout(cb, 300) };
	}

	function hide(cb) {
		$instascanBox.removeClass('active');
		scanner.stop();
		if ( cb ) { setTimeout(cb, 300) };
	}


	return {
		scan: scan,
		show: show,
		hide: hide
	}
}