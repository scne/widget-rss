/* exported config */
if (typeof angular !== "undefined") {
  angular.module("risevision.widget.rss.config", [])
    .value("layout4x1", "https://s3.amazonaws.com/widget-rss/1.0.0/dist/layout-4x1.html")
    .value("layout2x1", "https://s3.amazonaws.com/widget-rss/1.0.0/dist/layout-2x1.html")
    .value("layout1x2", "https://s3.amazonaws.com/widget-rss/1.0.0/dist/layout-1x2.html");

  angular.module("risevision.common.i18n.config", [])
    .constant("LOCALES_PREFIX", "locales/translation_")
    .constant("LOCALES_SUFIX", ".json");
}

var config = {};




/*
 *  Project: Auto-Scroll
 *  Description: Auto-scroll plugin for use with Rise Vision Widgets
 *  Author: @donnapep
 *  License: MIT
 */

;(function ($, window, document, undefined) {
	"use strict";

	var pluginName = "autoScroll",
		defaults = {
			by: "continuous",
			speed: "medium",
			pause: 5,
			click: false,
			minimumMovement: 3 // Draggable default value - http://greensock.com/docs/#/HTML5/Drag/Draggable/
		};


	function Plugin(element, options) {
		this.element = element;
		this.page = $(element).find(".page");
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.isLoading = true;
		this.draggable = null;
		this.tween = null;
		this.calculateProgress = null;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			var speed, duration;
			var self = this;
			var scrollComplete = null;
			var pageComplete = null;
			var elementHeight = $(this.element).outerHeight(true);
			var pauseHeight = elementHeight;
			var max = this.element.scrollHeight - this.element.offsetHeight;

			function pauseTween() {
				self.tween.pause();

				TweenLite.killDelayedCallsTo(self.calculateProgress);
				TweenLite.killDelayedCallsTo(scrollComplete);
				// Only used when scrolling by page.
				TweenLite.killDelayedCallsTo(pageComplete);
			}

			this.calculateProgress = function() {
				// Set pauseHeight to new value.
				pauseHeight = $(self.element).scrollTop() +
					elementHeight;

				self.tween.progress($(self.element).scrollTop() / max)
					.play();
			};

			if (this.canScroll()) {
				// Set scroll speed.
				if (this.options.by === "page") {
					if (this.options.speed === "fastest") {
						speed = 0.4;
					}
					else if (this.options.speed === "fast") {
						speed = 0.8;
					}
					else if (this.options.speed === "medium") {
						speed = 1.2;
					}
					else if (this.options.speed === "slow") {
						speed = 1.6;
					}
					else {
						speed = 2;
					}

					duration = this.page.outerHeight(true) /
						$(this.element).outerHeight(true) * speed;
				}
				else {  // Continuous or by row
					if (this.options.speed === "fastest") {
						speed = 60;
					}
					else if (this.options.speed === "fast") {
						speed = 50;
					}
					else if (this.options.speed === "medium") {
						speed = 40;
					}
					else if (this.options.speed === "slow") {
						speed = 30;
					}
					else {
						speed = 20;
					}

					duration = Math.abs((this.page.outerHeight(true) -
						$(this.element).outerHeight(true)) / speed);
				}

				Draggable.create(this.element, {
					type: "scrollTop",
					throwProps: true,
					edgeResistance: 0.75,
					minimumMovement: self.options.minimumMovement,
					onPress: function() {
						pauseTween();
					},
					onRelease: function() {
						if (self.options.by !== "none") {
							/* Figure out what the new scroll position is and
							 translate that into the progress of the tween (0-1)
							 so that we can calibrate it; otherwise, it'd jump
							 back to where it paused when we resume(). */
							TweenLite.delayedCall(self.options.pause, self.calculateProgress);
						}
					},
					onClick: function() {
						if (self.options.click) {
							pauseTween();
							$(self.element).trigger("scrollClick", [this.pointerEvent]);
						}
					}
				});

				this.draggable = Draggable.get(this.element);

				this.tween = TweenLite.to(this.draggable.scrollProxy, duration, {
					scrollTop: max,
					ease: Linear.easeNone,
					delay: this.options.pause,
					paused: true,
					onUpdate: (this.options.by === "page" ? function() {
						if (Math.abs(self.draggable.scrollProxy.top()) >= pauseHeight) {
							self.tween.pause();

							// Next height at which to pause scrolling.
							pauseHeight += elementHeight;

							TweenLite.delayedCall(self.options.pause,
								pageComplete = function() {
									self.tween.resume();
								}
							);
						}
					} : undefined),
					onComplete: function() {
						TweenLite.delayedCall(self.options.pause,
							scrollComplete = function() {
								TweenLite.to(self.page, 1, {
									autoAlpha: 0,
									onComplete: function() {
										self.tween.seek(0).pause();

										if (self.options.by === "page") {
											pauseHeight = elementHeight;
										}

										$(self.element).trigger("done");
									}
								});
							}
						);
					}
				});

				// Hide scrollbar.
				TweenLite.set(this.element, { overflowY: "hidden" });
			} else {
				if (this.options.click) {
					// Account for content that is to be clicked when content not needed to be scrolled
					// Leverage Draggable for touch/click event handling
					Draggable.create(this.element, {
						type: "scrollTop",
						throwProps: true,
						edgeResistance: 0.95,
						minimumMovement: this.options.minimumMovement,
						onClick: function() {
							$(self.element).trigger("scrollClick", [this.pointerEvent]);
						}
					});

					this.draggable = Draggable.get(this.element);
				}
			}
		},
		// Check if content is larger than viewable area and if the scroll settings is set to actually scroll.
		canScroll: function() {
			return this.options && (this.page.height() > $(this.element).height());
		},
		destroy: function() {
			$(this.element).removeData();
			if (this.tween) {
				this.tween.kill();
			}

			if (this.draggable) {
				this.draggable.kill();
			}

			// Remove elements.
			this.element = null;
			this.page = null;
			this.options = null;
			this._defaults = null;
			this.draggable = null;
			this.tween = null;
			this.calculateProgress = null;
		}
	};

	Plugin.prototype.play = function() {
		if (this.canScroll() && this.options.by !== "none") {
			if (this.tween) {
				if (this.isLoading) {
					this.tween.play();
					this.isLoading = false;
				}
				else {
					TweenLite.to(this.page, 1, {autoAlpha: 1});
					TweenLite.delayedCall(this.options.pause, this.calculateProgress);
				}
			}
		}
	};

	Plugin.prototype.pause = function() {
		if (this.tween) {
			TweenLite.killDelayedCallsTo(this.calculateProgress);
			this.tween.pause();
		}
	};

	Plugin.prototype.stop = function() {
		if (this.tween) {
			TweenLite.killDelayedCallsTo(this.calculateProgress);
			this.tween.kill();
		}

		this.element = null;
		this.page = null;
	};

	// A lightweight plugin wrapper around the constructor that prevents
	// multiple instantiations.
	$.fn.autoScroll = function(options) {
		return this.each(function() {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
	};
})(jQuery, window, document);

/*
 *	jQuery dotdotdot 1.7.4
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Licensed under the MIT license.
 *	http://en.wikipedia.org/wiki/MIT_License
 */

(function( $, undef )
{
	if ( $.fn.dotdotdot )
	{
		return;
	}

	$.fn.dotdotdot = function( o )
	{
		if ( this.length == 0 )
		{
			$.fn.dotdotdot.debug( 'No element found for "' + this.selector + '".' );
			return this;
		}
		if ( this.length > 1 )
		{
			return this.each(
				function()
				{
					$(this).dotdotdot( o );
				}
			);
		}


		var $dot = this;

		if ( $dot.data( 'dotdotdot' ) )
		{
			$dot.trigger( 'destroy.dot' );
		}

		$dot.data( 'dotdotdot-style', $dot.attr( 'style' ) || '' );
		$dot.css( 'word-wrap', 'break-word' );
		if ($dot.css( 'white-space' ) === 'nowrap')
		{
			$dot.css( 'white-space', 'normal' );
		}

		$dot.bind_events = function()
		{
			$dot.bind(
				'update.dot',
				function( e, c )
				{
					$dot.removeClass("is-truncated");
					e.preventDefault();
					e.stopPropagation();

					switch( typeof opts.height )
					{
						case 'number':
							opts.maxHeight = opts.height;
							break;

						case 'function':
							opts.maxHeight = opts.height.call( $dot[ 0 ] );
							break;

						default:
							opts.maxHeight = getTrueInnerHeight( $dot );
							break;
					}

					opts.maxHeight += opts.tolerance;

					if ( typeof c != 'undefined' )
					{
						if ( typeof c == 'string' || ('nodeType' in c && c.nodeType === 1) )
						{
					 		c = $('<div />').append( c ).contents();
						}
						if ( c instanceof $ )
						{
							orgContent = c;
						}
					}

					$inr = $dot.wrapInner( '<div class="dotdotdot" />' ).children();
					$inr.contents()
						.detach()
						.end()
						.append( orgContent.clone( true ) )
						.find( 'br' )
						.replaceWith( '  <br />  ' )
						.end()
						.css({
							'height'	: 'auto',
							'width'		: 'auto',
							'border'	: 'none',
							'padding'	: 0,
							'margin'	: 0
						});

					var after = false,
						trunc = false;

					if ( conf.afterElement )
					{
						after = conf.afterElement.clone( true );
					    after.show();
						conf.afterElement.detach();
					}

					if ( test( $inr, opts ) )
					{
						if ( opts.wrap == 'children' )
						{
							trunc = children( $inr, opts, after );
						}
						else
						{
							trunc = ellipsis( $inr, $dot, $inr, opts, after );
						}
					}
					$inr.replaceWith( $inr.contents() );
					$inr = null;

					if ( $.isFunction( opts.callback ) )
					{
						opts.callback.call( $dot[ 0 ], trunc, orgContent );
					}

					conf.isTruncated = trunc;
					return trunc;
				}

			).bind(
				'isTruncated.dot',
				function( e, fn )
				{
					e.preventDefault();
					e.stopPropagation();

					if ( typeof fn == 'function' )
					{
						fn.call( $dot[ 0 ], conf.isTruncated );
					}
					return conf.isTruncated;
				}

			).bind(
				'originalContent.dot',
				function( e, fn )
				{
					e.preventDefault();
					e.stopPropagation();

					if ( typeof fn == 'function' )
					{
						fn.call( $dot[ 0 ], orgContent );
					}
					return orgContent;
				}

			).bind(
				'destroy.dot',
				function( e )
				{
					e.preventDefault();
					e.stopPropagation();

					$dot.unwatch()
						.unbind_events()
						.contents()
						.detach()
						.end()
						.append( orgContent )
						.attr( 'style', $dot.data( 'dotdotdot-style' ) || '' )
						.data( 'dotdotdot', false );
				}
			);
			return $dot;
		};	//	/bind_events

		$dot.unbind_events = function()
		{
			$dot.unbind('.dot');
			return $dot;
		};	//	/unbind_events

		$dot.watch = function()
		{
			$dot.unwatch();
			if ( opts.watch == 'window' )
			{
				var $window = $(window),
					_wWidth = $window.width(),
					_wHeight = $window.height();

				$window.bind(
					'resize.dot' + conf.dotId,
					function()
					{
						if ( _wWidth != $window.width() || _wHeight != $window.height() || !opts.windowResizeFix )
						{
							_wWidth = $window.width();
							_wHeight = $window.height();

							if ( watchInt )
							{
								clearInterval( watchInt );
							}
							watchInt = setTimeout(
								function()
								{
									$dot.trigger( 'update.dot' );
								}, 100
							);
						}
					}
				);
			}
			else
			{
				watchOrg = getSizes( $dot );
				watchInt = setInterval(
					function()
					{
						if ( $dot.is( ':visible' ) )
						{
							var watchNew = getSizes( $dot );
							if ( watchOrg.width  != watchNew.width ||
								 watchOrg.height != watchNew.height )
							{
								$dot.trigger( 'update.dot' );
								watchOrg = watchNew;
							}
						}
					}, 500
				);
			}
			return $dot;
		};
		$dot.unwatch = function()
		{
			$(window).unbind( 'resize.dot' + conf.dotId );
			if ( watchInt )
			{
				clearInterval( watchInt );
			}
			return $dot;
		};

		var	orgContent	= $dot.contents(),
			opts 		= $.extend( true, {}, $.fn.dotdotdot.defaults, o ),
			conf		= {},
			watchOrg	= {},
			watchInt	= null,
			$inr		= null;


		if ( !( opts.lastCharacter.remove instanceof Array ) )
		{
			opts.lastCharacter.remove = $.fn.dotdotdot.defaultArrays.lastCharacter.remove;
		}
		if ( !( opts.lastCharacter.noEllipsis instanceof Array ) )
		{
			opts.lastCharacter.noEllipsis = $.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis;
		}


		conf.afterElement	= getElement( opts.after, $dot );
		conf.isTruncated	= false;
		conf.dotId			= dotId++;


		$dot.data( 'dotdotdot', true )
			.bind_events()
			.trigger( 'update.dot' );

		if ( opts.watch )
		{
			$dot.watch();
		}

		return $dot;
	};


	//	public
	$.fn.dotdotdot.defaults = {
		'ellipsis'			: '... ',
		'wrap'				: 'word',
		'fallbackToLetter'	: true,
		'lastCharacter'		: {},
		'tolerance'			: 0,
		'callback'			: null,
		'after'				: null,
		'height'			: null,
		'watch'				: false,
		'windowResizeFix'	: true
	};
	$.fn.dotdotdot.defaultArrays = {
		'lastCharacter'		: {
			'remove'			: [ ' ', '\u3000', ',', ';', '.', '!', '?' ],
			'noEllipsis'		: []
		}
	};
	$.fn.dotdotdot.debug = function( msg ) {};


	//	private
	var dotId = 1;

	function children( $elem, o, after )
	{
		var $elements 	= $elem.children(),
			isTruncated	= false;

		$elem.empty();

		for ( var a = 0, l = $elements.length; a < l; a++ )
		{
			var $e = $elements.eq( a );
			$elem.append( $e );
			if ( after )
			{
				$elem.append( after );
			}
			if ( test( $elem, o ) )
			{
				$e.remove();
				isTruncated = true;
				break;
			}
			else
			{
				if ( after )
				{
					after.detach();
				}
			}
		}
		return isTruncated;
	}
	function ellipsis( $elem, $d, $i, o, after )
	{
		var isTruncated	= false;

		//	Don't put the ellipsis directly inside these elements
		var notx = 'a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style';

		//	Don't remove these elements even if they are after the ellipsis
		var noty = 'script, .dotdotdot-keep';

		$elem
			.contents()
			.detach()
			.each(
				function()
				{

					var e	= this,
						$e	= $(e);

					if ( typeof e == 'undefined' )
					{
						return true;
					}
					else if ( $e.is( noty ) )
					{
						$elem.append( $e );
					}
					else if ( isTruncated )
					{
						return true;
					}
					else
					{
						$elem.append( $e );
						if ( after && !$e.is( o.after ) && !$e.find( o.after ).length  )
						{
							$elem[ $elem.is( notx ) ? 'after' : 'append' ]( after );
						}
						if ( test( $i, o ) )
						{
							if ( e.nodeType == 3 ) // node is TEXT
							{
								isTruncated = ellipsisElement( $e, $d, $i, o, after );
							}
							else
							{
								isTruncated = ellipsis( $e, $d, $i, o, after );
							}

							if ( !isTruncated )
							{
								$e.detach();
								isTruncated = true;
							}
						}

						if ( !isTruncated )
						{
							if ( after )
							{
								after.detach();
							}
						}
					}
				}
			);
		$d.addClass("is-truncated");
		return isTruncated;
	}
	function ellipsisElement( $e, $d, $i, o, after )
	{
		var e = $e[ 0 ];

		if ( !e )
		{
			return false;
		}

		var txt			= getTextContent( e ),
			space		= ( txt.indexOf(' ') !== -1 ) ? ' ' : '\u3000',
			separator	= ( o.wrap == 'letter' ) ? '' : space,
			textArr		= txt.split( separator ),
			position 	= -1,
			midPos		= -1,
			startPos	= 0,
			endPos		= textArr.length - 1;


		//	Only one word
		if ( o.fallbackToLetter && startPos == 0 && endPos == 0 )
		{
			separator	= '';
			textArr		= txt.split( separator );
			endPos		= textArr.length - 1;
		}

		while ( startPos <= endPos && !( startPos == 0 && endPos == 0 ) )
		{
			var m = Math.floor( ( startPos + endPos ) / 2 );
			if ( m == midPos )
			{
				break;
			}
			midPos = m;

			setTextContent( e, textArr.slice( 0, midPos + 1 ).join( separator ) + o.ellipsis );
			$i.children()
				.each(
					function()
					{
						$(this).toggle().toggle();
					}
				);

			if ( !test( $i, o ) )
			{
				position = midPos;
				startPos = midPos;
			}
			else
			{
				endPos = midPos;

				//	Fallback to letter
				if (o.fallbackToLetter && startPos == 0 && endPos == 0 )
				{
					separator	= '';
					textArr		= textArr[ 0 ].split( separator );
					position	= -1;
					midPos		= -1;
					startPos	= 0;
					endPos		= textArr.length - 1;
				}
			}
		}

		if ( position != -1 && !( textArr.length == 1 && textArr[ 0 ].length == 0 ) )
		{
			txt = addEllipsis( textArr.slice( 0, position + 1 ).join( separator ), o );
			setTextContent( e, txt );
		}
		else
		{
			var $w = $e.parent();
			$e.detach();

			var afterLength = ( after && after.closest($w).length ) ? after.length : 0;

			if ( $w.contents().length > afterLength )
			{
				e = findLastTextNode( $w.contents().eq( -1 - afterLength ), $d );
			}
			else
			{
				e = findLastTextNode( $w, $d, true );
				if ( !afterLength )
				{
					$w.detach();
				}
			}
			if ( e )
			{
				txt = addEllipsis( getTextContent( e ), o );
				setTextContent( e, txt );
				if ( afterLength && after )
				{
					$(e).parent().append( after );
				}
			}
		}

		return true;
	}
	function test( $i, o )
	{
		return $i.innerHeight() > o.maxHeight;
	}
	function addEllipsis( txt, o )
	{
		while( $.inArray( txt.slice( -1 ), o.lastCharacter.remove ) > -1 )
		{
			txt = txt.slice( 0, -1 );
		}
		if ( $.inArray( txt.slice( -1 ), o.lastCharacter.noEllipsis ) < 0 )
		{
			txt += o.ellipsis;
		}
		return txt;
	}
	function getSizes( $d )
	{
		return {
			'width'	: $d.innerWidth(),
			'height': $d.innerHeight()
		};
	}
	function setTextContent( e, content )
	{
		if ( e.innerText )
		{
			e.innerText = content;
		}
		else if ( e.nodeValue )
		{
			e.nodeValue = content;
		}
		else if (e.textContent)
		{
			e.textContent = content;
		}

	}
	function getTextContent( e )
	{
		if ( e.innerText )
		{
			return e.innerText;
		}
		else if ( e.nodeValue )
		{
			return e.nodeValue;
		}
		else if ( e.textContent )
		{
			return e.textContent;
		}
		else
		{
			return "";
		}
	}
	function getPrevNode( n )
	{
		do
		{
			n = n.previousSibling;
		}
		while ( n && n.nodeType !== 1 && n.nodeType !== 3 );

		return n;
	}
	function findLastTextNode( $el, $top, excludeCurrent )
	{
		var e = $el && $el[ 0 ], p;
		if ( e )
		{
			if ( !excludeCurrent )
			{
				if ( e.nodeType === 3 )
				{
					return e;
				}
				if ( $.trim( $el.text() ) )
				{
					return findLastTextNode( $el.contents().last(), $top );
				}
			}
			p = getPrevNode( e );
			while ( !p )
			{
				$el = $el.parent();
				if ( $el.is( $top ) || !$el.length )
				{
					return false;
				}
				p = getPrevNode( $el[0] );
			}
			if ( p )
			{
				return findLastTextNode( $(p), $top );
			}
		}
		return false;
	}
	function getElement( e, $i )
	{
		if ( !e )
		{
			return false;
		}
		if ( typeof e === 'string' )
		{
			e = $(e, $i);
			return ( e.length )
				? e
				: false;
		}
		return !e.jquery
			? false
			: e;
	}
	function getTrueInnerHeight( $el )
	{
		var h = $el.innerHeight(),
			a = [ 'paddingTop', 'paddingBottom' ];

		for ( var z = 0, l = a.length; z < l; z++ )
		{
			var m = parseInt( $el.css( a[ z ] ), 10 );
			if ( isNaN( m ) )
			{
				m = 0;
			}
			h -= m;
		}
		return h;
	}


	//	override jQuery.html
	var _orgHtml = $.fn.html;
	$.fn.html = function( str )
	{
		if ( str != undef && !$.isFunction( str ) && this.data( 'dotdotdot' ) )
		{
			return this.trigger( 'update', [ str ] );
		}
		return _orgHtml.apply( this, arguments );
	};


	//	override jQuery.text
	var _orgText = $.fn.text;
	$.fn.text = function( str )
	{
		if ( str != undef && !$.isFunction( str ) && this.data( 'dotdotdot' ) )
		{
			str = $( '<div />' ).text( str ).html();
			return this.trigger( 'update', [ str ] );
		}
		return _orgText.apply( this, arguments );
	};


})( jQuery );

/* global gadgets, _ */

var RiseVision = RiseVision || {};
RiseVision.RSS = {};

RiseVision.RSS = (function (gadgets) {
  "use strict";

  var _additionalParams;

  var _prefs = null,
    _riserss = null,
    _content = null;

  var _currentFeed = null;

  /*
   *  Private Methods
   */
  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"), true, true, true, true, true);
  }

  function _done() {
    gadgets.rpc.call("", "rsevent_done", null, _prefs.getString("id"));
  }

  function _loadFonts() {
    // TODO: load fonts and inject any other css into the document head
  }

  /*
   *  Public Methods
   */
  function onContentDone() {
    _done();
  }

  function onContentReady() {
    _ready();
  }

  function onRiseRSSInit(feed) {
    _currentFeed = _.clone(feed);

    _content = new RiseVision.RSS.ContentRSS(_prefs, _additionalParams);
    _content.build(_currentFeed);
  }

  function onRiseRSSRefresh(feed) {
    //TODO: logic to come
    console.dir(feed);
  }

  function pause() {
    _content.scrollPause();
  }

  function play() {
    _content.scrollPlay();
  }

  function setAdditionalParams(names, values) {
    if (Array.isArray(names) && names.length > 0 && names[0] === "additionalParams") {
      if (Array.isArray(values) && values.length > 0) {
        _additionalParams = JSON.parse(values[0]);
        _prefs = new gadgets.Prefs();

        _loadFonts();

        // create and initialize the Component module instance
        _riserss = new RiseVision.RSS.RiseRSS(_additionalParams);
        _riserss.init();
      }
    }
  }

  function stop() {}

  return {
    "onContentDone": onContentDone,
    "onContentReady": onContentReady,
    "onRiseRSSInit": onRiseRSSInit,
    "onRiseRSSRefresh": onRiseRSSRefresh,
    "pause": pause,
    "play": play,
    "setAdditionalParams": setAdditionalParams,
    "stop": stop
  };

})(gadgets);

var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.RiseRSS = function (data) {
  "use strict";

  var _initialLoad = true;

  /*
   *  Public Methods
   */
  function init() {
    var rss = document.getElementById("rss");

    if (!rss) {
      return;
    }

    rss.addEventListener("rise-rss-response", function(e) {
      if (e.detail && e.detail.feed) {
        if (_initialLoad) {
          _initialLoad = false;

          RiseVision.RSS.onRiseRSSInit(e.detail.feed);

        } else {
          RiseVision.RSS.onRiseRSSRefresh(e.detail.feed);
        }
      }
    });

    rss.addEventListener("rise-rss-error", function (e) {
      console.log("rise-rss-error handler");

      if (e.detail) {
        console.log(e.detail);
      }

    });

    rss.setAttribute("url", data.url);
    rss.setAttribute("entries", data.queue);
    rss.setAttribute("refresh", data.refresh);

    // retrieve the JSON formatted RSS data
    rss.go();

  }

  return {
    "init": init
  };
};

var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};
RiseVision.RSS.Images = {};

RiseVision.RSS.Images = (function () {

  "use strict";

  var _imagesToLoad = [],
    _imageCount = 0,
    _images = [],
    _callback = null;

  function _onImageLoaded(image) {
    _images.push(image);
    _imageCount += 1;

    if (_imageCount === _imagesToLoad.length && _callback && typeof _callback === "function") {
      _callback();
    }
  }

  function _loadImage(image) {
    var img = new Image();

    img.onload = function () {
      _onImageLoaded(this);
    };

    img.onerror = function () {
      _onImageLoaded(this);
    };

    img.src = image.url;
  }

  function _loadImages() {
    var i;

    for (i = 0; i < _imagesToLoad.length; i += 1) {
      if (_imagesToLoad[i] === null) {
        _onImageLoaded(null);
      } else {
        _loadImage(_imagesToLoad[i]);
      }
    }
  }

  function load(images, callback) {
    if (images.length > 0) {
      _imagesToLoad = images;
      _images = [];
      _loadImages();

      if (callback) {
        _callback = callback;
      }
    } else if (callback) {
      callback();
    }
  }

  function getImages() {
    return _images;
  }

  return {
    getImages: getImages,
    load: load
  };

})();

/* global _ */

var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.ContentRSS = function (prefs, params) {

  "use strict";

  var SUPPORTED_IMAGES = ["image/bmp", "image/gif", "image/jpeg", "image/png", "image/tiff"];

  // Plugins
  var PLUGIN_SCROLL = "plugin_autoScroll";

  var _items = [],
    _imageUrls = [];

  var _initialBuild = true,
    _isScrolling = false;

  var $el;

  function _cache() {
    $el = {
      scrollContainer:      $("#scrollContainer"),
      page:                 $(".page")
    };
  }

  function _hasImages(imagesArr) {
    var list;

    if (imagesArr.length === 0) {
      return false;
    }

    list = _.without(imagesArr, null);

    return list.length !== 0;
  }

  function _urlExists(url, story) {
    if (url && story) {
      return story.indexOf(url !== -1);
    }

    return false;
  }

  function _useSeparator() {
    // TODO: no checkbox setting for allowing the choice to use a separator
    return params.scroll.by.transition === "continuous";
  }

  function _getItemHeight() {
    var height = prefs.getInt("rsH") / parseInt(params.stories);

    return (_useSeparator()) ? height - 1: height;
  }

  function _getScrollEl() {
    if (typeof $el.scrollContainer.data(PLUGIN_SCROLL) !== "undefined") {
      return $el.scrollContainer.data(PLUGIN_SCROLL);
    }

    return null;
  }

  function _getStory(item) {
    var story = null;

    if (_.has(item, "content:encoded")) {
      story = item["content:encoded"];
    } else if (_.has(item, "description")) {
      story = item.description;
    }

    return story;
  }

  function _getAuthor(item) {
    var author = null;

    if (_.has(item, "author")) {
      author = item.author;
    } else if (_.has(item, "dc:creator")) {
      author = item["dc:creator"];
    }

    return author;
  }

  function _getImage(index) {
    var images = RiseVision.RSS.Images.getImages(),
      image = null;

    if (images.length > 0 && images[index]) {
      if (images[index].src) {
        image = images[index];
      }
    }

    return image;
  }

  function _setScrolling() {
    if (!_getScrollEl()) {
      // Intitiate auto scrolling on the scroll container
      $el.scrollContainer.autoScroll(params.scroll)
        .on("done", function () {
          _isScrolling = false;

          RiseVision.RSS.onContentDone();
        });
    }
  }

  function _getTemplate(item, index) {
    var story = _getStory(item),
      author = _getAuthor(item),
      image = _getImage(index),
      content = document.querySelector("#rssItem").content,
      clone;

    // Headline
    content.querySelector(".headline").textContent = item.title;

    // Author
    content.querySelector(".author").textContent = (!author) ? "" : author;

    // Date
    // TODO: use moment.js to format the date
    content.querySelector(".date").textContent = item.pubdate;

    // Story
    if (params.selection.story === "snippet") {
      // TODO: need to convert story value to text and truncate, set full story for now
      content.querySelector(".story").innerHTML = (!story) ? "" : story;
    }
    else {
      // TODO: strip out <script> tags before setting this value

      content.querySelector(".story").innerHTML = (!story) ? "" : story;

      // TODO: Reminder - apply story_font-style to everything inside (likely not in this function)
    }

    // Images
    if (image) {
      content.querySelector(".image").setAttribute("src", image.src);
      // TODO: Reminder - image dimensions need to be applied (not in this function)
    } else {
      // remove the src attribute from <image>
      content.querySelector(".image").removeAttribute("src");
    }

    clone = $(document.importNode(content, true));

    return clone;
  }

  function _addItems() {
    var itemsNum = (_items.length <= params.queue) ? _items.length : params.queue,
      templatesNum, template;

    // clear content
    $el.page.empty();

    if (params.scroll.by !== "none") {
      // display all items
      templatesNum = itemsNum;
    } else {
      // TODO: transitioning not implemented yet, this won't be used yet
      templatesNum = (params.stories <= itemsNum) ? params.stories : itemsNum;
    }

    for (var i = 0; i < templatesNum; i += 1) {
      template = _getTemplate(_items[i], i);
      $el.page.append(template);
    }

    // TODO: may need to truncate elsewhere when transitioning is implemented
    // truncate items in order to show the
    $(".item").dotdotdot({
      height: _getItemHeight()
    });

    $(".item").height(_getItemHeight());
  }

  function _init() {
    $el.scrollContainer.width(prefs.getInt("rsW"));
    $el.scrollContainer.height(prefs.getInt("rsH"));

    _addItems();

    if (_initialBuild) {
      _setScrolling();

      RiseVision.RSS.onContentReady();
    }
  }

  function _configureMedia(feedItems) {
    var story, media, medium, url, type, found, enclosure;

    for (var i = 0; i < feedItems.length; i++) {
      found = false;
      story = _getStory(feedItems[i]);
      media = (_.has(feedItems[i], "media:content")) ? feedItems[i]["media:content"] : null;
      enclosure = (_.has(feedItems[i], "enclosure")) ? feedItems[i].enclosure : null;

      // TODO: Need to account for multiple <media:content> elements within a <media:group> element.

      if (media) {
        medium = (_.has(media, "medium")) ? media.medium : null;
        url = (_.has(media, "url")) ? media.url : null;
        type = (_.has(media, "type")) ? media.type : null;

        if (medium) {
          if (medium === "image") {
            if (!_urlExists(url, story)) {
              _imageUrls.push(url);
              found = true;
            }
          }
        }
        else if (type) {
          if (_.indexOf(SUPPORTED_IMAGES, type) !== -1) {
            if (!_urlExists(url, story)) {
              _imageUrls.push(url);
              found = true;
            }
          }
        }
      }
      else if (enclosure) {
        url = (_.has(enclosure, "url")) ? enclosure.url : null;
        type = (_.has(enclosure, "type")) ? enclosure.type : null;

        if (_.indexOf(SUPPORTED_IMAGES, type) !== -1) {
          if (!_urlExists(url, story)) {
            _imageUrls.push(url);
            found = true;
          }
        }
      }

      //Add a null url if this particular item has no image.
      if (!found) {
        _imageUrls.push(null);
      }
    }
  }

  function scrollPlay() {
    var $scroll = _getScrollEl();

    if ($scroll && $scroll.canScroll() && !_isScrolling) {
      $scroll.play();
      _isScrolling = true;
    }
  }

  function scrollPause() {
    var $scroll = _getScrollEl();

    if ($scroll && $scroll.canScroll()) {
      $scroll.pause();
      _isScrolling = false;
    }
  }

  function build(feed) {
    _items = feed.items;

    if (!$el) {
      _cache();
    }

    _imageUrls = [];

    _configureMedia(_items);

    if (_hasImages(_imageUrls)) {
      // Load the images
      RiseVision.RSS.Images.load(_imageUrls, function () {
        if (_initialBuild) {
          _init();
        }
        /*else {
          // TODO: not sure what will happen here yet
        }*/
      });
    } else {
      if (_initialBuild) {
        _init();
      }
      /*else {
       // TODO: not sure what will happen here yet
      }*/
    }
  }

  return {
    build: build,
    scrollPlay: scrollPlay,
    scrollPause: scrollPause
  };
};

/* global gadgets, RiseVision */

(function (window, gadgets) {
  "use strict";

  var prefs = new gadgets.Prefs(),
    id = prefs.getString("id");

  // Disable context menu (right click menu)
  window.oncontextmenu = function () {
    return false;
  };

  function play() {
    RiseVision.RSS.play();
  }

  function pause() {
    RiseVision.RSS.pause();
  }

  function stop() {
    RiseVision.RSS.pause();
  }

  function webComponentsReady() {
    window.removeEventListener("WebComponentsReady", webComponentsReady);

    if (id && id !== "") {
      gadgets.rpc.register("rscmd_play_" + id, play);
      gadgets.rpc.register("rscmd_pause_" + id, pause);
      gadgets.rpc.register("rscmd_stop_" + id, stop);

      gadgets.rpc.register("rsparam_set_" + id, RiseVision.RSS.setAdditionalParams);
      gadgets.rpc.call("", "rsparam_get", null, id, ["additionalParams"]);
    }
  }

  window.addEventListener("WebComponentsReady", webComponentsReady);


})(window, gadgets);


