/*jshint expr:true */
"use strict";

describe("Unit Tests - Settings Controller", function () {

  var defaultSettings, scope, ctrl;

  beforeEach(module("risevision.widget.rss.settings"));

  beforeEach(inject(function($injector, $rootScope, $controller) {
    defaultSettings = $injector.get("defaultSettings");
    scope = $rootScope.$new();
    ctrl = $controller("rssSettingsController", {
      $scope: scope
    });

    scope.settingsForm = {
      $setValidity: function () {
        return;
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

  it("should convert duration from milliseconds to seconds", function (){
    scope.settings.additionalParams.transition.duration = 50000;
    scope.$digest();
    expect(scope.duration).to.equal(50);
  });

  it("should convert duration from seconds to milliseconds", function (){
    scope.duration = 60;
    scope.$digest();
    expect(scope.settings.additionalParams.transition.duration).to.equal(60000);
  });

});
