/* app.js — Main app: page fade-in, smooth scroll */
(function () {
  // Page fade-in
  document.addEventListener('DOMContentLoaded', function () {
    var shown = false;

    function showPage() {
      if (shown) return;
      shown = true;
      document.body.style.opacity = '1';
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(showPage);
    }
    setTimeout(showPage, 800);
  });
})();
