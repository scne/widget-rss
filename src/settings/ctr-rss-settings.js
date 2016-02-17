angular.module("risevision.widget.rss.settings")
  .controller("rssSettingsController", ["$scope", "$log",
    function (/*$scope, $log*/) {

    }])
  .value("defaultSettings", {
    "params": {},
    "additionalParams": {
      "url": "",
      "title": {
        "fontStyle": {}
      },
      "story": {
        "fontStyle": {}
      }
    }
  });
