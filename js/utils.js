/* utils.js — Shared utility functions */
(function (global) {

  /** Debounce: delays fn execution until after wait ms of inactivity */
  function debounce(fn, wait) {
    var timer;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  /** Throttle: ensures fn is called at most once per limit ms */
  function throttle(fn, limit) {
    var lastCall = 0;
    return function () {
      var now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        return fn.apply(this, arguments);
      }
    };
  }

  /** Lazy-load images with data-src attribute using IntersectionObserver */
  function initLazyImages() {
    var imgs = document.querySelectorAll('img[data-src]');
    if (!imgs.length) return;
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.src = entry.target.getAttribute('data-src');
            entry.target.removeAttribute('data-src');
            observer.unobserve(entry.target);
          }
        });
      });
      imgs.forEach(function (img) { observer.observe(img); });
    } else {
      imgs.forEach(function (img) {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
    }
  }

  /** Calculate rough reading time from plain text */
  function readingTime(text) {
    var wordCount = text.trim().split(/\s+/).length;
    var minutes = Math.ceil(wordCount / 200);
    return minutes + ' min read';
  }

  /** Format ISO date string to human-readable form (e.g. "March 2, 2026") */
  function formatDate(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /** Smooth-scroll to an element by selector */
  function smoothScrollTo(selector) {
    var el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Expose on global object
  global.SiteUtils = {
    debounce: debounce,
    throttle: throttle,
    initLazyImages: initLazyImages,
    readingTime: readingTime,
    formatDate: formatDate,
    smoothScrollTo: smoothScrollTo
  };

}(typeof window !== 'undefined' ? window : this));
