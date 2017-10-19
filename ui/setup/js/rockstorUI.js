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

//requires notify


var rockstorLogin = RockstorLogin();


function RockstorLogin() {

	var CONFIG = {
		urls: {
			setup: '/setup_user',
			appliances: '/api/appliances',
			login: '/api/login'
		}
	};
	var info = {};

	function updateInfo() {
		if ( progressScreen.getProcess() == 'register' ) {
			info.username = $('.register-section .register-username').val();
			info.password = $('.register-section .register-password').val();
			info.passwordRepeat = $('.register-section .register-password-repeat').val();
			info.hostname = $('.register-section .register-hostname').val();
		} else if ( progressScreen.getProcess() == 'recover' ) {
			info.username = 'minebox'
			info.password = 'minebox';
			info.passwordRepeat = 'minebox';
			info.hostname = 'demo';
		}
	}


	function init(cb) {


		//updating users info
		updateInfo();

		//calling to setup
		$.ajax({
			url: CONFIG.urls.setup,
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				username: info.username,
				password: info.password,
				is_active: true
			})
		})
		.done(function(data) {





			//calling to login
			$.ajax({
				url: CONFIG.urls.login,
				method: 'POST',
				dataType: 'json',
				data: {
					username: info.username,
					password: info.password
				}
			})
			.done(function(data) {






				//the cookie is set now
				//calling to appliances
				$.ajax({
					url: CONFIG.urls.appliances,
					method: 'POST',
					dataType: 'json',
					contentType: 'application/json',
					headers: {
						"X-CSRFToken": Cookies.get('csrftoken')
					},
					data: JSON.stringify({
						hostname: info.hostname,
						current_appliance: true
					})
				})
				.done(function(data) {




					//we're done
					if ( cb ) {
						cb();
					}







				}).
				fail(function(request, textStatus, errorThrown) {
					//something failed
					var notify = new Notify({message:'We couldn\'t call to appliances.'});
					notify.print();
				});




			}).
			fail(function(request, textStatus, errorThrown) {
				//something failed
				var notify = new Notify({message:'We couldn\'t log you in.'});
				notify.print();
			});



		}).
		fail(function(request, textStatus, errorThrown) {
			//something failed
			var notify = new Notify({message:'We couldn\'t setup the user.'});
			notify.print();
		});



	}


	return {
		init: init
	}


}