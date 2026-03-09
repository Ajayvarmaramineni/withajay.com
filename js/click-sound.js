/* click-sound.js — Global click sound handler using an audio file
   Plays sounds/click_left.mp3 on all interactive elements.
   Respects prefers-reduced-motion for users who opt out.
*/
(function () {
  'use strict';

  // Respect user preference for reduced motion / no sounds
  var mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery && mediaQuery.matches) return;

  // Preload the audio file
  var clickAudio = new Audio('../sounds/click_left.mp3');
  clickAudio.preload = 'auto';
  clickAudio.volume = 0.5;

  function playClick() {
    try {
      clickAudio.currentTime = 0;
      clickAudio.play().catch(function () {
        // Silently fail — audio is non-critical
      });
    } catch (e) {
      // Silently fail — audio is non-critical
    }
  }

  // Selectors for interactive elements
  var interactiveSelector = 'a, button, .hamburger, input[type="submit"], input[type="button"], [role="button"]';

  document.addEventListener('click', function (e) {
    var target = e.target;
    // Walk up the DOM to find an interactive ancestor
    while (target && target !== document) {
      if (target.matches && target.matches(interactiveSelector)) {
        playClick();
        return;
      }
      target = target.parentNode;
    }
  }, { passive: true });
})();