angular.module("risevision.widget.rss.settings")
  .controller("rssSettingsController", ["$scope", "$log", "layout4x1", "layout2x1", "layout1x2",
    function ($scope, $log, layout4x1, layout2x1, layout1x2) {

      $scope.$watch("settings.additionalParams.customLayout", function (url) {
        if (typeof url !== "undefined") {
          $scope.settings.params.layoutURL = url;
        }
      });

      $scope.$watch("settings.additionalParams.layout", function (layout) {
        var values;

        if (typeof layout !== "undefined") {
          values = {
            "4x1": layout4x1,
            "2x1": layout2x1,
            "1x2": layout1x2,
            "custom": $scope.settings.additionalParams.customLayout
          };

          $scope.settings.params.layoutURL = values[layout];
        }
      });
    }])
  .value("defaultSettings", {
    params: {
      layoutURL: ""
    },
    additionalParams: {
      url: "",
      stories: 2,
      queue: 5,
      refresh: 5,
      scroll: {},
      selection: {
        story: "full",
        title: true,
        date: true,
        author: true
      },
      headingFont: {},
      storyFont: {},
      layout: "4x1",
      customLayout: ""
    }
  });
