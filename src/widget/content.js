/* global _ */

var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.Content = function (params) {

  "use strict";

  var _items = [],
    _utils = RiseVision.RSS.Utils,
    _images = RiseVision.RSS.Images,
    _transition = null;

  var _imageTypes = ["image/bmp", "image/gif", "image/jpeg", "image/jpg", "image/png", "image/tiff"];
  var _videoTypes = ["video/mp4", "video/webm", "video/ogg"];

  /*
   *  Private Methods
   */
  function _getItemHeight() {
    // account for not enough items to actually show compared to setting value
    var itemsToShow = (_items.length <= params.itemsToShow) ? _items.length : params.itemsToShow;

    if (params.separator && params.separator.show) {
      return params.height / itemsToShow - params.separator.size;
    }
    else {
      return params.height / itemsToShow;
    }
  }

  function _getStory(item) {
    var story = null;

    if (_.has(item, "description")) {
      story = item.description;
    }

    return story;
  }

  function _getAuthor(item) {
    var author = null;

    if (item.author) {
      author = item.author;
    } else if (_.has(item, "dc:creator")) {
      author = item["dc:creator"]["#"];
    }

    return author;
  }

  function _getImageUrl(item) {
    var imageUrl = null;

    if (item.image && item.image.url) {
      imageUrl = item.image.url;
    }
    else if (_.has(item, "enclosures")) {
      if (item.enclosures[0] && (_.contains(_imageTypes, item.enclosures[0].type))) {
        imageUrl = item.enclosures[0].url;
      }
    }

    return imageUrl;
  }

  function _getImageUrls() {
    var urls = [];

    for (var i = 0; i < _items.length; i += 1) {
      urls.push(_getImageUrl(_items[i]));
    }

    return urls;
  }

  function _getVideo(item){
    var video = {};

    if (item.enclosures[0] && (_.contains(_videoTypes, item.enclosures[0].type))) {
        video.url = item.enclosures[0].url;
      video.type = item.enclosures[0].type;
      video.position = 0;
    }

    return video;
  }

  function _getVideos (){
    var videos = [];

    for (var i = 0; i < _items.length; i += 1) {
      videos.push(_getVideo(_items[i]));
    }
  }

  function _getDate(item) {
    var pubdate = item.date, formattedDate = null;

    if (pubdate) {
      pubdate = new Date(pubdate);
      var options = {
        year: "numeric", month: "long", day: "numeric"
      };
      formattedDate = pubdate.toLocaleDateString("en-us", options);
    }

    return formattedDate;
  }

  function _getImageDimensions($image, item) {
    var dimensions = null,
      marginWidth = parseInt($image.css("margin-left"), 10) + parseInt($image.css("margin-right"), 10),
      marginHeight = parseInt($image.css("margin-top"), 10) + parseInt($image.css("margin-bottom"), 10),
      ratioX, ratioY, scale;

    switch (params.layout) {
      case "layout-4x1":
        dimensions = {};
        dimensions.width = params.width * 0.33;
        dimensions.height = (params.height / params.itemsToShow) - marginHeight;

        break;

      case "layout-2x1":
        dimensions = {};

        if ($(item).find(".story").length === 0) {
          dimensions.width = params.width - marginWidth;
        }
        else {
          dimensions.width = params.width * 0.5;
        }

        dimensions.height = (params.height / params.itemsToShow) - $(item).find(".textWrapper").outerHeight(true) - marginHeight;

        break;

      case "layout-16x9":
        dimensions = {};
        dimensions.width = params.width - marginWidth;
        dimensions.height = (params.height / params.itemsToShow) - marginHeight;

        break;
      case "layout-1x2":
        dimensions = {};
        dimensions.width = params.width - marginWidth;
        dimensions.height = ((params.height / params.itemsToShow) - marginHeight) / 2;
        break;
    }

    if (dimensions) {
      ratioX = dimensions.width / parseInt($image.width());
      ratioY = dimensions.height / parseInt($image.height());
      scale = ratioX < ratioY ? ratioX : ratioY;

      dimensions.width = parseInt(parseInt($image.width()) * scale);
      dimensions.height = parseInt(parseInt($image.height()) * scale);
    }

    return dimensions;
  }

  function _getTemplate(item, index) {
    var story = _getStory(item),
      author = _getAuthor(item),
      imageUrl = _getImageUrl(item),
      date = _getDate(item),
      template = document.querySelector("#layout").content,
      $content = $(template.cloneNode(true)),
      $story, clone, image;

    // Headline
    if (!item.title || ((typeof params.dataSelection.showTitle !== "undefined") &&
      !params.dataSelection.showTitle)) {
      $content.find(".headline").remove();
    }
    else {
      $content.find(".headline").css("textAlign", params.headline.fontStyle.align);
      $content.find(".headline a").text(_utils.stripScripts(item.title));
    }

    var removeSeparator = false;
    // Timestamp
    if (!date || ((typeof params.dataSelection.showTimestamp !== "undefined") &&
      !params.dataSelection.showTimestamp)) {
      removeSeparator = true;
      $content.find(".timestamp").remove();
    }
    else {
      if (params.timestamp) {
        $content.find(".timestamp").css("textAlign", params.timestamp.fontStyle.align);
      }
      $content.find(".timestamp").text(date);
    }

    // Author
    if (!author || ((typeof params.dataSelection.showAuthor !== "undefined") &&
      !params.dataSelection.showAuthor)) {
      removeSeparator = true;
      $content.find(".author").remove();
    }
    else {
      if (params.author) {
        $content.find(".author").css("textAlign", params.author.fontStyle.align);
      }
      $content.find(".author").text(author);
    }

    if (removeSeparator) {
      $content.find(".separator").remove();
    }

    // Image
    if (!imageUrl || ((typeof params.dataSelection.showImage !== "undefined") &&
      !params.dataSelection.showImage)) {
      $content.find(".image").remove();
    }
    else {
      // get preloaded image pertaining to this item based on index value
      image = _images.getImages()[index];

      if (image) {
        $content.find(".image").attr("src", imageUrl);
      }
    }

    // Story
    if (!story) {
      $content.remove(".story");
    }
    else {
      $story = $content.find(".story");
      $story.css("textAlign", params.story.fontStyle.align);
      story = _utils.stripScripts(story);

      if (params.dataSelection.showDescription === "snippet") {
        $story.html(_utils.truncate($("<div/>").html(story).text(), params.dataSelection.snippetLength));
      }
      else {
        $story.html(story);
      }

      // apply the story font styling to child elements as well.
      $story.find("p").addClass("story_font-style");
      $story.find("div").addClass("story_font-style");
      $story.find("span").addClass("story_font-style");
    }

    clone = $(document.importNode($content[0], true));

    return clone;
  }

  function _setImageDimensions() {
    $(".item").each(function () {
      var $image = $(this).find(".image"),
        dimensions = null;

      if ($image) {
        dimensions = _getImageDimensions($image, this);

        if (dimensions) {
          $image.width(dimensions.width);
          $image.height(dimensions.height);
        }
      }

    });
  }

  function _showItem(index) {
    $(".page").append(_getTemplate(_items[index], index));

    _setImageDimensions();

    if (params.separator && params.separator.show) {
      $(".item").css("border-bottom", "solid " + params.separator.size + "px " + params.separator.color);
    }

    $(".item").height(_getItemHeight());

    // 16x9 (images only) layout doesn't need truncating, image sizing handled in _setImageDimensions()
    if (params.layout !== "layout-16x9") {
      // truncate content
      $(".item").dotdotdot({
        height: _getItemHeight()
      });
    }

  }

  /*
   *  Public Methods
   */
  function init(feed) {
    /*jshint validthis:true */

    _items = feed.items;

    if (!_transition) {

      if (!params.transition) {
        // legacy, backwards compatible
        params.transition = {
          type: "none",
          duration: 10
        };
      }

      if (params.transition.type === "none" || params.transition.type === "fade") {
        _transition = new RiseVision.RSS.TransitionNoScroll(params, this);
      }
      else if (params.transition.type === "scroll" || params.transition.type === "page") {
        _transition = new RiseVision.RSS.TransitionVerticalScroll(params, this);
      }
    }

    loadImages(function () {
      _transition.init(_items);
    });
  }

  function loadImages(cb) {
    // load all images
    _images.load(_getImageUrls(), function () {
      if (cb && typeof cb === "function") {
        cb();
      }
    });
  }


  function pause() {
    if (_transition) {
      _transition.stop();
    }
  }

  function reset() {
    if (_transition) {
      _transition.stop();
      _transition.reset();
    }

    _items = [];
  }

  function play() {
    if (_transition) {
      _transition.start();
    }
  }

  function showItem(index) {
    _showItem(index);
  }

  function update(feed) {
    _items = feed.items;

    if (_transition) {
      _transition.update(_items);
    }
  }

  return {
    init: init,
    loadImages: loadImages,
    pause: pause,
    play: play,
    reset: reset,
    showItem: showItem,
    update: update
  };
};
