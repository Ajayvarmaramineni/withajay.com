/* app.js — Main app: page fade-in, smooth scroll, custom cursor */
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
// Scroll progress bar
var bar = document.getElementById('scroll-progress');
if (bar) {
  window.addEventListener('scroll', function() {
    var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  });
}
    // Custom cursor
    var dot  = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (dot && ring) {
      var mx = 0, my = 0, rx = 0, ry = 0;
      document.addEventListener('mousemove', function(e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = 'translate(' + (mx - 4) + 'px,' + (my - 4) + 'px)';
      });
      (function animRing() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.transform = 'translate(' + (rx - 18) + 'px,' + (ry - 18) + 'px)';
        requestAnimationFrame(animRing);
      })();
      document.querySelectorAll('a, button').forEach(function(el) {
        el.addEventListener('mouseenter', function() { ring.classList.add('cursor-hover'); });
        el.addEventListener('mouseleave', function() { ring.classList.remove('cursor-hover'); });
      });
    }

  });
})();
