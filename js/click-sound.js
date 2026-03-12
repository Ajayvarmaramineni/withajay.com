/* click-sound.js — Global click sound with ON/OFF toggle.
   Uses Web Audio API so sound plays to completion even during navigation.
   Toggle state persists across pages via localStorage.
*/
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.AudioContext && !window.webkitAudioContext) return;

  var ctx    = new (window.AudioContext || window.webkitAudioContext)();
  var buffer = null;
  var muted  = localStorage.getItem('soundMuted') === 'true';
  var NAV_DELAY = 150; // ms

  // Decode the sound file into memory
  fetch('sounds/click_left.mp3')
    .then(function (r) { return r.arrayBuffer(); })
    .then(function (ab) { return ctx.decodeAudioData(ab); })
    .then(function (decoded) { buffer = decoded; })
    .catch(function () {});

  function playClick() {
    if (muted || !buffer) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      var src  = ctx.createBufferSource();
      src.buffer = buffer;
      var gain = ctx.createGain();
      gain.gain.value = 0.5;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start(0);
    } catch (e) {}
  }

  // ── Toggle button ──────────────────────────────────────────────────────────

  var waveIcon = '<span class="wave-icon" aria-hidden="true">' +
    '<span class="wave-bar"></span>' +
    '<span class="wave-bar"></span>' +
    '<span class="wave-bar"></span>' +
    '</span>';

  var muteIcon = '<svg class="mute-icon" aria-hidden="true" width="18" height="12" viewBox="0 0 18 12" fill="none">' +
    '<line x1="1" y1="6" x2="17" y2="6" stroke="rgba(255,255,255,0.75)" stroke-width="1.5" stroke-linecap="round"/>' +
    '</svg>';

  var btn = document.createElement('button');
  btn.id = 'sound-toggle';
  btn.setAttribute('aria-label', 'Toggle click sound');
  btn.setAttribute('aria-pressed', muted ? 'false' : 'true');

  function renderBtn() {
    btn.innerHTML =
      '<span style="letter-spacing:0.12em">' + (muted ? 'OFF' : 'ON') + '</span>' +
      waveIcon +
      muteIcon;
    btn.classList.toggle('muted', muted);
    btn.setAttribute('aria-pressed', muted ? 'false' : 'true');
  }

  renderBtn();

  // Append once DOM is ready
  if (document.body) {
    document.body.appendChild(btn);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(btn);
    });
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation(); // don't let this click trigger a sound or nav delay
    muted = !muted;
    localStorage.setItem('soundMuted', muted);
    renderBtn();
  });

  // ── Global click handler ───────────────────────────────────────────────────

  document.addEventListener('click', function (e) {
    // Ignore clicks on the toggle button itself
    if (e.target === btn || btn.contains(e.target)) return;

    playClick();

    // Delay internal navigation so the sound finishes
    var el = e.target;
    while (el && el !== document.body) {
      if (el.tagName === 'A' && el.href) {
        var opensNewTab = el.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey;
        var isHashOnly  = el.hash && el.pathname === location.pathname;
        var isSameUrl   = el.href === location.href;

        if (!opensNewTab && !isHashOnly && !isSameUrl && !e.defaultPrevented) {
          var dest = el.href;
          e.preventDefault();
          setTimeout(function () { location.href = dest; }, NAV_DELAY);
        }
        break;
      }
      el = el.parentElement;
    }
  }, { passive: false });

})();
