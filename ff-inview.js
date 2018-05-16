(function(root, factory) {
  'use strict';
  root.ffinview = factory();
})(this, function() {
  'use strict';

  var inviewElements = [],
      viewport = window.innerHeight,
      THROTTLE_INTERVAL = 100;

  // Constructor
  var FFinview = function(element, config) {
    this.element = element;
    this.visible = false;
    for (var prop in config) {
      if (config.hasOwnProperty(prop)) {
        this[prop] = config[prop];
      }
    }
  };

  // Default options
  FFinview.prototype.offsetIn = 0;
  FFinview.prototype.offsetOut = 0;
  FFinview.prototype.persist = false;
  FFinview.prototype.in = function() {};
  FFinview.prototype.out = function() {};

  // Add all elements
  var add = function(elements, options) {
    // sanity check of arguments
    if (elements instanceof Node === false && typeof elements.length !== 'number' || typeof options !== 'object') {
      return false;
    }

    // treat single node as array
    if (elements instanceof Node === true) {
      elements = [ elements ];
    }

    var i = 0,
        len = elements.length;

    // add elements to general inview array
    for (; i < len; i++) {
      inviewElements.push(new FFinview(elements[i], options));
    }

    // check if recently added elements are visible
    checkInview();

    i = len = null;
  };

  // Update metrics & check if elements are visible
  var updateMetrics = function() {
    viewport = window.innerHeight;
    checkInview();
  };

  // Check if elements are visible
  var checkInview = function() {
    var len = inviewElements.length,
        el,
        rect;

    while (len) {
      --len;

      el = inviewElements[len];
      try {
        rect = el.element.getBoundingClientRect();
      } catch (e) {
        rect = {
          top: 0,
          left: 0
        };
      }

      if(typeof rect.height === 'undefined') rect.height = el.offsetHeight;

      // In
      if (!el.visible && rect.top - el.offsetIn < viewport && rect.top >= -(rect.height + el.offsetIn)) {
        el.in.apply(el.element);
        el.visible = true;
      }

      // Out
      if (el.visible && (rect.top - el.offsetOut >= viewport || rect.top <= -(rect.height + el.offsetOut))) {
        el.out.apply(el.element);
        el.visible = false;

        // If not persist remove element
        if (!el.persist) {
          inviewElements.splice(len, 1);
        }
      }
    }

    el = len = null;
  };

  // Throttle
  var throttle = function(fn) {
    var timer = null;

    return function () {
      if (timer) {
        return;
      }
      timer = setTimeout(function () {
        fn.apply(this, arguments);
        timer = null;
      }, THROTTLE_INTERVAL);
    };
  };

  // on resize
  window.addEventListener('resize', throttle(updateMetrics));
  // on scroll
  window.addEventListener('scroll', throttle(checkInview));

  return add;
});
