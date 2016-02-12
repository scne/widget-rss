/* jshint expr: true */

(function () {
  "use strict";

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;

  browser.driver.manage().window().setSize(1024, 768);

  describe("RSS Settings - e2e Testing", function() {

    beforeEach(function () {
      browser.get("/src/settings-e2e.html");
    });

    it("Should correctly save settings", function () {
      var settings = {
        params: {},
        additionalParams: {}
      };

      element(by.id("save")).click();

      expect(browser.executeScript("return window.result")).to.eventually.deep.equal(
        {
          "additionalParams": JSON.stringify(settings.additionalParams),
          "params": ""
        });
    });

  });

})();
