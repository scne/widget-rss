/* global config: true */
/* exported config */
if (typeof config === "undefined") {
  var config = {};

  if (typeof angular !== "undefined") {
    angular.module("risevision.common.i18n.config", [])
      .constant("LOCALES_PREFIX", "locales/translation_")
      .constant("LOCALES_SUFIX", ".json");
  }
}

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

  }

  function pause() {

  }

  function stop() {

  }

  if (id && id !== "") {
    gadgets.rpc.register("rscmd_play_" + id, play);
    gadgets.rpc.register("rscmd_pause_" + id, pause);
    gadgets.rpc.register("rscmd_stop_" + id, stop);

    gadgets.rpc.register("rsparam_set_" + id, RiseVision.RSS.setAdditionalParams);
    gadgets.rpc.call("", "rsparam_get", null, id, ["additionalParams"]);
  }

})(window, gadgets);


