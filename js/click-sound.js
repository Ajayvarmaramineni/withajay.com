/* click-sound.js — Global click sound handler using Web Audio API
   Plays a subtle, professional click sound on all interactive elements.
   Respects prefers-reduced-motion for users who opt out.
*/
(function () {
  'use strict';

  // Respect user preference for reduced motion / no sounds
  var mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery && mediaQuery.matches) return;

  var AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  var ctx = null;

  function getContext() {
    if (!ctx) {
      ctx = new AudioContext();
    }
    return ctx;
  }

  function playClick() {
    try {
      var ac = getContext();
      if (ac.state === 'suspended') {
        ac.resume();
      }

      var oscillator = ac.createOscillator();
      var gainNode = ac.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ac.destination);

      // Short tick-like click: high frequency, very brief
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, ac.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0, ac.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.35, ac.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);

      oscillator.start(ac.currentTime);
      oscillator.stop(ac.currentTime + 0.15);
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
