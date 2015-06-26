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
