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

    describe("Initialization", function() {
      it("Should load Save button", function () {
        expect(element(by.css("button#save")).isPresent()).to.eventually.be.true;
      });

      it("Should load Cancel button", function () {
        expect(element(by.css("button#cancel")).isPresent()).to.eventually.be.true;
      });

      it("Should load Title Font Setting component", function () {
        expect(element(by.css("#title-font .mce-tinymce")).isPresent()).to.eventually.be.true;
      });

      it("Should load Description Font Setting component", function () {
        expect(element(by.css("#story-font .mce-tinymce")).isPresent()).to.eventually.be.true;
      });

      it("Should load Timestamp Font Setting component", function () {
        expect(element(by.css("#timestamp-font .mce-tinymce")).isPresent()).to.eventually.be.true;
      });

      it("Should load Author Font Setting component", function () {
        expect(element(by.css("#author-font .mce-tinymce")).isPresent()).to.eventually.be.true;
      });

      it("Should load Transition", function () {
        expect(element(by.id("transitionHeading")).isDisplayed()).to.eventually.be.true;
      });

      it("Should load Transition options", function () {
        expect(element(by.model("settings.additionalParams.transition.type")).isDisplayed()).to.eventually.be.true;
      });

      // it("Should not load URL field", function() {
      //   expect(element(by.id("custom-layout")).isPresent()).to.eventually.be.false;
      // });
    });

    describe("Defaults", function() {
      it("Should set default value for 'Items to Show'", function () {
        expect(element(by.id("items-to-show")).getAttribute("value")).to.eventually.equal("2");
      });

      it("Should set default value for 'Max Items in Queue'", function () {
        expect(element(by.model("settings.additionalParams.itemsInQueue")).getAttribute("value")).to.eventually.equal("5");
      });

      it("Should set default value for 'Transition'", function () {
        expect(element(by.model("settings.additionalParams.transition.type")).getAttribute("value")).to.eventually.equal("none");
      });

      it("Should load duration", function () {
        expect(element(by.model("duration")).getAttribute("value")).to.eventually.equal("10");
      });

      it("Should select 'Show Title'", function () {
        expect(element(by.model("settings.additionalParams.dataSelection.showTitle")).isSelected()).to.eventually.be.true;
      });

      it("Should select 'Show Timestamp'", function () {
        expect(element(by.model("settings.additionalParams.dataSelection.showTimestamp")).isSelected()).to.eventually.be.true;
      });

      it("Should select 'Show Author'", function () {
        expect(element(by.model("settings.additionalParams.dataSelection.showAuthor")).isSelected()).to.eventually.be.true;
      });

      it("Should select 'Show Description Snippet'", function () {
        expect(element(by.css("input[type='radio'][value='snippet']")).isSelected()).to.eventually.be.true;
      });

      it("Should select default layout", function () {
        expect(element(by.css("input[type='radio'][value='layout-4x1']")).isSelected()).to.eventually.be.true;
      });
    });

    // describe("Visibility", function() {
    //   it("Should show URL field if 'Custom Layout URL' is selected", function() {
    //     element(by.css("input[type='radio'][value='custom']")).click();

    //     expect(element(by.id("custom-layout")).isDisplayed()).to.eventually.be.true;
    //   });
    // });

    describe("Saving", function() {
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
            "itemsInQueue": 5,
            "itemsToShow": 2,
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
            },
            "timestamp":{
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
            "author":{
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
            "transition": {
              "type": "none",
              "duration": 10000
            },
            "dataSelection": {
              "showTitle": true,
              "showTimestamp": true,
              "showAuthor": true,
              "showDescription": "snippet"
            },
            "layout": "layout-4x1",
            // "layoutUrl": ""
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

  });

  describe("RSS Settings - deselection", function() {

    before(function () {
      browser.get("/src/settings-e2e.html");
    });

    it("Should not load Title Font Setting component", function () {
      element(by.model("settings.additionalParams.dataSelection.showTitle")).click();
      expect(element(by.css("#title-font .mce-tinymce")).isPresent()).to.eventually.be.false;
    });

    it("Should not load Date Font Setting component", function () {
      element(by.model("settings.additionalParams.dataSelection.showTimestamp")).click();
      expect(element(by.css("#timestamp-font .mce-tinymce")).isPresent()).to.eventually.be.false;
    });

    it("Should not load Date Font Setting component", function () {
      element(by.model("settings.additionalParams.dataSelection.showAuthor")).click();
      expect(element(by.css("#author-font .mce-tinymce")).isPresent()).to.eventually.be.false;
    });

    it("Should correctly save settings", function () {
      var settings = {
        params: {},
        additionalParams: {
          "url":"",
          "itemsInQueue": 5,
          "itemsToShow": 2,
          "headline":{
            "fontStyle":{}
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
          },
          "timestamp":{
            "fontStyle":{}
          },
          "author":{
            "fontStyle":{}
          },
          "transition": {
            "type": "none",
            "duration": 10000
          },
          "dataSelection": {
            "showTitle": false,
            "showTimestamp": false,
            "showAuthor": false,
            "showDescription": "snippet"
          },
          "layout": "layout-4x1",
          // "layoutUrl": ""
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
