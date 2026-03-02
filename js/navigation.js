/* navigation.js — Hamburger menu toggle */
(function () {
  const hamburger = document.getElementById('hamburger');
  const navOverlay = document.getElementById('navOverlay');
  const navClose = document.getElementById('navClose');

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

  hamburger.addEventListener('click', openNav);

  if (navClose) navClose.addEventListener('click', closeNav);

  // Close on nav link click
  navOverlay.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Close on click outside (on the overlay background itself)
  navOverlay.addEventListener('click', function (e) {
    if (e.target === navOverlay) closeNav();
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navOverlay.classList.contains('open')) closeNav();
  });
})();
