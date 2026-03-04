/* navigation.js — Hamburger toggles nav, morphs to X */
(function () {
  var hamburger = document.getElementById('hamburger');
  var navOverlay = document.getElementById('navOverlay');

  if (!hamburger || !navOverlay) return;

  function openNav() {
    navOverlay.classList.add('open');
    navOverlay.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    navOverlay.classList.remove('open');
    navOverlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (navOverlay.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  // Close button inside nav overlay
  var navClose = document.getElementById('navClose');
  if (navClose) navClose.addEventListener('click', closeNav);

  // Close on nav link click
  navOverlay.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navOverlay.classList.contains('open')) closeNav();
  });
})();
