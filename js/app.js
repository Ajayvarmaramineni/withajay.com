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

    // Click passthrough: center-text circle sits over both panels.
    // When the user clicks inside the circle, route the click to the
    // underlying panel so navigation still works.
    var centerText = document.getElementById('centerText');
    if (centerText) {
      centerText.addEventListener('click', function (e) {
        e.stopPropagation();
        centerText.style.visibility = 'hidden';
        var el = document.elementFromPoint(e.clientX, e.clientY);
        centerText.style.visibility = '';
        if (el && el !== centerText && !centerText.contains(el)) {
          el.click();
        }
      });
    }
  });
})();
