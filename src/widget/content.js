/* global _ */

var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.Content = function (prefs, params) {

  "use strict";

  var _items = [],
    _utils = RiseVision.RSS.Utils,
    _images = RiseVision.RSS.Images;

  var _$el;

  var _currentItemIndex = 0;

  var _transitionIntervalId = null;

  var _transition = {
    "type": "none",
    duration: 10000
  };

  var _waitingForUpdate = false;

  var _imageTypes = ["image/bmp", "image/gif", "image/jpeg", "image/jpg", "image/png", "image/tiff"];

  /*
   *  Private Methods
   */
  function _cache() {
    _$el = {
      page:           $(".page")
    };
  }

  function _getItemHeight() {
    // account for not enough items to actually show compared to setting value
    var itemsToShow = (_items.length <= params.itemsToShow) ? _items.length : params.itemsToShow;

    return prefs.getInt("rsH") / itemsToShow;
  }

  function _getTransitionConfig(index) {
    var config = {};

    if ((index + params.itemsToShow) >= (_items.length - 1)) {
      // account for not enough items to actually show from the feed
      config.itemsToShow = _items.length - (index + 1);
      config.currentItemIndex = (_items.length - 1);
    }
    else {
      config.itemsToShow = params.itemsToShow;
      // value is the index of the last item showing
      config.currentItemIndex = index + params.itemsToShow;
    }

    return config;
  }

  function _getStartConfig() {
    var config = {};

    if (_items.length <= params.itemsToShow) {
      // account for not enough items to actually show from the feed
      config.itemsToShow = _items.length;
      config.currentItemIndex = (_items.length - 1);
    }
    else {
      config.itemsToShow = params.itemsToShow;
      // value is the index of the last item showing
      config.currentItemIndex = (params.itemsToShow - 1);
    }

    return config;
  }

  function _getStory(item) {
    var story = null;

    if (_.has(item, "content:encoded")) {
      story = item["content:encoded"];
    } else if (_.has(item, "description")) {
      story = item.description;
    } else if (_.has(item, "summary")) {
      story = item.summary;
    } else if (_.has(item, "content")) {
      story = item.content;
    }

    return story;
  }

  function _getAuthor(item) {
    var author = null;

    if (_.has(item, "dc:creator")) {
      author = item["dc:creator"];
    } else if (_.has(item, "author")) {
      if (item.author.name) {
        author = item.author.name;
      } else {
        author = item.author;
      }
    }

    return author;
  }

  function _getImageUrl(item) {
    var imageUrl = null;

    // RSS 2.0
    if (_.has(item, "media:group")) {
      var mediaGroup = item["media:group"];
      if (_.contains(_imageTypes, mediaGroup["media:content"][0].type)) {
        imageUrl = mediaGroup["media:content"][0].url;
      }
    }
    else if (_.has(item, "media:content")) {
      if (_.contains(_imageTypes, item["media:content"].type)) {
        imageUrl = item["media:content"].url;
      }
    } // ATOM
    else if (_.has(item, "link")) {
      var link = _.find(item.link, function(link){ return link.rel === "enclosure" && (_.contains(_imageTypes, link.type));});
      if (link) {
        imageUrl = link.href;
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

  function _getDate(item) {
    var pubdate = null, formattedDate = null;

    if (_.has(item, "pubdate")) {
      pubdate = item.pubdate;
    } else if (_.has(item, "updated")) {
      pubdate = item.updated;
    } else if (_.has(item, "published")) {
      pubdate = item.published;
    }

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
      paddingWidth = parseInt($image.css("padding-left"), 10) + parseInt($image.css("padding-right"), 10),
      paddingHeight = parseInt($image.css("padding-top"), 10) + parseInt($image.css("padding-bottom"), 10),
      ratioX, ratioY, scale;

    switch (params.layout) {
      case "layout-4x1":
        dimensions = {};
        dimensions.width = prefs.getString("rsW") * 0.33;
        dimensions.height = (prefs.getString("rsH") / params.itemsToShow) - paddingHeight;

        break;

      case "layout-2x1":
        dimensions = {};

        if ($(item).find(".story").length === 0) {
          dimensions.width = prefs.getString("rsW") - paddingWidth;
        }
        else {
          dimensions.width = prefs.getString("rsW") * 0.5;
        }

        dimensions.height = (prefs.getString("rsH") / params.itemsToShow) - $(item).find(".textWrapper").outerHeight(true) - paddingHeight;

        break;

      case "layout-16x9":
        dimensions = {};
        dimensions.width = prefs.getString("rsW") - paddingWidth;
        dimensions.height = (prefs.getString("rsH") / params.itemsToShow) - paddingHeight;

        break;
      case "layout-1x2":
        dimensions = {};
        dimensions.width = prefs.getString("rsW") - paddingWidth;
        dimensions.height = ((prefs.getString("rsH") / params.itemsToShow) - paddingHeight) / 2;
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
        $story.html(_utils.truncate($("<div/>").html(story).text()));
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

  // Fade out and clear content.
  function _clear(cb) {
    if (_transition.type === "fade") {
      $(".item").one("transitionend", function() {
        _clearPage(cb);
      });

      $(".item").addClass("fade-out").removeClass("fade-in");
    }
    else {
      _clearPage(cb);
    }
  }

  function _clearPage(cb) {
    _$el.page.empty();
    if (!cb || typeof cb !== "function") {
      return;
    }
    else {
      cb();
    }
  }

  function _showItem(index) {
    _$el.page.append(_getTemplate(_items[index], index));

    _setImageDimensions();

    $(".item").height(_getItemHeight());

    if (_transition.type === "fade") {
      $(".item").addClass("fade-in");
    }

    $(".item").removeClass("hide");

    // truncate content
    $(".item").dotdotdot({
      height: _getItemHeight()
    });
  }

  function _makeTransition() {
    var startConfig = _getStartConfig(),
      transConfig = _getTransitionConfig(_currentItemIndex),
      startingIndex;

    if (_currentItemIndex === (_items.length - 1)) {

      _stopTransitionTimer();

      _clear(function() {

        // show the items
        for (var i = 0; i < startConfig.itemsToShow; i += 1) {
          _showItem(i);
        }

        _currentItemIndex = startConfig.currentItemIndex;

        RiseVision.RSS.onContentDone();
      });

      _waitingForUpdate = false;

      return;
    }

    if (_waitingForUpdate) {
      _waitingForUpdate = false;

      // load all images
      _images.load(_getImageUrls(), function () {

        _clear(function () {
          for (var i = 0; i < startConfig.itemsToShow; i += 1) {
            _showItem(i);
          }

          _currentItemIndex = startConfig.currentItemIndex;
        });

      });

    }
    else {
      startingIndex = _currentItemIndex + 1;

      _currentItemIndex = transConfig.currentItemIndex;

      _clear(function () {
        for (var i = startingIndex; i < (startingIndex + transConfig.itemsToShow); i += 1) {
          _showItem(i);
        }
      });
    }

  }

  function _startTransitionTimer() {
    if (_transitionIntervalId === null) {
      _transitionIntervalId = setInterval(function () {
        _makeTransition();
      }, _transition.duration);
    }
  }

  function _stopTransitionTimer() {
    clearInterval(_transitionIntervalId);
    _transitionIntervalId = null;
  }

  /*
   *  Public Methods
   */
  function init(feed) {
    var startConfig;

    _items = feed.items;

    if(params.transition){
      _transition = params.transition;
    }

    startConfig = _getStartConfig();

    _currentItemIndex = startConfig.currentItemIndex;

    // load all images
    _images.load(_getImageUrls(), function () {
      // show the items
      for (var i = 0; i < startConfig.itemsToShow; i += 1) {
        _showItem(i);
      }
    });

  }

  function pause() {
    _stopTransitionTimer();
  }

  function reset() {
    _stopTransitionTimer();
    _clear();
    _items = [];
  }

  function play() {
    _startTransitionTimer();
  }

  function update(feed) {
    _items = feed.items;
    _waitingForUpdate = true;
  }

  _cache();

  return {
    init: init,
    pause: pause,
    play: play,
    reset: reset,
    update: update
  };
};
