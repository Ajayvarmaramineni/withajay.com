/* portfolio.js — Ajay Ramineni Portfolio */
(function () {

  /* ── PAGE REVEAL ── */
  window.addEventListener('load', function () {
    document.body.style.opacity = '1';
  });

  /* ── TYPED ROLES ── */
  var roles   = ['Business Analyst', 'Data Analyst', 'Photographer', 'Strategist'];
  var rIdx    = 0, cIdx = 0, del = false;
  var roleEl  = document.getElementById('typed-role');

  function type() {
    if (!roleEl) return;
    var word = roles[rIdx];
    if (!del) {
      roleEl.textContent = word.substring(0, ++cIdx);
      if (cIdx === word.length) setTimeout(function () { del = true; }, 1600);
    } else {
      roleEl.textContent = word.substring(0, --cIdx);
      if (cIdx === 0) { del = false; rIdx = (rIdx + 1) % roles.length; }
    }
    setTimeout(type, del ? 38 : 82);
  }
  type();

  /* ── SCROLL REVEAL ── */
  var reveals  = document.querySelectorAll('.reveal');
  var revObs   = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('revealed'); revObs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  reveals.forEach(function (el) { revObs.observe(el); });

  /* ── ACTIVE SIDEBAR NAV ── */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.sidebar-nav a');

  function setActive() {
    var y = window.scrollY + 140;
    var cur = '';
    sections.forEach(function (s) { if (s.offsetTop <= y) cur = s.id; });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* ── CONTACT FORM ── */
  var form    = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn  = form.querySelector('.form-submit');
      var name = form.name.value.trim();
      var mail = form.email.value.trim();
      var subj = form.subject.value.trim();
      var msg  = form.message.value.trim();
      var re   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (name.length < 2)   { status('Please enter your name.', true); return; }
      if (!re.test(mail))     { status('Please enter a valid email.', true); return; }
      if (subj.length < 3)   { status('Please enter a subject.', true); return; }
      if (msg.length < 10)   { status('Message is too short.', true); return; }

      btn.disabled = true;
      btn.textContent = 'Sending…';
      status('', false);

      /* Replace YOUR_FORM_ID at formspree.io (free) */
      fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: mail, subject: subj, message: msg })
      })
      .then(function (r) {
        if (r.ok) { status('Message sent — I\'ll get back to you soon.', false); form.reset(); }
        else       { status('Something went wrong. Email me at aramineni@wpi.edu', true); }
      })
      .catch(function () { status('Network error. Please try again.', true); })
      .finally(function () { btn.disabled = false; btn.textContent = 'Send Message'; });
    });
  }

  function status(msg, err) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className   = 'form-status' + (err ? ' error' : '');
  }

})();
