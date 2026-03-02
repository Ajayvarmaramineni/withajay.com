/* masonry.js — Reveal photos after load */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var items = document.querySelectorAll('.masonry-item img');
    if (!items.length) {
      document.body.style.opacity = '1';
      return;
    }

    var total = items.length;
    var loaded = 0;

    function onLoad() {
      loaded++;
      if (loaded >= total) reveal();
    }

    function reveal() {
      document.body.style.opacity = '1';
    }

    items.forEach(function (img) {
      if (img.complete) {
        onLoad();
      } else {
        img.addEventListener('load', onLoad);
        img.addEventListener('error', onLoad);
      }
    });

    // Fallback timeout
    setTimeout(reveal, 2000);
  });
})();
