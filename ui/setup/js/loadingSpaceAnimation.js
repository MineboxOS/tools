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

//requires getRandomString & getRandomInt

function LoadingSpace() {
	var $loadingSpace = $('#loading-space');
	var $stars;

	function generateStars() {
		var count = getRandomInt(10,20);
		for ( var n = 0; n < count; n++ ) {
			$loadingSpace.append( '<span class="star" id="' + getRandomString(10) + '"></span>' );
		}
		$stars = $('.star');
	}

	function init() {
		generateStars();
		for ( var n = 0; n < $stars.length; n++ ) {
			animateStars( $($stars[n]) );
		}
	}

	function animateStars( $element ) {
		var props = {};
		var timeout;
		var choice;
		//invert direction
		if ( $element.attr('data-position') == 'left' ) {
			//move to right
			props.left = '1200%';
			$element.attr('data-position', 'right');
		} else if ( $element.attr('data-position') == 'right' ) {
			//move to left
			props.left = '-1200%';
			$element.attr('data-position', 'left');
		} else {
			//left has not been set yet, moving to random
			choice = getRandomInt(0,1);

			if ( !choice ) {
				//move to left
				props.left = '-1200%';
				$element.attr('data-position', 'left');
			} else {
				//move to right
				props.left = '1200%';
				$element.attr('data-position', 'right');
			}
		}

		props.top = getRandomInt(10, 90) + '%';
		props.width = getRandomInt(80,200);
		props.height = props.width / getRandomInt(20,30); //a fraction of its width so it is stylized horizontally
		props.duration = getRandomInt(8,50) / 10;

		$element.css({
			'width': props.width,
			'height': props.height,
			'top': props.top,
			'transform': 'translateX(' + props.left + ')',
			'transition': 'transform ' + props.duration + 's ease, margin-left ' + props.duration + 's ease'
		});

		timeout = setTimeout(function() {
			reanimateStars( $element );
		}, (props.duration * 1000) + 10);

	}

	function reanimateStars( $element ) {
		animateStars($element);
	}


	return {
		init: init
	}

}