/*jshint expr:true */
"use strict";

describe("Unit Tests - Settings Controller", function () {

  var defaultSettings, scope, ctrl;

  beforeEach(module("risevision.widget.rss.settings"));

  beforeEach(inject(function($injector, $rootScope, $controller, _layout4x1_, _layout2x1_, _layout1x2_) {
    defaultSettings = $injector.get("defaultSettings");
    scope = $rootScope.$new();
    ctrl = $controller("rssSettingsController", {
      $scope: scope,
      layout4x1: _layout4x1_,
      layout2x1: _layout2x1_,
      layout1x2: _layout1x2_
    });

    scope.settingsForm = {
      $setValidity: function () {
        return;
      },
      rssUrl: {
        $valid: true
      },
      layoutUrl: {
        $valid: true
      }
    };

    scope.settings = {
      params: defaultSettings.params,
      additionalParams: defaultSettings.additionalParams
    };

  }));

  it("should define defaultSettings", function (){
    expect(defaultSettings).to.be.truely;
    expect(defaultSettings).to.be.an("object");
  });

  it("should apply correct layout URL to params.layoutURL from predefined layout choice", function () {
    scope.settings.additionalParams.layout = "4x1";
    scope.$digest();

    expect(scope.settings.params.layoutURL).to.equal("https://s3.amazonaws.com/widget-rss-test/1.0.0/dist/layout-4x1.html");

    scope.settings.additionalParams.layout = "2x1";
    scope.$digest();

    expect(scope.settings.params.layoutURL).to.equal("https://s3.amazonaws.com/widget-rss-test/1.0.0/dist/layout-2x1.html");

    scope.settings.additionalParams.layout = "1x2";
    scope.$digest();

    expect(scope.settings.params.layoutURL).to.equal("https://s3.amazonaws.com/widget-rss-test/1.0.0/dist/layout-1x2.html");

  });

  it("should apply custom layout URL value to params.layoutURL from choosing to use a custom layout", function () {
    scope.settings.additionalParams.layout = "custom";
    scope.settings.additionalParams.customLayout = "http://test.com";
    scope.$digest();

    expect(scope.settings.params.layoutURL).to.equal("http://test.com");
  });

});
