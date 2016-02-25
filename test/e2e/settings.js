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

    it("Should load Save button", function () {
      expect(element(by.css("button#save")).isPresent()).to.eventually.be.true;
    });

    it("Should load Cancel button", function () {
      expect(element(by.css("button#cancel")).isPresent()).to.eventually.be.true;
    });

    it("Should load Title Font Setting component", function () {
      expect(element(by.css("#title-font .mce-tinymce")).isPresent()).to.eventually.be.true;
    });

    it("Should load Title Font Setting component", function () {
      expect(element(by.css("#story-font .mce-tinymce")).isPresent()).to.eventually.be.true;
    });

    it("Should enable Save button", function () {
      expect(element(by.css("button#save[disabled=disabled")).isPresent()).to.eventually.be.false;
    });

    it("Should set form to valid", function () {
      expect(element(by.css("form[name='settingsForm'].ng-invalid")).isPresent()).to.eventually.be.false;
    });

    it("Should disable Save button for invalid url", function () {
      element(by.name("url")).sendKeys("invalidURL");
      expect(element(by.css("button#save[disabled=disabled")).isPresent()).to.eventually.be.true;
    });

    it("Should correctly save settings", function () {
      var settings = {
        params: {},
        additionalParams: {
          "url":"",
          "headline":{
            "fontStyle":{
              "font":{
                "family":"verdana,geneva,sans-serif",
                "type":"standard",
                "url":""
              },
              "size":"24px",
              "customSize":"",
              "align":"left",
              "bold":false,
              "italic":false,
              "underline":false,
              "forecolor":"black",
              "backcolor":"transparent"
            }
          },
          "story":{
            "fontStyle":{
              "font":{
                "family":"verdana,geneva,sans-serif",
                  "type":"standard",
                  "url":""
              },
              "size":"24px",
              "customSize":"",
              "align":"left",
              "bold":false,
              "italic":false,
              "underline":false,
              "forecolor":"black",
              "backcolor":"transparent"
            }
          }
        }
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
