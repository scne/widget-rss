var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.TransitionVerticalScroll = function (params, content) {
  "use strict";

  var _items = [];

  var _waitingForUpdate = false,
    _waitingToStart = false;

  var _pudTimerID = null;

  /*
   *  Private Methods
   */
  function _clearPage() {
    $(".page").empty();
  }

  function _getScrollEl() {
    var $scrollContainer = $("#container");

    if (typeof $scrollContainer.data("plugin_autoScroll") !== "undefined") {
      return  $scrollContainer.data("plugin_autoScroll");
    }

    return null;
  }

  function _removeAutoscroll() {
    var $scrollContainer = _getScrollEl();

    if ($scrollContainer) {
      $scrollContainer.destroy();
    }
  }

  function _showItems() {
    // show all the items
    for (var i = 0; i < _items.length; i += 1) {
      content.showItem(i);
    }

    $(".item").removeClass("hide");
  }

  function _startPUDTimer() {
    // If there is not enough content to scroll, use the PUD Failover setting as the trigger
    // for sending "done".
    var delay = params.transition.pud  * 1000;

    if (!_pudTimerID) {
      _pudTimerID = setTimeout(function() {

        _pudTimerID = null;
        _onScrollDone();

      }, delay);
    }
  }

  function _onScrollDone() {
    if (_waitingForUpdate) {
      _waitingForUpdate = false;

      _removeAutoscroll();

      content.loadImages(function () {
        _clearPage();
        _showItems();
        _applyAutoScroll();

        RiseVision.RSS.onContentDone();
      });

    }
    else {
      RiseVision.RSS.onContentDone();
    }
  }

  function _applyAutoScroll() {
    var $scrollContainer = $("#container");

    // apply auto scroll
    $scrollContainer.autoScroll({
     "by": (params.transition.type === "scroll") ? "continuous" : "page",
     "speed": params.transition.speed,
     "pause": params.transition.resume
    }).on("done", function () {
      _onScrollDone();
    });
  }

  /*
   *  Public Methods
   */
  function init(items) {
    _items = items;

    _showItems();
    _applyAutoScroll();

    if (_waitingToStart) {
      _waitingToStart = false;
      start();
    }
  }

  function reset() {
    _removeAutoscroll();
    _clearPage();

    _waitingToStart = false;
    _items = [];
  }

  function start() {
    var $scroll = _getScrollEl();

    if (_items.length > 0) {
      if ($scroll && $scroll.canScroll()) {
        $scroll.play();
      }
      else {
        _startPUDTimer();
      }
    }
    else {
      _waitingToStart = true;
    }
  }

  function stop() {
    var $scroll = _getScrollEl();

    _waitingToStart = false;

    if ($scroll && $scroll.canScroll()) {
      $scroll.pause();
    }

    // Clear the PUD timer if the playlist item is not set to PUD.
    if (_pudTimerID) {
      clearTimeout(_pudTimerID);
      _pudTimerID = null;
    }
  }

  function update(items) {
    _items = items;
    _waitingForUpdate = true;
  }

  return {
    init: init,
    reset: reset,
    start: start,
    stop: stop,
    update: update
  };

};
