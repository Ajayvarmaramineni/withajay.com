/* portfolio.js — Ajay Ramineni Portfolio */
(function () {

  /* ── EMAILJS INIT (one-time) ── */
  try { emailjs.init('nHMmaEeDsQ6yN-2Kx'); } catch (e) {}

  /* ── PAGE REVEAL ── */
  setTimeout(function () { document.body.style.opacity = '1'; }, 400);

  /* ── SCROLL PROGRESS BAR ── */
  var progressBar = document.createElement('div');
  progressBar.id  = 'scroll-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', function () {
    var total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
  }, { passive: true });

  /* ── CUSTOM CURSOR ── */
  var dot  = document.createElement('div'); dot.id  = 'cursor-dot';
  var ring = document.createElement('div'); ring.id = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  var mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate(' + (mx - 4) + 'px,' + (my - 4) + 'px)';
  });
  (function animRing() {
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.transform = 'translate(' + (rx - 18) + 'px,' + (ry - 18) + 'px)';
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('a, button, .project-card, .skill-card, .cert-item, .exp-card').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('cursor-hover'); });
  });

  /* ── TYPED ROLES ── */
  var roles  = ['Business Analyst', 'Data Analyst', 'Photographer', 'Strategist'];
  var rIdx   = 0, cIdx = 0, del = false;
  var roleEl = document.getElementById('typed-role');
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
  var revObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('revealed'); revObs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(function (el) { revObs.observe(el); });

  /* ── STAGGER CHILDREN in grids/lists ── */
  var staggerObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      Array.prototype.forEach.call(e.target.children, function (child, i) {
        child.style.opacity   = '0';
        child.style.transform = 'translateY(18px)';
        child.style.transition = 'opacity 0.5s ease ' + (i * 0.09) + 's, transform 0.5s ease ' + (i * 0.09) + 's';
        setTimeout(function () { child.style.opacity = '1'; child.style.transform = 'translateY(0)'; }, 60);
      });
      staggerObs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.projects-grid, .skills-grid, .cert-list, .contact-info-col').forEach(function (el) {
    staggerObs.observe(el);
  });

  /* ── ACTIVE SIDEBAR NAV ── */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.sidebar-nav a');
  function setActive() {
    var y = window.scrollY + 160, cur = '';
    sections.forEach(function (s) { if (s.offsetTop <= y) cur = s.id; });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* ── CONTACT FORM ── */
  var form     = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn  = form.querySelector('.form-submit');
      var name = document.getElementById('cf-name').value.trim();
      var mail = document.getElementById('cf-email').value.trim();
      var subj = document.getElementById('cf-subject').value.trim();
      var msg  = document.getElementById('cf-message').value.trim();
      var re   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (name.length < 2) { setStatus('Please enter your name.', true); return; }
      if (!re.test(mail))   { setStatus('Please enter a valid email.', true); return; }
      if (subj.length < 3) { setStatus('Please enter a subject.', true); return; }
      if (msg.length < 10) { setStatus('Message is too short.', true); return; }

      btn.disabled = true; btn.textContent = 'Sending…'; setStatus('', false);

      emailjs.sendForm('service_0cgjbdf', 'template_8stcqsc', form)
        .then(function () {
          setStatus('Message sent — I\'ll be in touch soon.', false);
          form.reset();
          btn.disabled = false; btn.textContent = 'Send Message';
        })
        .catch(function () {
          setStatus('Something went wrong. Please email aramineni@wpi.edu', true);
          btn.disabled = false; btn.textContent = 'Send Message';
        });
    });
  }
  function setStatus(msg, err) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className   = 'form-status' + (err ? ' error' : '');
  }

})();
