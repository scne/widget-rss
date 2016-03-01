angular.module("risevision.widget.rss.settings")
  .controller("rssSettingsController", ["$scope", "$log",
    function ($scope/*, $log*/) {

      // converting secods to milliseconds and vice versa
      $scope.$watch("duration", function (value){
        if (typeof value !== "undefined" && value !== "") {
          $scope.settings.additionalParams.transition.duration = value * 1000;
        }
      });
      $scope.$watch("settings.additionalParams.transition.duration", function (value){
        if (typeof value !== "undefined" && value !== "") {
          $scope.duration = value / 1000;
        }
      });

    }])
  .value("defaultSettings", {
    "params": {},
    "additionalParams": {
      "url": "",
      "itemsInQueue": 5,
      "headline": {
        "fontStyle": {}
      },
      "story": {
        "fontStyle": {}
      },
      "itemsToShow": 2,
      "transition": {
        "type": "none",
        "duration": 10000
      },
      "dataSelection": {
        "showDescription": "snippet"
      }
    }
  });
