(function($, undefined) {
	'use strict';

	var startAtTime = false,
		stopAtTime = false,
		// Keep all Players on site
		players = [],
		// Timecode as described in http://podlove.org/deep-link/
		// and http://www.w3.org/TR/media-frags/#fragment-dimensions
		timecodeRegExp = /(?:(\d+):)?(\d+):(\d+)(\.\d+)?([,-](?:(\d+):)?(\d+):(\d+)(\.\d+)?)?/,
		podlovewebplayer = $.fn.podlovewebplayer = function podlovewebplayer( method){
			// this is the actual plugin
			if( method in methods){
				return methods[method].apply(this, [].slice.call(arguments,1));
			} else if( typeof method === 'object' || !method){
				return methods.init.apply( this, [].slice.call(arguments,0));
			}

			return this;
		},
		wrapperDummy = podlovewebplayer.wrapperDummy = (function(){
			// this function creates the dummy
			var wrapper = $(
				'<div class="podlovewebplayer_wrapper">'+
					'<div class="podlovewebplayer_meta">'+
						'<a class="bigplay" href="#"></a>'+
						'<div class="coverart"><img src="samples/coverimage.png" alt=""></div>'+
						'<h3 class="episodetitle">'+
							'<a href="{URL}">{TITLE}</a>'+
						'</h3>'+
						'<div class="subtitle">{SUBTITLE}</div>'+
						'<div class="togglers">'+
							'<a href="#" class="infowindow infobuttons icon-info-circle" title="More information about this"></a>'+
							'<a href="#" class="chaptertoggle infobuttons icon-list-bullet" title="Show/hide chapters"></a>'+
							'<a href="#" class="showcontrols infobuttons icon-clock" title="Show/hide time navigation controls"></a>'+
							'<a href="#" class="showsharebuttons infobuttons icon-export" title="Show/hide sharing controls"></a>'+
						'</div>'+
					'</div>'+
					'<div class="summary">{SUMMARY}</div>'+
					'<audio>{SOURCES}</audio>'+
					'<div class="podlovewebplayer_timecontrol podlovewebplayer_controlbox">'+
						'<a href="#" class="prevbutton infobuttons icon-to-start" title="Jump backward to previous chapter"></a>'+
						'<a href="#" class="nextbutton infobuttons icon-to-end" title="Jump to next chapter"></a>'+
						'<a href="#" class="rewindbutton infobuttons icon-fast-bw" title="Rewind 30 seconds"></a>'+
						'<a href="#" class="forwardbutton infobuttons icon-fast-fw" title="Fast forward 30 seconds"></a>'+
					'</div>'+
					'<div class="podlovewebplayer_sharebuttons podlovewebplayer_controlbox">'+
						'<a href="#" class="currentbutton infobuttons icon-link" title="Get URL for this"></a>'+
						'<a href="#" target="_blank" class="tweetbutton infobuttons icon-twitter" title="Share this on Twitter"></a>'+
						'<a href="#" target="_blank" class="fbsharebutton infobuttons icon-facebook" title="Share this on Facebook"></a>'+
						'<a href="#" target="_blank" class="gplusbutton infobuttons icon-gplus" title="Share this on Google+"></a>'+
						'<a href="#" target="_blank" class="adnbutton infobuttons icon-appnet" title="Share this on App.net"></a>'+
						'<a href="#" target="_blank" class="mailbutton infobuttons icon-mail" title="Share this via e-mail"></a>'+
					'</div>'+
					'<div class="podlovewebplayer_chapterbox showonplay">{CHAPTERS}</div>'+
					'<div class="podlovewebplayer_tableend"></div>'+
				'</div>');

			/**
			 * Save all the data in a single namespace.
			 */

			wrapper.data('podlovewebplayer', {
				ready : false,
				player : null,
				canplay : false
			});

			/**
			 * Below are the event handlers for various buttons. There are some design decions associated with
			 * this code which is documented here, so this information will not be lost in the future. Hello,
			 * future me, I am talking to you.
			 *
			 * `wrapper` in this scope is not the same wrapper that will later be in the HTML. It is barely a
			 * template. This `wrapper` will be `.clone(true)`d to create the actual wrapper. The `true` is important
			 * here. It means that events and data will be copied recursively to the newly created wrapper clone.
			 * So all these functions below cannot use the `wrapper` here but instead have to go and find the
			 * wrapper themselves.
			 *
			 * There is a second option which got rejected for sake of readability and flexibility. We could
			 * just delegate all events from the wrapper. While this might be slightly faster at creation as 
			 * well as at event execution the benefit would be rather small since people won't click a button
			 * more that two or three times.
			 *
			 */
			wrapper.find('.chaptertoggle').on('click.podlovewebplayer', function( event ){
				event.preventDefault();
				$(this).closest('.podlovewebplayer_wrapper').find('.podlovewebplayer_chapterbox').podlovewebplayer('toggleHeight');
			});

			wrapper.find('.prevbutton').on('click.podlovewebplayer', function( event ){
				event.preventDefault();
				var wrapper = $(this).closest('.podlovewebplayer_wrapper'),
					curr = wrapper.find('.chaptertr.active');

				wrapper.podlovewebplayer('play', function( oldTime){
					return oldTime > curr.data('start') + 10 ? curr.data('start') : curr.prev().data('start');
				});
			});

			wrapper.find('.nextbutton').on('click.podlovewebplayer', function( event ){
				event.preventDefault();
				var wrapper = $(this).closest('.podlovewebplayer_wrapper');

				wrapper.podlovewebplayer('play', wrapper.find('.chaptertr.active').next().data('start'));
			});

			wrapper.find('.rewindbutton').on('click.podlovewebplayer', function( event ){
				event.preventDefault();
				var wrapper = $(this).closest('.podlovewebplayer_wrapper');

				wrapper.podlovewebplayer( 'play', function(oldTime){
					return oldTime - 30;
				});
			});

			wrapper.find('.forwardbutton').on('click.podlovewebplayer', function( event ){
				event.preventDefault();
				var wrapper = $(this).closest('.podlovewebplayer_wrapper');

				wrapper.podlovewebplayer( 'play', function(oldTime){
					return oldTime + 30;
				});
			});

			wrapper.find('a.infowindow').on('click.podlovewebplayer', function( event ){
				event.preventDefault();
				var wrapper = $(this).closest('.podlovewebplayer_wrapper'),
					summary = wrapper.find('.summary');

				summary.podlovewebplayer('toggleHeight');
			});

			wrapper.find('a.showcontrols').on('click.podlovewebplayer', function( event ){
				event.preventDefault();
				var wrapper = $(this).closest('.podlovewebplayer_wrapper');

				wrapper.find('.podlovewebplayer_timecontrol').toggleClass('active');
				wrapper.find('.podlovewebplayer_sharebuttons').removeClass('active');
			});

			wrapper.find('a.showsharebuttons').on('click.podlovewebplayer', function( event ){
				event.preventDefault();
				var wrapper = $(this).closest('.podlovewebplayer_wrapper');

				wrapper.find('.podlovewebplayer_sharebuttons').toggleClass('active');
				wrapper.find('.podlovewebplayer_timecontrol').removeClass('active');
			});

			wrapper.find('.bigplay').on('click.podlovewebplayer', function( event ){
				event.preventDefault();

				var wrapper = $(this).closest('.podlovewebplayer_wrapper'),
					player = wrapper.data('podlovewebplayer').player;

				
				if (player.prop('paused')) {
					wrapper.podlovewebplayer('play');
				} else {
					wrapper.podlovewebplayer('pause');
				}
			});

			// Social foo

			var social = podlovewebplayer.social = {
				'.currentbutton' : function( title, url){
					window.prompt(
						'This URL directly points to the current playback position',
						url
					);
				},
				'.tweetbutton' : function( title, url){
					window.open(
						'https://twitter.com/share?text='+ encodeURI(title)+'&url='+encodeURI(url), 
						'tweet it', 
						'width=550,height=420,resizable=yes'
					);
				},
				'.fbsharebutton' : function( title, url){
					window.open(
						'http://www.facebook.com/share.php?t='+encodeURI(title)+'&u='+encodeURI(url),
						'share it',
						'width=550,height=340,resizable=yes'
					);
				},
				'.gplusbutton' : function( title, url){
					window.open(
						'https://plus.google.com/share?title='+encodeURI(title)+'&url='+encodeURI(url),
						'plus it',
						'width=550,height=420,resizable=yes'
					);
				},
				'.adnbutton' : function( title, url){
					window.open(
						'https://alpha.app.net/intent/post?text='+encodeURI(title)+'%20'+encodeURI(url),
						'plus it',
						'width=550,height=420,resizable=yes'
					);
				},
				'.mailbutton' : function( title, url){
					window.location = 'mailto:?subject='+encodeURI(title)+'&body='+encodeURI(title)+'%20%3C'+encodeURI(url)+'%3E';
				}
			};

			wrapper.find('.podlovewebplayer_sharebuttons').on('click.podlovewebplayer', function( event ){
				var a = $(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a');

				$.each( social, function( selector, fn){
					if( $(event.target).is(selector) ){
						event.preventDefault();

						fn(a.text(), a.attr('href'));
					}
				});
			});

			return wrapper;
		}());

	podlovewebplayer.defaults = {
		mejsoptions : {
			defaultVideoWidth: 480,
			defaultVideoHeight: 270,
			videoWidth: -1,
			videoHeight: -1,
			audioWidth: -1,
			audioHeight: 30,
			startVolume: 0.8,
			loop: false,
			enableAutosize: true,
			features: ['current','progress','duration','tracks','volume','fullscreen'],
			alwaysShowControls: false,
			iPadUseNativeControls: false,
			iPhoneUseNativeControls: false,
			AndroidUseNativeControls: false,
			alwaysShowHours: false,
			showTimecodeFrameCount: false,
			framesPerSecond: 25,
			enableKeyboard: true,
			pauseOtherPlayers: true,
			duration: false,
			plugins: ['flash', 'silverlight'],
			pluginPath: './libs/mediaelement/build/',
			flashName: 'flashmediaelement.swf',
			silverlightName: 'silverlightmediaelement.xap'
		},
		params: {
			chapterlinks: 'all',
			width: '100%',
			duration: false,
			chaptersVisible: false,
			timecontrolsVisible: false,
			sharebuttonsVisible: false,
			summaryVisible: false
		}
	};

	var methods = podlovewebplayer.methods = {
		init: function(options) {
			// turn each player in the current set into a Podlove Web Player
			return this.map(function(index, player){

				var richplayer = false,
					haschapters = false;

				// MEJS options default values
				var mejsoptions = $.extend({}, podlovewebplayer.defaults.mejsoptions);

				// Additional parameters default values
				var params = $.extend({}, podlovewebplayer.defaults.params, options);

				var orig = $(player);

				player = orig.clone();

				var wrapper = wrapperDummy.clone(true,true);

				//fine tuning params
				if (params.width.toLowerCase() == 'auto') {
					params.width = '100%';
				} else {
					params.width = params.width.replace('px', '');
				}

				//audio params
				if (player.is('audio')) {

					if (typeof params.audioWidth !== 'undefined') {
						params.width = params.audioWidth;
					}
					mejsoptions.audioWidth = params.width;
					
					//kill fullscreen button
					$.each(mejsoptions.features, function(i){
						if (this == 'fullscreen') {
							mejsoptions.features.splice(i, 1);
						}
					});

				//video params
				} else if (player.is('video')) {

					// VGL Zeile 317
					if (typeof params.height !== 'undefined') {
						mejsoptions.videoWidth = params.width;
						mejsoptions.videoHeight = params.height;
					}

					if (typeof player.attr('width') !== 'undefined') {
						params.width = player.attr('width');
					}
				}

				//duration can be given in seconds or in timecode format
				if (params.duration && params.duration != parseInt( params.duration, 10)) {
					var secArray = parseTimecode(params.duration);
					params.duration = secArray[0];
				}
				
				//Overwrite MEJS default values with actual data
				$.each(mejsoptions, function(key, value){
					if (typeof params[key] !== 'undefined') {
						mejsoptions[key] = params[key];
					}
				});

				//wrapper and init stuff
				if (params.width == parseInt( params.width, 10)) {
					params.width += 'px';
				}

				wrapper.find('audio').replaceWith(player);
				wrapper.css( 'width', params.width);

				var deepLink;

				players.push(player);

				//add params from html fallback area
				player.find('[data-pwp]').each(function(){
					params[$(this).data('pwp')] = $(this).html();
					$(this).remove();
				});

				//build rich player with meta data
				if ( params.chapters ||
						params.title ||
						params.subtitle ||
						params.summary ||
						params.poster ||
						player.attr('poster')
						) {

					//set status variable
					richplayer = true;
					
					wrapper.addClass('podlovewebplayer_' + player.get(0).tagName.toLowerCase());

					if(player.get(0).tagName == "AUDIO") {
						
						//kill play/pause button from miniplayer
						$.each(mejsoptions.features, function(i){
							if (this == 'playpause') {
								mejsoptions.features.splice(i,1);
							}
						});

						if ( params.poster ) {
							wrapper.find('.coverart > img').attr('src', params.poster);
						}
						if ( player.attr('poster') ) {
							wrapper.find('.coverart > img').attr('src', player.attr('poster'));
						}
					}

					// TODO
					if (player.get(0).tagName == "VIDEO") {
						wrapper.prepend('<div class="podlovewebplayer_top"></div>');
						wrapper.append('<div class="podlovewebplayer_meta"></div>');
					}
					
					if ( params.title ) {
						if ( params.permalink ) {
							wrapper.find('.episodetitle > a').attr('href', params.permalink).html( params.title);
						} else {
							wrapper.find('.episodetitle').html( params.title);
						}
					}
					if ( params.subtitle ) {
						wrapper.find('.subtitle').html( params.subtitle);
					}

					
					if (typeof params.summary !== 'undefined') {
						wrapper.find('.summary').html(params.summary).toggleClass('active', params.summaryVisible);
					}
					if (typeof params.chapters === 'undefined') {
						wrapper.find('.chaptertoggle').hide();
					}
				}

				wrapper.find('.podlovewebplayer_timecontrol').toggleClass('active', params.timecontrolsVisible);
				
				var sharebuttonsActive = "";
				if (params.sharebuttonsVisible == true) {
					sharebuttonsActive = " active";
				}
				
				//TODO				
				/*if (typeof wrapper.closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href') !== 'undefined') {
					wrapper.append('<div class="podlovewebplayer_sharebuttons podlovewebplayer_controlbox'+sharebuttonsActive+'"></div>');
				}*/

				//build chapter table
				if ( params.chapters ) {
					haschapters = true;

					wrapper.find('.podlovewebplayer_chapterbox').replaceWith(generateChapterTable(params));
				}


				if ( !richplayer && !haschapters) {
					wrapper.find('.podlovewebplayer_tableend').remove();
				}

				// parse deeplink
				deepLink = parseTimecode(location.href);
				if (deepLink !== false && players.length === 1) {
					player.attr({preload: 'auto', autoplay: 'autoplay'});
					startAtTime = deepLink[0];
					stopAtTime = deepLink[1];
				}

				wrapper.on('success.podlovewebplayer', function( event, player){
					wrapper.data('podlovewebplayer').player = $(player);
					addBehavior(player, params, wrapper);
					if (deepLink !== false && players.length === 1) {
						$('html, body').delay(150).animate({
							scrollTop: $('.podlovewebplayer_wrapper:first').offset().top - 25
						});
					}
					wrapper.trigger('ready');
				});

				if( params.ready){
					wrapper.on('ready.podlovewebplayer', params.ready);
				}

				if( params.success){
					wrapper.on('success.podlovewebplayer', params.success);
				}

				// init MEJS to player
				mejsoptions.success = function (player) {
					wrapper.trigger('success', player);
				};

				// after 2 seconds check for errors
				setTimeout($.proxy(methods.monitor, wrapper), 200);
				$(orig).replaceWith(wrapper);
				player.mediaelementplayer(mejsoptions);
				

				return wrapper;
			});
		},

		/**
		 * Toggles the height of an element depending on its activity state.
		 */
		toggleHeight: function () {
			return this.toggleClass('active').height(function(){
				return $(this).hasClass('active') ? $(this).data('height') : 0;
			});
		},

		/**
		 * Starts a player. To be called on a wrapper.
		 * @param time (optional)
		 *
		 * The following `play` function unifies the various ways a player has to be started. There are three
		 * basic ways to call this function.
		 *
		 * 1) `$('.podlovewebplay_wrapper').podlovewebplayer('play')`
		 * This just resumes a player. Yes, it has to be called on the wrapper since
		 * that is the only element which has a reference to the player interface. Note: the player interface
		 * is not the same as the `<audio>` element since that is useless when the flash fallback is active.
		 * If you call this method on multiple wrappers at once all might start at the same time! If the track
		 * is not yet loaded, the player will start as soon as possible.
		 *
		 * 2) `$('.podlovewebplay_wrapper').podlovewebplayer('play', 123)`
		 * If you call the play method with a number as second argument, that is interpreted as the starting
		 * time. The time is in seconds.
		 *
		 * 3) `$('.podlovewebplay_wrapper').podlovewebplayer('play', fn)`
		 * If the player is called with a function as second argument instead of a number, that function is
		 * called with `this` pointing to the wrapper and the first anf only argument being the time the player
		 * is at right now. The return value of that function call is then processed as in case 2.
		 *
		 */
		play: function ( time){
			return this.each(function(){
				var player = $(this).data('podlovewebplayer').player, rawPlayer;
				if( !player) return;

				rawPlayer = player.get(0);

				if( $(this).data('podlovewebplayer').canplay){
					rawPlayer.play();
					if( time != null){
						$(this).podlovewebplayer('time', time);
					}
				} else {
					$(this).one('canplay.podlovewebplayer', function(){
						$(this).data('podlovewebplayer').canplay = true;
						$(this).podlovewebplayer( 'play', time);
					});
				}

			});
		},

		/**
		 * Accessor for the currentTime property.
		 * @param time (optional)
		 *
		 * This method changes a players currentTime property. If you want to make the player start playing
		 * from a certain point of time immediately, refer to the `play` method instead. That takes an
		 * optional time argument.
		 * 
		 * 1) `$('.podlovewebplay_wrapper').podlovewebplayer('time')`
		 * When called without an argument, this methoed simply returns the currentTime
		 * of the first player in the collection.
		 *
		 * 2) `$('.podlovewebplay_wrapper').podlovewebplayer('time', 123)`
		 * Sets the time to be 123 and returns the jQuery collection.
		 *
		 * 3) `$('.podlovewebplay_wrapper').podlovewebplayer('time', fn)`
		 * Awesome accessor functionality!
		 */
		time : function( time){
			if( time == null){
				return this.data('podlovewebplayer').player[0].currentTime;
			}

			return this.each(function(){
				var player = $(this).data('podlovewebplayer').player.get(0),
					newTime = $.isFunction(time) ? time.call( this, player.currentTime || 0) : time;

				var validTime = typeof newTime == 'number' && newTime >= 0;
				if( !validTime) {
					newTime = 0;
				}

				// call the appropriate method for me.js
				player.setCurrentTime(newTime);
			});
		},

		/**
		 * Pauses a player. `this` is a collection of wrappers
		 */
		pause: function(){
			return this.each(function(){
				$(this).data('podlovewebplayer').player.get(0).pause();
			});
		},

		/**
		 * Bind an handler on the `ready` event or execute it, if the event has already been fired.
		 */
		ready: function(fn){
			return this.each(function(){
				if( $(this).data('podlovewebplayer').ready){
					fn.call(this);
				} else {
					$(this).one('ready', fn).one('ready', function(){
						$(this).data('podlovewebplayer').ready = true;
					});
				}
			});
		},

		/**
		 * Check for errors.
		 */
		monitor: function(){
			return $(this).each(function(){
				var player = $(this).data('podlovewebplayer').player,
					rawPlayer = player.get(0);

				// see if the player could load a resource
				if( player.prop('pluginType') == 'native'){
					if( player.prop('error') ){
						console.log( 'The player failed to load any resource. Error code: ', player.prop('error').code);
					}
				} else {
					// how do we find out, if the flash player could load a resource?
				}
			});
		}

	};


	/**
	 * Given a list of chapters, this function creates the chapter table for the player.
	 */
	var generateChapterTable = function generateChapterTable( params){
		
		// cache the templates and clone them later on
		if( !generateChapterTable.div){
			generateChapterTable.div = $(
			'<div class="podlovewebplayer_chapterbox showonplay"><table class="podlovewebplayer_chapters">' +
			'<caption>Podcast Chapters</caption><thead><tr>' +
			'<th scope="col">Chapter Number</th>' +
			'<th scope="col">Start time</th>' +
			'<th scope="col">Title</th>' +
			'<th scope="col">Duration</th>' +
			'</tr></thead>' +
			'<tbody></tbody></table></div>');
			
			//this is a "template" for each chapter row
			generateChapterTable.rowDummy = $(
			'<tr class="chaptertr" data-start="" data-end="">' +
			'<td class="starttime"><span></span></td>' +
			'<td class="chaptername"></td>' +
			'<td class="timecode"><span></span></td>' +
			'</tr>');

			//attach events
			generateChapterTable.div.on( 'click.podlovewebplayer', '.chaptertr', function(event){
				event.preventDefault();

				// I dont know, what the next if-statement might be useful for.
				if ( !( $(event.delegateTarget).find('table').hasClass('linked_all') || $(this).hasClass('loaded')))
					return;

				var startTime = $(this).data('start');

				$(this).closest('.podlovewebplayer_wrapper').podlovewebplayer('play', startTime);
			});
		}
		
		var div = generateChapterTable.div.clone(true),
			rowDummy = generateChapterTable.rowDummy,
			table = div.children('table'),
			tbody = table.children('tbody');

		if (params.chaptersVisible === true) {
			div.addClass('active');
		}

		if (params.chapterlinks != 'false') {
			table.addClass('linked linked_'+params.chapterlinks);
		}


		//prepare row data
		var tempchapters = [];
		var maxchapterlength = 0;
		var maxchapterstart  = 0;

		//first round: kill empty rows and build structured object
		$.each(params.chapters.split("\n"), function(i, chapter){

			//exit early if this line contains nothing but whitespace
			if( !/\S/.test(chapter)) return;

			//extract the timestamp
			var line = $.trim(chapter);
			var tc = parseTimecode(line.substring(0,line.indexOf(' ')));
			var chaptitle = $.trim(line.substring(line.indexOf(' ')));
			tempchapters.push({start: tc[0], title: chaptitle });
		});

		//second round: collect more information
		$.each(tempchapters, function(i){
			var next = tempchapters[i+1];

			// exit early if this is the final chapter
			if( !next) return;
			
			// we need this data for proper formatting
			this.end = next.start;
			if(Math.round(this.end-this.start) > maxchapterlength) {
				maxchapterlength = Math.round(this.end-this.start);
				maxchapterstart = Math.round(next.start);
			}
		});

		//third round: build actual dom table
		$.each(tempchapters, function(i){
			var finalchapter = !tempchapters[i+1],
				duration = Math.round(this.end-this.start),
				forceHours = (maxchapterlength >= 3600),
				row = rowDummy.clone();

			//make sure the duration for all chapters are equally formatted
			if (!finalchapter) {
				this.duration = generateTimecode([duration], forceHours);
			} else {
				if (params.duration == 0) {
					this.end = 9999999999;
					this.duration = '…';
				} else {
					this.end = params.duration;
					this.duration = generateTimecode([Math.round(this.end-this.start)], forceHours);
				}
			}


			if(i % 2) {
				row.addClass('oddchapter');
			}

			//deeplink, start and end
			row.attr({
				'data-start': this.start,
				'data-end' : this.end
			});

			//if there is a chapter that starts after an hour, force '00:' on all previous chapters
			forceHours = (maxchapterstart >= 3600);

			//insert the chapter data
			row.find('.starttime > span').text( generateTimecode([Math.round(this.start)], forceHours));
			row.find('.chaptername').html(this.title);
			row.find('.timecode > span').text( this.duration);

			row.appendTo( tbody);
		});

		table.show();
		return div;
	};


	/**
	 * add chapter behavior and deeplinking: skip to referenced
	 * time position & write current time into address
	 * @param player object
	 */
	var addBehavior = function(player, params, wrapper) {
		var jqPlayer = $(player);

		/**
		 * The `player` is an interface. It provides the play and pause functionality. The
		 * `layoutedPlayer` on the other hand is a DOM element. In native mode, these two
		 * are one and the same object. In Flash though the interface is a plain JS object.
		 */
			
		if (players.length === 1) {
			// check if deeplink is set
			checkCurrentURL();
		}

		// cache some jQ objects
		var metainfo = wrapper.find('.podlovewebplayer_meta'),
			summary = wrapper.find('.summary'),
			chapterdiv = wrapper.find('.podlovewebplayer_chapterbox'),
			list = wrapper.find('table'),
			marks = list.find('tr'),
			bigplay = wrapper.find('.bigplay');

		// fix height of summary for better toggability
		summary.height(function(i, h){
			$(this).data('height', h);
			return $(this).hasClass('active') ? h : 0;
		});

		chapterdiv.height(function(){
			var h = $(this).find('.podlovewebplayer_chapters').height();
			$(this).data('height', h);
			return $(this).hasClass('active') ? h : 0;
		});
		
		/**
		 * TODO: warum sollte metainfo jemals != 1 sein? Video?
		 */
		if (metainfo.length === 1) {

			
		}

		// add duration of final chapter
		if (player.duration) {
			marks.find('.timecode code').last().text(function(){
				var start = Math.floor($(this).closest('tr').data('start'));
				var end = Math.floor(player.duration);
				return generateTimecode([end-start]);
			});
		}

		jqPlayer.on({
			'play playing': $.proxy( bigplay, 'addClass', 'playing'),
			'pause': $.proxy( bigplay, 'removeClass', 'playing')
		});

		// wait for the player or you'll get DOM EXCEPTIONS
		jqPlayer.bind('canplay', function () {
			wrapper.data( 'podlovewebplayer').canplay = true;

			// add Deeplink Behavior if there is only one player on the site
			if (players.length === 1) {
				jqPlayer.bind('play timeupdate pause', function(){
					var time = wrapper.podlovewebplayer('time');

					location.hash = 't=' + generateTimecode([time]);
				});

				checkCurrentURL();

				// handle browser history navigation
				$(window).bind('hashchange onpopstate', checkCurrentURL);
			}
		});

		// always update Chaptermarks though
		jqPlayer.bind('timeupdate', function () {
			// update the chapter list when the data is loaded
			marks.removeClass('active');

			var time = wrapper.podlovewebplayer('time');

			marks.filter(function(){
				var mark       = $(this),
					startTime  = mark.data('start'),
					endTime    = mark.data('end'),
					isActive   = time > startTime - 0.3 && time <= endTime;
				return isActive;
			}).addClass('active');
		});
	};


	/**
	 * return number as string lefthand filled with zeros
	 * @param number number
	 * @param width number
	 * @return string
	 **/
	var zeroFill = function(number, width) {
		width -= number.toString().length;
		return width > 0 ? new Array(width + 1).join('0') + number : number + '';
	};


	/**
	 * accepts array with start and end time in seconds
	 * returns timecode in deep-linking format
	 * @param times array
	 * @param forceHours bool (optional)
	 * @return string
	 **/
	var generateTimecode = $.generateTimecode = function(times, forceHours) {
		function generatePart(seconds) {
			var part, hours, milliseconds;
			// prevent negative values from player
			if (!seconds || seconds <= 0) {
				return forceHours ? '00:00:00' : '00:00';
			}

			// required (minutes : seconds)
			part = zeroFill(Math.floor(seconds / 60) % 60, 2) + ':' +
					zeroFill(Math.floor(seconds % 60) % 60, 2);

			hours = zeroFill(Math.floor(seconds / 60 / 60), 2);
			hours = hours === '00' && !forceHours ? '' : hours + ':';
			milliseconds = zeroFill(Math.floor(seconds % 1 * 1000), 3);
			milliseconds = milliseconds === '000' ? '' : '.' + milliseconds;

			return hours + part + milliseconds;
		}

		if (times[1] > 0 && times[1] < 9999999 && times[0] < times[1]) {
			return generatePart(times[0]) + ',' + generatePart(times[1]);
		}

		return generatePart(times[0]);
	};

	/**
	 * parses time code into seconds
	 * @param string timecode
	 * @return number
	 **/
	var parseTimecode = function(timecode) {
		var parts, startTime = 0, endTime = 0;

		if (timecode) {
			parts = timecode.match(timecodeRegExp);

			if (parts && parts.length === 10) {
				// hours
				startTime += parts[1] ? parseInt( parts[1], 10) * 60 * 60 : 0;
				// minutes
				startTime += parseInt( parts[2], 10) * 60;
				// seconds
				startTime += parseInt( parts[3], 10);
				// milliseconds
				startTime += parts[4] ? parseFloat( parts[4]) : 0;
				// no negative time
				startTime = Math.max(startTime, 0);

				// if there only a startTime but no endTime
				if (parts[5] === undefined) {
					return [startTime, false];
				}

				// hours
				endTime += parts[6] ? parseInt( parts[6], 10) * 60 * 60 : 0;
				// minutes
				endTime += parseInt( parts[7], 10) * 60;
				// seconds
				endTime += parseInt( parts[8], 10);
				// milliseconds
				endTime += parts[9] ? parseFloat( parts[9]) : 0;
				// no negative time
				endTime = Math.max(endTime, 0);

				return (endTime > startTime) ? [startTime, endTime] : [startTime, false];
			}
		}
		return false;
	};

	var checkCurrentURL = function() {
		var deepLink;
		deepLink = parseTimecode(location.href);
		if (deepLink !== false) {
			startAtTime = deepLink[0];
			stopAtTime = deepLink[1];
		}
	};

	var checkTime = function (e) {
		if (players.length > 1) { return; }
		var player = e.data.player;
		if (startAtTime !== false && 
				//Kinda hackish: Make sure that the timejump is at least 1 second (fix for OGG/Firefox)
				(typeof player.lastCheck === 'undefined' || Math.abs(startAtTime - player.lastCheck) > 1)) {
			player.setCurrentTime(startAtTime);
			player.lastCheck = startAtTime;
			startAtTime = false;
		}
		if (stopAtTime !== false && player.currentTime >= stopAtTime) {
			player.pause();
			stopAtTime = false;
		}
	};
	
}(jQuery));
