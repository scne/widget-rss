var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.Utils = (function () {
  "use strict";

  /*
   *  Public  Methods
   */

  function stripScripts(html) {
    var div = document.createElement("div"),
      scripts, i;

    div.innerHTML = html;
    scripts = div.getElementsByTagName("script");
    i = scripts.length;

    while (i--) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }

    return div.innerHTML;
  }

  return {
    "stripScripts": stripScripts
  };

})();
