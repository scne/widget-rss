/* global gadgets */

var RiseVision = RiseVision || {};
RiseVision.RSS = {};

RiseVision.RSS = (function (gadgets) {
  "use strict";

  var _additionalParams;

  var _prefs = null;

  /*
   *  Private Methods
   */
  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"),
      true, true, true, true, false);
  }

  /*
   *  Public Methods
   */
  function pause() {}

  function play() {}

  function setAdditionalParams(names, values) {
    if (Array.isArray(names) && names.length > 0 && names[0] === "additionalParams") {
      if (Array.isArray(values) && values.length > 0) {
        _additionalParams = JSON.parse(values[0]);
        _prefs = new gadgets.Prefs();

        document.getElementById("rssContainer").style.height = _prefs.getInt("rsH") + "px";

        _ready();
      }
    }
  }

  function stop() {}

  return {
    "pause": pause,
    "play": play,
    "setAdditionalParams": setAdditionalParams,
    "stop": stop
  };

})(gadgets);
