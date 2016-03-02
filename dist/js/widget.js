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

var WIDGET_COMMON_CONFIG = {
  AUTH_PATH_URL: "v1/widget/auth",
  LOGGER_CLIENT_ID: "1088527147109-6q1o2vtihn34292pjt4ckhmhck0rk0o7.apps.googleusercontent.com",
  LOGGER_CLIENT_SECRET: "nlZyrcPLg6oEwO9f9Wfn29Wh",
  LOGGER_REFRESH_TOKEN: "1/xzt4kwzE1H7W9VnKB8cAaCx6zb4Es4nKEoqaYHdTD15IgOrJDtdun6zK6XiATCKT",
  STORAGE_ENV: "prod",
  STORE_URL: "https://store-dot-rvaserver2.appspot.com/"
};
var RiseVision = RiseVision || {};

RiseVision.Common = RiseVision.Common || {};

RiseVision.Common.Utilities = (function() {

  function getFontCssStyle(className, fontObj) {
    var family = "font-family:" + fontObj.font.family + "; ";
    var color = "color: " + (fontObj.color ? fontObj.color : fontObj.forecolor) + "; ";
    var size = "font-size: " + (fontObj.size.indexOf("px") === -1 ? fontObj.size + "px; " : fontObj.size + "; ");
    var weight = "font-weight: " + (fontObj.bold ? "bold" : "normal") + "; ";
    var italic = "font-style: " + (fontObj.italic ? "italic" : "normal") + "; ";
    var underline = "text-decoration: " + (fontObj.underline ? "underline" : "none") + "; ";
    var highlight = "background-color: " + (fontObj.highlightColor ? fontObj.highlightColor : fontObj.backcolor) + "; ";

    return "." + className + " {" + family + color + size + weight + italic + underline + highlight + "}";
  }

  function addCSSRules(rules) {
    var style = document.createElement("style");

    for (var i = 0, length = rules.length; i < length; i++) {
      style.appendChild(document.createTextNode(rules[i]));
    }

    document.head.appendChild(style);
  }

  /*
   * Loads Google or custom fonts, if applicable, and injects CSS styles
   * into the head of the document.
   *
   * @param    array    settings    Array of objects with the following form:
 *                                   [{
 *                                     "class": "date",
 *                                     "fontSetting": {
 *                                         bold: true,
 *                                         color: "black",
 *                                         font: {
 *                                           family: "Akronim",
 *                                           font: "Akronim",
 *                                           name: "Verdana",
 *                                           type: "google",
 *                                           url: "http://custom-font-url"
 *                                         },
 *                                         highlightColor: "transparent",
 *                                         italic: false,
 *                                         size: "20",
 *                                         underline: false
 *                                     }
 *                                   }]
   *
   *           object   contentDoc    Document object into which to inject styles
   *                                  and load fonts (optional).
   */
  function loadFonts(settings, contentDoc) {
    settings.forEach(function(item) {
      if (item.class && item.fontSetting) {
        addCSSRules([ getFontCssStyle(item.class, item.fontSetting) ]);
      }

      if (item.fontSetting.font.type) {
        if (item.fontSetting.font.type === "custom" && item.fontSetting.font.family &&
          item.fontSetting.font.url) {
          loadCustomFont(item.fontSetting.font.family, item.fontSetting.font.url,
            contentDoc);
        }
        else if (item.fontSetting.font.type === "google" && item.fontSetting.font.family) {
          loadGoogleFont(item.fontSetting.font.family, contentDoc);
        }
      }
    });
  }

  function loadCustomFont(family, url, contentDoc) {
    var sheet = null;
    var rule = "font-family: " + family + "; " + "src: url('" + url + "');";

    contentDoc = contentDoc || document;

    sheet = contentDoc.styleSheets[0];

    if (sheet !== null) {
      sheet.addRule("@font-face", rule);
    }
  }

  function loadGoogleFont(family, contentDoc) {
    var stylesheet = document.createElement("link"),
      familyVal;

    contentDoc = contentDoc || document;

    stylesheet.setAttribute("rel", "stylesheet");
    stylesheet.setAttribute("type", "text/css");

    // split to account for family value containing a fallback (eg. Aladin,sans-serif)
    familyVal = family.split(",")[0];

    // strip possible single quotes
    familyVal = familyVal.replace(/'/g, "");

    stylesheet.setAttribute("href", "https://fonts.googleapis.com/css?family=" + familyVal);

    if (stylesheet !== null) {
      contentDoc.getElementsByTagName("head")[0].appendChild(stylesheet);
    }
  }

  function preloadImages(urls) {
    var length = urls.length,
      images = [];

    for (var i = 0; i < length; i++) {
      images[i] = new Image();
      images[i].src = urls[i];
    }
  }

  function getQueryParameter(param) {
    var query = window.location.search.substring(1),
      vars = query.split("&"),
      pair;

    for (var i = 0; i < vars.length; i++) {
      pair = vars[i].split("=");

      if (pair[0] == param) {
        return decodeURIComponent(pair[1]);
      }
    }

    return "";
  }

  function getRiseCacheErrorMessage(statusCode) {
    var errorMessage = "";
    switch (statusCode) {
      case 404:
        errorMessage = "The file does not exist or cannot be accessed.";
        break;
      case 507:
        errorMessage = "There is not enough disk space to save the file on Rise Cache.";
        break;
      default:
        errorMessage = "There was a problem retrieving the file from Rise Cache.";
    }

    return errorMessage;
  }

  return {
    getQueryParameter: getQueryParameter,
    getFontCssStyle:  getFontCssStyle,
    addCSSRules:      addCSSRules,
    loadFonts:        loadFonts,
    loadCustomFont:   loadCustomFont,
    loadGoogleFont:   loadGoogleFont,
    preloadImages:    preloadImages,
    getRiseCacheErrorMessage: getRiseCacheErrorMessage
  };
})();

/* global gadgets */

var RiseVision = RiseVision || {};
RiseVision.Common = RiseVision.Common || {};

RiseVision.Common.LoggerUtils = (function() {
  "use strict";

   var displayId = "",
    companyId = "";

  /*
   *  Private Methods
   */

  /* Retrieve parameters to pass to the event logger. */
  function getEventParams(params, cb) {
    var json = null;

    // event is required.
    if (params.event) {
      json = params;

      if (json.file_url) {
        json.file_format = getFileFormat(json.file_url);
      }

      json.company_id = companyId;
      json.display_id = displayId;

      cb(json);
    }
    else {
      cb(json);
    }
  }

  // Get suffix for BQ table name.
  function getSuffix() {
    var date = new Date(),
      year = date.getUTCFullYear(),
      month = date.getUTCMonth() + 1,
      day = date.getUTCDate();

    if (month < 10) {
      month = "0" + month;
    }

    if (day < 10) {
      day = "0" + day;
    }

    return year + month + day;
  }

  /*
   *  Public Methods
   */
  function getFileFormat(url) {
    var hasParams = /[?#&]/,
      str;

    if (!url || typeof url !== "string") {
      return null;
    }

    str = url.substr(url.lastIndexOf(".") + 1);

    // don't include any params after the filename
    if (hasParams.test(str)) {
      str = str.substr(0 ,(str.indexOf("?") !== -1) ? str.indexOf("?") : str.length);

      str = str.substr(0, (str.indexOf("#") !== -1) ? str.indexOf("#") : str.length);

      str = str.substr(0, (str.indexOf("&") !== -1) ? str.indexOf("&") : str.length);
    }

    return str.toLowerCase();
  }

  function getInsertData(params) {
    var BASE_INSERT_SCHEMA = {
      "kind": "bigquery#tableDataInsertAllRequest",
      "skipInvalidRows": false,
      "ignoreUnknownValues": false,
      "templateSuffix": getSuffix(),
      "rows": [{
        "insertId": ""
      }]
    },
    data = JSON.parse(JSON.stringify(BASE_INSERT_SCHEMA));

    data.rows[0].insertId = Math.random().toString(36).substr(2).toUpperCase();
    data.rows[0].json = JSON.parse(JSON.stringify(params));
    data.rows[0].json.ts = new Date().toISOString();

    return data;
  }

  function logEvent(table, params) {
    getEventParams(params, function(json) {
      if (json !== null) {
        RiseVision.Common.Logger.log(table, json);
      }
    });
  }

  /* Set the Company and Display IDs. */
  function setIds(company, display) {
    companyId = company;
    displayId = display;
  }

  return {
    "getInsertData": getInsertData,
    "getFileFormat": getFileFormat,
    "logEvent": logEvent,
    "setIds": setIds
  };
})();

RiseVision.Common.Logger = (function(utils) {
  "use strict";

  var REFRESH_URL = "https://www.googleapis.com/oauth2/v3/token?client_id=" + WIDGET_COMMON_CONFIG.LOGGER_CLIENT_ID +
      "&client_secret=" + WIDGET_COMMON_CONFIG.LOGGER_CLIENT_SECRET +
      "&refresh_token=" + WIDGET_COMMON_CONFIG.LOGGER_REFRESH_TOKEN +
      "&grant_type=refresh_token";

  var serviceUrl = "https://www.googleapis.com/bigquery/v2/projects/client-side-events/datasets/Widget_Events/tables/TABLE_ID/insertAll",
    throttle = false,
    throttleDelay = 1000,
    lastEvent = "",
    refreshDate = 0,
    token = "";

  /*
   *  Private Methods
   */
  function refreshToken(cb) {
    var xhr = new XMLHttpRequest();

    if (new Date() - refreshDate < 3580000) {
      return cb({});
    }

    xhr.open("POST", REFRESH_URL, true);
    xhr.onloadend = function() {
      var resp = JSON.parse(xhr.response);

      cb({ token: resp.access_token, refreshedAt: new Date() });
    };

    xhr.send();
  }

  function isThrottled(event) {
    return throttle && (lastEvent === event);
  }

  /*
   *  Public Methods
   */
  function log(tableName, params) {
    if (!tableName || !params || (params.hasOwnProperty("event") && !params.event) ||
      (params.hasOwnProperty("event") && isThrottled(params.event))) {
      return;
    }

    throttle = true;
    lastEvent = params.event;

    setTimeout(function () {
      throttle = false;
    }, throttleDelay);

    function insertWithToken(refreshData) {
      var xhr = new XMLHttpRequest(),
        insertData, url;

      url = serviceUrl.replace("TABLE_ID", tableName);
      refreshDate = refreshData.refreshedAt || refreshDate;
      token = refreshData.token || token;
      insertData = utils.getInsertData(params);

      // Insert the data.
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Authorization", "Bearer " + token);

      if (params.cb && typeof params.cb === "function") {
        xhr.onloadend = function() {
          params.cb(xhr.response);
        };
      }

      xhr.send(JSON.stringify(insertData));
    }

    return refreshToken(insertWithToken);
  }

  return {
    "log": log
  };
})(RiseVision.Common.LoggerUtils);
/* global gadgets, _ */

var RiseVision = RiseVision || {};
RiseVision.RSS = {};

RiseVision.RSS = (function (document, gadgets) {
  "use strict";

  var _additionalParams = null,
    _prefs = new gadgets.Prefs();

  var _message = null,
    _riserss = null,
    _content = null;

  var _currentFeed = null;

  var _viewerPaused = true,
    _errorTimer = null,
    _errorLog = null,
    _errorFlag = false;

  /*
   *  Private Methods
   */
  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"), true, true, true, true, true);
  }

  function _done() {
    gadgets.rpc.call("", "rsevent_done", null, _prefs.getString("id"));

    // Any errors need to be logged before the done event.
    if (_errorLog !== null) {
      logEvent(_errorLog, true);
    }

    // log "done" event
    logEvent({ "event": "done", "feed_url": _additionalParams.url }, false);
  }

  function _noFeedItems() {
    var params = {
      "event": "error",
      "event_details": "no feed items",
      "feed_url": _additionalParams.url
    };

    logEvent(params, true);
    showError("There are no items to show from this RSS feed.");
  }

  function _clearErrorTimer() {
    clearTimeout(_errorTimer);
    _errorTimer = null;
  }

  function _startErrorTimer() {
    _clearErrorTimer();

    _errorTimer = setTimeout(function () {
      // notify Viewer widget is done
      _done();
    }, 5000);
  }

  function _init() {
    _message = new RiseVision.Common.Message(document.getElementById("container"),
      document.getElementById("messageContainer"));

    // show wait message
    _message.show("Please wait while your feed is loaded.");

    // Load fonts.
    var fontSettings = [
      {
        "class": "headline_font-style",
        "fontSetting": _additionalParams.headline.fontStyle
      },
      {
        "class": "story_font-style",
        "fontSetting": _additionalParams.story.fontStyle
      }
    ];

    RiseVision.Common.Utilities.loadFonts(fontSettings);

    // create and initialize the rss module instance
    _riserss = new RiseVision.RSS.RiseRSS(_additionalParams);
    _riserss.init();

    _ready();
  }

  /*
   *  Public Methods
   */
  function getTableName() {
    return "rss_events";
  }

  function logEvent(params, isError) {
    if (isError) {
      _errorLog = params;
    }

    RiseVision.Common.LoggerUtils.logEvent(getTableName(), params);
  }

  function onContentDone() {
    _done();
  }

  function onRiseRSSInit(feed) {
    console.log("onRiseRSSInit");
    console.dir(feed);

    _content = new RiseVision.RSS.Content(_prefs, _additionalParams);

    if (feed.items && feed.items.length > 0) {
      // remove a message previously shown
      _message.hide();

      _currentFeed = _.clone(feed);

      _content.init(_currentFeed);

      if (!_viewerPaused) {
        _content.play();
      }
    }
    else {
      _noFeedItems();
    }
  }

  function onRiseRSSRefresh(feed) {
    console.log("onRiseRSSRefresh");
    console.dir(feed);

    var updated = false;

    if (!feed.items || feed.items.length === 0) {
      _noFeedItems();
    }
    else if (!_currentFeed || feed.items.length !== _currentFeed.items.length) {
      updated = true;
    }
    else {
      // run through each item and compare, if any are different, feed has been updated
      for (var i = 0; i < _currentFeed.items.length; i += 1) {
        if (!_.isEqual(feed.items[i], _currentFeed.items[i])) {
          updated = true;
          break;
        }
      }
    }

    if (updated) {
      _currentFeed = _.clone(feed);

      if (_errorFlag) {
        if (!_content) {
          // create content module instance
          _content = new RiseVision.RSS.Content(_prefs, _additionalParams);
        }

        _content.init(_currentFeed);

        // refreshed feed fixed previous error, ensure flag is removed so next playback shows content
        _errorFlag = false;
        _errorLog = null;
      }
      else {
        _content.update(feed);
      }

    }
  }

  function pause() {
    _viewerPaused = true;

    if (_errorFlag) {
      _clearErrorTimer();
      return;
    }

    if (_content) {
      _content.pause();
    }
  }

  function play() {
    _viewerPaused = false;

    logEvent({ "event": "play", "feed_url": _additionalParams.url }, false);

    if (_errorFlag) {
      _startErrorTimer();
      return;
    }

    if (_content) {
      _content.play();
    }
  }

  function setAdditionalParams(additionalParams) {
    _additionalParams = JSON.parse(JSON.stringify(additionalParams));
    _prefs = new gadgets.Prefs();

    _additionalParams.width = _prefs.getInt("rsW");
    _additionalParams.height = _prefs.getInt("rsH");

    document.getElementById("container").style.width = _additionalParams.width + "px";
    document.getElementById("container").style.height = _additionalParams.height + "px";

    _init();
  }

  function showError(message) {
    _errorFlag = true;

    _content.reset();
    _currentFeed = null;
    _message.show(message);

    if (!_viewerPaused) {
      _startErrorTimer();
    }
  }

  function stop() {
    pause();
  }

  return {
    "getTableName": getTableName,
    "logEvent": logEvent,
    "onContentDone": onContentDone,
    "onRiseRSSInit": onRiseRSSInit,
    "onRiseRSSRefresh": onRiseRSSRefresh,
    "pause": pause,
    "play": play,
    "setAdditionalParams": setAdditionalParams,
    "showError": showError,
    "stop": stop
  };

})(document, gadgets);

var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.Utils = (function () {
  "use strict";

  /*
   *  Public  Methods
   */

  function stripScripts(html) {
    var div = document.createElement("div"),
      scripts, i;

    div.innerHTML = html;
    scripts = div.getElementsByTagName("script");
    i = scripts.length;

    while (i--) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }

    return div.innerHTML;
  }

  /* Truncate text while preserving word boundaries. */
  function truncate(text) {
    var maxLength = 120;

    if (text.length > maxLength) {
      text = text.substring(0, maxLength);

      // Ensure that we don't truncate mid-word.
      text = text.replace(/\w+$/, "");
      text += " ...";
    }

    return text;
  }

  return {
    "stripScripts": stripScripts,
    "truncate": truncate
  };

})();

var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.RiseRSS = function (data) {
  "use strict";

  var _initialLoad = true;

  /*
   *  Public Methods
   */
  function init() {
    var rss = document.querySelector("rise-rss");

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
      var errorDetails = "";

      if (e.detail && typeof e.detail === "string") {
        errorDetails = e.detail;
      }
      else if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        // rise-rss-error passes error from gadgets.io.makeRequest which is always an Array with one item
        errorDetails = e.detail[0];
      }

      var params = {
        "event": "error",
        "event_details": "rise rss error",
        "error_details": errorDetails,
        "feed_url": data.url
      };

      RiseVision.RSS.logEvent(params, true);
      RiseVision.RSS.showError("Sorry, there was a problem with the RSS feed.", true);
    });

    rss.setAttribute("url", data.url);

    if (data.itemsInQueue) {
      rss.setAttribute("entries", data.itemsInQueue);
    }

    rss.go();
  }

  return {
    "init": init
  };
};

/* global _ */

var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.Content = function (prefs, params) {

  "use strict";

  var _items = [],
    _utils = RiseVision.RSS.Utils;

  var _$el;

  var _currentItemIndex = 0;

  var _transitionIntervalId = null;

  var _transition = {
    "type": "none",
    duration: 10000
  };

  var _waitingForUpdate = false;

  /*
   *  Private Methods
   */
  function _cache() {
    _$el = {
      page:           $(".page")
    };
  }

  function _getItemHeight() {
    // account for not enough items to actually show compared to setting value
    var itemsToShow = (_items.length <= params.itemsToShow) ? _items.length : params.itemsToShow;

    return prefs.getInt("rsH") / itemsToShow;
  }

  function _getTransitionConfig(index) {
    var config = {};

    if ((index + params.itemsToShow) >= (_items.length - 1)) {
      // account for not enough items to actually show from the feed
      config.itemsToShow = _items.length - (index + 1);
      config.currentItemIndex = (_items.length - 1);
    }
    else {
      config.itemsToShow = params.itemsToShow;
      // value is the index of the last item showing
      config.currentItemIndex = index + params.itemsToShow;
    }

    return config;
  }

  function _getStartConfig() {
    var config = {};

    if (_items.length <= params.itemsToShow) {
      // account for not enough items to actually show from the feed
      config.itemsToShow = _items.length;
      config.currentItemIndex = (_items.length - 1);
    }
    else {
      config.itemsToShow = params.itemsToShow;
      // value is the index of the last item showing
      config.currentItemIndex = (params.itemsToShow - 1);
    }

    return config;
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

  function _getTemplate(item) {
    var story = _getStory(item),
      template = document.querySelector("#rssItem").content,
      $content = $(template.cloneNode(true)),
      $story, clone;

    // Headline
    if (!item.title) {
      $content.remove(".headline");
    }
    else {
      $content.find(".headline").css("textAlign", params.headline.fontStyle.align);
      $content.find(".headline a").text(item.title);
    }

    // Story
    if (!story) {
      $content.remove(".story");
    }
    else {
      $story = $content.find(".story");
      $story.css("textAlign", params.story.fontStyle.align);
      story = _utils.stripScripts(story);

      if (params.dataSelection.showDescription === "snippet") {
        $story.html(_utils.truncate($("<div/>").html(story).text()));
      }
      else {
        $story.html(story);
      }

      // apply the story font styling to child elements as well.
      $story.find("p").addClass("story_font-style");
      $story.find("div").addClass("story_font-style");
      $story.find("span").addClass("story_font-style");
    }

    clone = $(document.importNode($content[0], true));

    return clone;
  }

  // Fade out and clear content.
  function _clear(cb) {
    if (_transition.type === "fade") {
      $(".item").one("transitionend", function() {
        _clearPage(cb);
      });

      $(".item").addClass("fade-out").removeClass("fade-in");
    }
    else {
      _clearPage(cb);
    }
  }

  function _clearPage(cb) {
    _$el.page.empty();
    if (!cb || typeof cb !== "function") {
      return;
    }
    else {
      cb();
    }
  }

  function _showItem(index) {
    _$el.page.append(_getTemplate(_items[index]));

    $(".item").height(_getItemHeight());

    if (_transition.type === "fade") {
      $(".item").addClass("fade-in");
    }

    $(".item").removeClass("hide");

    // truncate content
    $(".item").dotdotdot({
      height: _getItemHeight()
    });
  }

  function _makeTransition() {
    var startConfig = _getStartConfig(),
      transConfig = _getTransitionConfig(_currentItemIndex),
      startingIndex, itemsToShow;

    if (_currentItemIndex === (_items.length - 1)) {

      _stopTransitionTimer();

      _clear(function() {

        // show the items
        for (var i = 0; i < startConfig.itemsToShow; i += 1) {
          _showItem(i);
        }

        _currentItemIndex = startConfig.currentItemIndex;

        RiseVision.RSS.onContentDone();
      });

      _waitingForUpdate = false;

      return;
    }

    if (_waitingForUpdate) {
      // start over at first item since the feed has been updated
      startingIndex = 0;

      _waitingForUpdate = false;

      // apply config values from a restart
      itemsToShow = startConfig.itemsToShow;
      _currentItemIndex = startConfig.currentItemIndex;
    }
    else {
      startingIndex = _currentItemIndex + 1;

      // apply config values from a transition
      itemsToShow = transConfig.itemsToShow;
      _currentItemIndex = transConfig.currentItemIndex;
    }

    _clear(function () {
      for (var i = startingIndex; i < (startingIndex + itemsToShow); i += 1) {
        _showItem(i);
      }
    });
  }

  function _startTransitionTimer() {
    if (_transitionIntervalId === null) {
      _transitionIntervalId = setInterval(function () {
        _makeTransition();
      }, _transition.duration);
    }
  }

  function _stopTransitionTimer() {
    clearInterval(_transitionIntervalId);
    _transitionIntervalId = null;
  }

  /*
   *  Public Methods
   */
  function init(feed) {
    var startConfig;

    _items = feed.items;

    if(params.transition){
      _transition = params.transition;
    }

    startConfig = _getStartConfig();

    _currentItemIndex = startConfig.currentItemIndex;

    // show the items
    for (var i = 0; i < startConfig.itemsToShow; i += 1) {
      _showItem(i);
    }

  }

  function pause() {
    _stopTransitionTimer();
  }

  function reset() {
    _stopTransitionTimer();
    _clear();
    _items = [];
  }

  function play() {
    _startTransitionTimer();
  }

  function update(feed) {
    _items = feed.items;
    _waitingForUpdate = true;
  }

  _cache();

  return {
    init: init,
    pause: pause,
    play: play,
    reset: reset,
    update: update
  };
};

var RiseVision = RiseVision || {};
RiseVision.Common = RiseVision.Common || {};

RiseVision.Common.Message = function (mainContainer, messageContainer) {
  "use strict";

  var _active = false;

  function _init() {
    try {
      messageContainer.style.height = mainContainer.style.height;
    } catch (e) {
      console.warn("Can't initialize Message - ", e.message);
    }
  }

  /*
   *  Public Methods
   */
  function hide() {
    if (_active) {
      // clear content of message container
      while (messageContainer.firstChild) {
        messageContainer.removeChild(messageContainer.firstChild);
      }

      // hide message container
      messageContainer.style.display = "none";

      // show main container
      mainContainer.style.visibility = "visible";

      _active = false;
    }
  }

  function show(message) {
    var fragment = document.createDocumentFragment(),
      p;

    if (!_active) {
      // hide main container
      mainContainer.style.visibility = "hidden";

      messageContainer.style.display = "block";

      // create message element
      p = document.createElement("p");
      p.innerHTML = message;
      p.setAttribute("class", "message");

      fragment.appendChild(p);
      messageContainer.appendChild(fragment);

      _active = true;
    } else {
      // message already being shown, update message text
      p = messageContainer.querySelector(".message");
      p.innerHTML = message;
    }
  }

  _init();

  return {
    "hide": hide,
    "show": show
  };
};

/* global gadgets, RiseVision */

(function (window, document, gadgets) {
  "use strict";

  var prefs = new gadgets.Prefs(),
    id = prefs.getString("id");

  // Disable context menu (right click menu)
  window.oncontextmenu = function () {
    return false;
  };

  document.body.onmousedown = function() {
    return false;
  };

  function configure(names, values) {
    var additionalParams,
      companyId = "",
      displayId = "";

    if (Array.isArray(names) && names.length > 0 && Array.isArray(values) && values.length > 0) {
      if (names[0] === "companyId") {
        companyId = values[0];
      }

      if (names[1] === "displayId") {
        if (values[1]) {
          displayId = values[1];
        }
        else {
          displayId = "preview";
        }
      }

      RiseVision.Common.LoggerUtils.setIds(companyId, displayId);

      if (names[2] === "additionalParams") {
        additionalParams = JSON.parse(values[2]);

        RiseVision.RSS.setAdditionalParams(additionalParams);
      }
    }
  }

  function play() {
    RiseVision.RSS.play();
  }

  function pause() {
    RiseVision.RSS.pause();
  }

  function stop() {
    RiseVision.RSS.stop();
  }

  function webComponentsReady() {
    window.removeEventListener("WebComponentsReady", webComponentsReady);

    if (id && id !== "") {
      gadgets.rpc.register("rscmd_play_" + id, play);
      gadgets.rpc.register("rscmd_pause_" + id, pause);
      gadgets.rpc.register("rscmd_stop_" + id, stop);
      gadgets.rpc.register("rsparam_set_" + id, configure);
      gadgets.rpc.call("", "rsparam_get", null, id, ["companyId", "displayId", "additionalParams"]);
    }
  }

  window.addEventListener("WebComponentsReady", webComponentsReady);


})(window, document, gadgets);


