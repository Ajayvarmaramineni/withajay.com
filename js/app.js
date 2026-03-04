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

    // Fade name logo on scroll (inner pages)
    var pnl = document.getElementById('pageNameLogo');
    if (pnl) {
      window.addEventListener('scroll', function() {
        if (window.scrollY > 80) {
          pnl.classList.add('scrolled-away');
        } else {
          pnl.classList.remove('scrolled-away');
        }
      });
    }
  });
})();
