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
      $story.html(_utils.stripScripts(story));

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

    $(".item").height(prefs.getInt("rsH"));

    if (_transition.type === "fade") {
      $(".item").addClass("fade-in");
    }

    $(".item").removeClass("hide");

    // truncate content
    $(".item").dotdotdot({
      height: prefs.getInt("rsH")
    });
  }

  function _makeTransition() {
    if (_currentItemIndex === (_items.length - 1)) {

      _stopTransitionTimer();

      // set up first item to show
      _currentItemIndex = 0;

      _clear(function() {
        _showItem(_currentItemIndex);
        RiseVision.RSS.onContentDone();
      });

      _waitingForUpdate = false;

      return;
    }

    if (_waitingForUpdate) {
      // start over at first item since the feed has been updated
      _currentItemIndex = 0;
      _waitingForUpdate = false;
    }
    else {
      _currentItemIndex += 1;
    }

    _clear(function () {
      _showItem(_currentItemIndex);
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
    _items = feed.items;

    if(params.transition){
      _transition = params.transition;
    }

    _currentItemIndex = 0;
    _showItem(_currentItemIndex);
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
