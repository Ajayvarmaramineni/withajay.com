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

      var now = ac.currentTime;

      // Noise burst — the shutter "click" texture
      var bufferSize = Math.floor(ac.sampleRate * 0.07);
      var buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      var noise = ac.createBufferSource();
      noise.buffer = buffer;

      var bandpass = ac.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 4000;
      bandpass.Q.value = 0.8;

      var noiseGain = ac.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ac.destination);
      noise.start(now);
      noise.stop(now + 0.07);

      // Low-frequency thunk — mechanical body of the shutter
      var osc = ac.createOscillator();
      var oscGain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.05);
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(oscGain);
      oscGain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.1);
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
