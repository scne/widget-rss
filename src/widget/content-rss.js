/* global _ */

var RiseVision = RiseVision || {};
RiseVision.RSS = RiseVision.RSS || {};

RiseVision.RSS.ContentRSS = function (prefs, params) {

  "use strict";

  var SUPPORTED_IMAGES = ["image/bmp", "image/gif", "image/jpeg", "image/png", "image/tiff"];

  // Plugins
  var PLUGIN_SCROLL = "plugin_autoScroll";

  var _items = [],
    _imageUrls = [];

  var _initialBuild = true,
    _isScrolling = false;

  var $el;

  function _cache() {
    $el = {
      scrollContainer:      $("#scrollContainer"),
      page:                 $(".page")
    };
  }

  function _hasImages(imagesArr) {
    var list;

    if (imagesArr.length === 0) {
      return false;
    }

    list = _.without(imagesArr, null);

    return list.length !== 0;
  }

  function _urlExists(url, story) {
    if (url && story) {
      return story.indexOf(url !== -1);
    }

    return false;
  }

  function _useSeparator() {
    // TODO: no checkbox setting for allowing the choice to use a separator
    return params.scroll.by.transition === "continuous";
  }

  function _getItemHeight() {
    var height = prefs.getInt("rsH") / parseInt(params.stories);

    return (_useSeparator()) ? height - 1: height;
  }

  function _getScrollEl() {
    if (typeof $el.scrollContainer.data(PLUGIN_SCROLL) !== "undefined") {
      return $el.scrollContainer.data(PLUGIN_SCROLL);
    }

    return null;
  }

  function _getStory(item) {
    var story = null;

    if (_.has(item, "content:encoded")) {
      story = item["content:encoded"];
    } else if (_.has(item, "description")) {
      story = item.description;
    }

    return story;
  }

  function _getAuthor(item) {
    var author = null;

    if (_.has(item, "author")) {
      author = item.author;
    } else if (_.has(item, "dc:creator")) {
      author = item["dc:creator"];
    }

    return author;
  }

  function _getImage(index) {
    var images = RiseVision.RSS.Images.getImages(),
      image = null;

    if (images.length > 0 && images[index]) {
      if (images[index].src) {
        image = images[index];
      }
    }

    return image;
  }

  function _setScrolling() {
    if (!_getScrollEl()) {
      // Intitiate auto scrolling on the scroll container
      $el.scrollContainer.autoScroll(params.scroll)
        .on("done", function () {
          _isScrolling = false;

          RiseVision.RSS.onContentDone();
        });
    }
  }

  function _getTemplate(item, index) {
    var story = _getStory(item),
      author = _getAuthor(item),
      image = _getImage(index),
      content = document.querySelector("#rssItem").content,
      clone;

    // Headline
    content.querySelector(".headline").textContent = item.title;

    // Author
    content.querySelector(".author").textContent = (!author) ? "" : author;

    // Date
    // TODO: use moment.js to format the date
    content.querySelector(".date").textContent = item.pubdate;

    // Story
    if (params.selection.story === "snippet") {
      // TODO: need to convert story value to text and truncate, set full story for now
      content.querySelector(".story").innerHTML = (!story) ? "" : story;
    }
    else {
      // TODO: strip out <script> tags before setting this value

      content.querySelector(".story").innerHTML = (!story) ? "" : story;

      // TODO: Reminder - apply story_font-style to everything inside (likely not in this function)
    }

    // Images
    if (image) {
      content.querySelector(".image").setAttribute("src", image.src);
      // TODO: Reminder - image dimensions need to be applied (not in this function)
    } else {
      // remove the src attribute from <image>
      content.querySelector(".image").removeAttribute("src");
    }

    clone = $(document.importNode(content, true));

    return clone;
  }

  function _addItems() {
    var itemsNum = (_items.length <= params.queue) ? _items.length : params.queue,
      templatesNum, template;

    // clear content
    $el.page.empty();

    if (params.scroll.by !== "none") {
      // display all items
      templatesNum = itemsNum;
    } else {
      // TODO: transitioning not implemented yet, this won't be used yet
      templatesNum = (params.stories <= itemsNum) ? params.stories : itemsNum;
    }

    for (var i = 0; i < templatesNum; i += 1) {
      template = _getTemplate(_items[i], i);
      $el.page.append(template);
    }

    // TODO: may need to truncate elsewhere when transitioning is implemented
    // truncate items in order to show the
    $(".item").dotdotdot({
      height: _getItemHeight()
    });

    $(".item").height(_getItemHeight());
  }

  function _init() {
    $el.scrollContainer.width(prefs.getInt("rsW"));
    $el.scrollContainer.height(prefs.getInt("rsH"));

    _addItems();

    if (_initialBuild) {
      _setScrolling();

      RiseVision.RSS.onContentReady();
    }
  }

  function _configureMedia(feedItems) {
    var story, media, medium, url, type, found, enclosure;

    for (var i = 0; i < feedItems.length; i++) {
      found = false;
      story = _getStory(feedItems[i]);
      media = (_.has(feedItems[i], "media:content")) ? feedItems[i]["media:content"] : null;
      enclosure = (_.has(feedItems[i], "enclosure")) ? feedItems[i].enclosure : null;

      // TODO: Need to account for multiple <media:content> elements within a <media:group> element.

      if (media) {
        medium = (_.has(media, "medium")) ? media.medium : null;
        url = (_.has(media, "url")) ? media.url : null;
        type = (_.has(media, "type")) ? media.type : null;

        if (medium) {
          if (medium === "image") {
            if (!_urlExists(url, story)) {
              _imageUrls.push(url);
              found = true;
            }
          }
        }
        else if (type) {
          if (_.indexOf(SUPPORTED_IMAGES, type) !== -1) {
            if (!_urlExists(url, story)) {
              _imageUrls.push(url);
              found = true;
            }
          }
        }
      }
      else if (enclosure) {
        url = (_.has(enclosure, "url")) ? enclosure.url : null;
        type = (_.has(enclosure, "type")) ? enclosure.type : null;

        if (_.indexOf(SUPPORTED_IMAGES, type) !== -1) {
          if (!_urlExists(url, story)) {
            _imageUrls.push(url);
            found = true;
          }
        }
      }

      //Add a null url if this particular item has no image.
      if (!found) {
        _imageUrls.push(null);
      }
    }
  }

  function scrollPlay() {
    var $scroll = _getScrollEl();

    if ($scroll && $scroll.canScroll() && !_isScrolling) {
      $scroll.play();
      _isScrolling = true;
    }
  }

  function scrollPause() {
    var $scroll = _getScrollEl();

    if ($scroll && $scroll.canScroll()) {
      $scroll.pause();
      _isScrolling = false;
    }
  }

  function build(feed) {
    _items = feed.items;

    if (!$el) {
      _cache();
    }

    _imageUrls = [];

    _configureMedia(_items);

    if (_hasImages(_imageUrls)) {
      // Load the images
      RiseVision.RSS.Images.load(_imageUrls, function () {
        if (_initialBuild) {
          _init();
        }
        /*else {
          // TODO: not sure what will happen here yet
        }*/
      });
    } else {
      if (_initialBuild) {
        _init();
      }
      /*else {
       // TODO: not sure what will happen here yet
      }*/
    }
  }

  return {
    build: build,
    scrollPlay: scrollPlay,
    scrollPause: scrollPause
  };
};
