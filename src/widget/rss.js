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
