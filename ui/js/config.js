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

var config = {
	mug: {
		url: '/mug/'
		//url: 'https://' + location.hostname + ':5000/'
	},
	views: {
		path: 'views/',
		interval: 200, //default 200
		containerID: 'wrapper',
		map: {
			'dashboard': 'dashboard.html',
			'wallet': 'wallet.html',
			'contracts': 'contracts.html',
			'backups': 'backups.html',
			'settings': 'settings.html'
		},
		buttons: {
			class: 'active', //string that will be added to buttons to set them active
			selector: '#menu li', //string to jQuery-select button elements
			attribute: 'data-go' //attribute that holds the id of the content that view.buttons must show
		},
		messages: {
			fail: 'Something went wrong. Please try again.'
		}
	},
	fullHeight: {
		exclude: [
			'#header'
		]
	},
};