(function(window) {
  "use strict";

  window.gadget = window.gadget || {};
  window.gadget.settings = {
    "params": {},
    "additionalParams": {
      "url": "http://test.com/feed.rss",
      "itemsInQueue": 4,
      "headline": {
        "fontStyle": {
          "font": {
            "family": "verdana,geneva,sans-serif",
            "type": "standard"
          },
          "size": "24px",
          "customSize": "",
          "align": "left",
          "bold": false,
          "italic": false,
          "underline": false,
          "forecolor": "black",
          "backcolor": "transparent"
        }
      },
      "story": {
        "fontStyle": {
          "font": {
            "family": "verdana,geneva,sans-serif",
            "type": "standard"
          },
          "size": "24px",
          "customSize": "",
          "align": "left",
          "bold": false,
          "italic": false,
          "underline": false,
          "forecolor": "black",
          "backcolor": "transparent"
        }
      },
      "transition": {
        "type": "fade",
        "duration": 15000
      },
      "dataSelection": {
        "showDescription": "snippet"
      }
    }
  };
})(window);
