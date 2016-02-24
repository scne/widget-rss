angular.module("risevision.widget.rss.settings")
  .controller("rssSettingsController", ["$scope", "$log",
    function (/*$scope, $log*/) {

    }])
  .value("defaultSettings", {
    "params": {},
    "additionalParams": {
      "url": "",
      "headline": {
        "fontStyle": {}
      },
      "story": {
        "fontStyle": {}
      }
    }
  });
