var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.Component = function (data) {
  "use strict";

  /*
   *  Public Methods
   */
  function init() {
    var rss = document.getElementById("rss");

    if (!rss) {
      return;
    }

    rss.addEventListener("rise-rss-response", function() {
      //TODO: handle response
    });

    rss.setAttribute("url", data.url);

    // retrieve the JSON formatted RSS data
    rss.go();

    //TODO: temporary until handler function is complete
    RiseVision.RSS.onComponentInit();
  }

  return {
    "init": init
  };
};
