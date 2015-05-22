/* jshint expr: true */

(function () {
  "use strict";

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;

  browser.driver.manage().window().setSize(1024, 768);

  describe("RSS Settings - e2e Testing", function() {

    var validUrl = "http://rss.cbc.ca/lineup/topstories.xml",
      invalidUrl = "http://w";

    beforeEach(function () {
      browser.get("/src/settings-e2e.html");
    });

    it("Should load all components", function () {
      // Widget Button Toolbar
      expect(element(by.css("button#save")).isPresent()).to.eventually.be.true;
      expect(element(by.css("button#cancel")).isPresent()).to.eventually.be.true;

      // URL Field
      expect(element(by.model("url")).isPresent()).to.eventually.be.true;
    });

    it("Should correctly load default settings", function () {
      // save button should be disabled
      expect(element(by.css("button#save[disabled=disabled")).isPresent()).to.eventually.be.true;

      // form should be invalid due to URL Field empty entry
      expect(element(by.css("form[name='settingsForm'].ng-invalid")).isPresent()).to.eventually.be.true;

      // RSS URL input value should be empty
      expect(element(by.model("url")).getAttribute("value")).to.eventually.equal("");
    });

    it("Should be invalid form and Save button disabled due to invalid URL", function () {
      element(by.model("url")).sendKeys(invalidUrl);

      // save button should be disabled
      expect(element(by.css("button#save[disabled=disabled")).isPresent()).to.eventually.be.true;

      // form should be invalid due to invalid URL
      expect(element(by.css("form[name='settingsForm'].ng-invalid")).isPresent()).to.eventually.be.true;
    });

    it("Should correctly save settings", function () {
      var settings = {
        params: {},
        additionalParams: {
          "url": validUrl
        }
      };

      element(by.model("url")).sendKeys(validUrl);

      element(by.id("save")).click();

      expect(browser.executeScript("return window.result")).to.eventually.deep.equal(
        {
          'additionalParams': JSON.stringify(settings.additionalParams),
          'params': ''
        });
    });

  });

})();
