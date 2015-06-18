/* global config: true */
/* exported config */
if (typeof config === "undefined") {
  var config = {};

  if (typeof angular !== "undefined") {
    angular.module("risevision.widget.rss.config", [])
      .value("layout4x1", "https://s3.amazonaws.com/widget-rss/1.0.0/dist/layout-4x1.html")
      .value("layout2x1", "https://s3.amazonaws.com/widget-rss/1.0.0/dist/layout-2x1.html")
      .value("layout1x2", "https://s3.amazonaws.com/widget-rss/1.0.0/dist/layout-1x2.html");

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

  var _prefs = null,
    _component = null;

  /*
   *  Private Methods
   */
  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"),
      true, true, true, true, false);
  }

  function onComponentInit(feedObj) {
    console.dir(feedObj);
    //TODO: temporary ready call, more logic to come
    _ready();
  }

  function onComponentRefresh(feedObj) {
    //TODO: logic to come
    console.dir(feedObj);
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

        // create and initialize the Component module instance
        _component = new RiseVision.RSS.Component(_additionalParams);
        _component.init();
      }
    }
  }

  function stop() {}

  return {
    "onComponentInit": onComponentInit,
    "onComponentRefresh": onComponentRefresh,
    "pause": pause,
    "play": play,
    "setAdditionalParams": setAdditionalParams,
    "stop": stop
  };

})(gadgets);

var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.Component = function (data) {
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
      console.log("rise-rss-response handler");

      if (e.detail && e.detail.feed) {
        if (_initialLoad) {
          _initialLoad = false;

          RiseVision.RSS.onComponentInit(e.detail.feed);

        } else {
          RiseVision.RSS.onComponentRefresh(e.detail.feed);
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

    // retrieve the JSON formatted RSS data
    rss.go();

  }

  return {
    "init": init
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

  }

  function pause() {

  }

  function stop() {

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


