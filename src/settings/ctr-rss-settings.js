angular.module("risevision.widget.rss.settings")
  .controller("rssSettingsController", ["$scope", "$log",
    function ($scope/*, $log*/) {

      // converting seconds to milliseconds and vice versa
      $scope.$watch("duration", function (value){
        if (typeof value !== "undefined" && value !== "") {
          $scope.settings.additionalParams.transition.duration = value * 1000;
        }
      });
      $scope.$watch("settings.additionalParams.transition.duration", function (value) {
        if (typeof value !== "undefined" && value !== "") {
          $scope.duration = value / 1000;
        }
      });

      $scope.$watch("settings.additionalParams.dataSelection.showTitle", function (value) {
        if (typeof value !== "undefined" && value !== "" && !value) {
          $scope.settings.additionalParams.headline.fontStyle = {};
        }
      });

      $scope.$watch("settings.additionalParams.dataSelection.showTimestamp", function (value) {
        if (typeof value !== "undefined" && value !== "" && !value) {
          $scope.settings.additionalParams.timestamp.fontStyle = {};
        }
      });

      $scope.$watch("settings.additionalParams.dataSelection.showAuthor", function (value) {
        if (typeof value !== "undefined" && value !== "" && !value) {
          $scope.settings.additionalParams.author.fontStyle = {};
        }
      });

    }])
  .value("defaultSettings", {
    "params": {},
    "additionalParams": {
      "url": "",
      "itemsInQueue": 5,
      "itemsToShow": 1,
      "headline": {
        "fontStyle":{
          "font":{
            "family":"verdana,geneva,sans-serif",
            "type":"standard",
            "url":""
          },
          "size":"24px",
          "customSize":"",
          "align":"left",
          "bold":true,
          "italic":false,
          "underline":false,
          "forecolor":"black",
          "backcolor":"transparent"
        }
      },
      "story": {
        "fontStyle":{
          "font":{
            "family":"verdana,geneva,sans-serif",
            "type":"standard",
            "url":""
          },
          "size":"18px",
          "customSize":"",
          "align":"left",
          "bold":true,
          "italic":false,
          "underline":false,
          "forecolor":"black",
          "backcolor":"transparent"
        }
      },
      "timestamp": {
        "fontStyle":{
          "font":{
            "family":"verdana,geneva,sans-serif",
            "type":"standard",
            "url":""
          },
          "size":"14px",
          "customSize":"",
          "align":"left",
          "bold":true,
          "italic":false,
          "underline":false,
          "forecolor":"#969696",
          "backcolor":"transparent"
        }
      },
      "author": {
        "fontStyle":{
          "font":{
            "family":"verdana,geneva,sans-serif",
            "type":"standard",
            "url":""
          },
          "size":"14px",
          "customSize":"",
          "align":"left",
          "bold":true,
          "italic":false,
          "underline":false,
          "forecolor":"#969696",
          "backcolor":"transparent"
        }
      },
      "transition": {
        "type": "none",
        "duration": 10000
      },
      "dataSelection": {
        "showTitle": true,
        "showTimestamp": true,
        "showAuthor": true,
        "showImage": true,
        "showDescription": "snippet"
      },
      "layout": "layout-4x1",
      "layoutUrl": "",
      "separator": {
        "show": true,
        "size": 1,
        "color": "rgb(238,238,238)"
      }
    }
  });
