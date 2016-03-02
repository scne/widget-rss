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
    rss.setAttribute("entries", data.itemsInQueue);
    rss.go();
  }

  return {
    "init": init
  };
};
