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

    rss.addEventListener("rise-rss-error", function () {
      RiseVision.RSS.showError("Sorry, there was a problem with the RSS feed.", true);
    });

    rss.setAttribute("url", data.url);
    rss.go();
  }

  return {
    "init": init
  };
};
