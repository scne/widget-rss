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

    it("Should load all Angular directives", function () {
      // URL Field
      expect(element(by.model("url")).isPresent()).to.eventually.be.true;

      // Scroll Setting
      expect(element(by.id("scroll-by")).isPresent()).to.eventually.be.true;

      // Font Setting
      expect(element(by.css(".font-setting")).isPresent()).to.eventually.be.true;
    });

    it("Should correctly load default settings", function () {
      // save button should be disabled
      expect(element(by.css("button#save[disabled=disabled")).isPresent()).to.eventually.be.true;

      // form should be invalid due to URL Field empty entry
      expect(element(by.css("form[name='settingsForm'].ng-invalid")).isPresent()).to.eventually.be.true;

      // RSS URL input value should be empty
      expect(element(by.css("url-field[name='rssUrl'] input[name=url]")).getAttribute("value")).to.eventually.equal("");

      // Stories
      expect(element(by.model("settings.additionalParams.stories")).getAttribute("value")).to.eventually.equal("2");

      // Queue
      expect(element(by.model("settings.additionalParams.queue")).getAttribute("value")).to.eventually.equal("5");

      // Refresh
      expect(element(by.model("settings.additionalParams.refresh")).getAttribute("value")).to.eventually.equal("5");

      // Data Selection - Full Story selected
      expect(element(by.css("input[name=story]:checked")).getAttribute("value")).to.eventually.equal("full");

      // Data Selection - Title selected
      expect(element(by.model("settings.additionalParams.selection.title")).isSelected()).to.eventually.be.true;

      // Data Selection - Date selected
      expect(element(by.model("settings.additionalParams.selection.date")).isSelected()).to.eventually.be.true;

      // Data Selection - Author selected
      expect(element(by.model("settings.additionalParams.selection.author")).isSelected()).to.eventually.be.true;

      // Layout #1 selected
      expect(element(by.css("input[name=layout]:checked")).getAttribute("value")).to.eventually.equal("4x1");

      // Custom layout url field hidden
      //expect(element(by.model("customLayout")).isPresent()).to.eventually.be.false;
      expect(element(by.css("url-field[name='layoutUrl']")).isPresent()).to.eventually.be.false;
    });

    it("Should be invalid form and Save button disabled due to invalid URL", function () {
      //element(by.model("url")).sendKeys(invalidUrl);
      element(by.css("url-field[name='rssUrl'] input[name=url]")).sendKeys(invalidUrl);

      expect(element(by.css("url-field[name='rssUrl'] input[name=url]")).getAttribute("value")).to.eventually.equal(invalidUrl);

      // save button should be disabled
      expect(element(by.css("button#save[disabled=disabled")).isPresent()).to.eventually.be.true;

      // form should be invalid due to invalid URL
      expect(element(by.css("form[name='settingsForm'].ng-invalid")).isPresent()).to.eventually.be.true;
    });

    it("Should show URL entry for a custom layout", function () {
      // need to scroll down to where element is visible
      browser.executeScript('arguments[0].scrollIntoView()', element(by.id("layout-custom")));

      element(by.id("layout-custom")).click();

      expect(element(by.css("input[name=layout]:checked")).getAttribute("value")).to.eventually.equal("custom");
      expect(element(by.css("url-field[name='layoutUrl']")).isPresent()).to.eventually.be.true;

    });

    it("Should show invalid form from invalid custom layout url", function () {
      // need to scroll down to where element is visible
      browser.executeScript('arguments[0].scrollIntoView()', element(by.id("layout-custom")));

      element(by.id("layout-custom")).click();

      element(by.css("url-field[name='layoutUrl'] input[name=url]")).sendKeys(invalidUrl);

      expect(element(by.css("form[name=settingsForm].ng-invalid")).isPresent()).
        to.eventually.be.true;

      expect(element(by.css("form[name=settingsForm].ng-valid")).isPresent()).
        to.eventually.be.false;

      // url-field directive is the reason for invalid form
      expect(element(by.css("url-field[name='layoutUrl']")).getAttribute("class")).
        to.eventually.contain("ng-invalid-valid");

      // save button should be disabled
      expect(element(by.css("button#save[disabled=disabled")).isPresent()).to.eventually.be.true;

    });

    it("Should correctly save settings", function () {
      var settings = {
        params: {},
        additionalParams: {
          url: validUrl,
          stories: 2,
          queue: 5,
          refresh: 5,
          scroll: {
            by: "none",
            speed: "medium",
            pause: 5
          },
          selection: {
            story: "full",
            title: true,
            date: true,
            author: true
          },
          headingFont: {
            font: {
              type: "standard",
              name: "Verdana",
              family: "Verdana"
            },
            size: "20",
            bold: false,
            italic: false,
            underline: false,
            color:"black",
            highlightColor:"transparent",
            align: "left"
          },
          storyFont: {
            font: {
              type: "standard",
              name: "Verdana",
              family: "Verdana"
            },
            size: "20",
            bold: false,
            italic: false,
            underline: false,
            color:"black",
            highlightColor:"transparent",
            align: "left"
          },
          layout: "4x1",
          customLayout: ""
        }
      };

      element(by.css("url-field[name='rssUrl'] input[name=url]")).sendKeys(validUrl);

      // need to scroll down to where element is visible
      browser.executeScript('arguments[0].scrollIntoView()', element(by.id("save")));

      element(by.id("save")).click();

      expect(browser.executeScript("return window.result")).to.eventually.deep.equal(
        {
          'additionalParams': JSON.stringify(settings.additionalParams),
          'params': "https://s3.amazonaws.com/widget-rss-test/1.0.0/dist/layout-4x1.html?"
        });
    });

  });

})();
