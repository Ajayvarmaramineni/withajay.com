// Hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.main-nav');

if (hamburger && nav) {
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    nav.classList.toggle('open');
  });

  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('open');
    });
  });
}

// Header shrink on scroll
window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  if (header) {
    if (window.scrollY > 40) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
  }
});

// Scroll reveal animation for all sections
function revealOnScroll() {
  const revealElements = document.querySelectorAll('.reveal');
  const revealPoint = 150;
  const windowHeight = window.innerHeight;
  
  revealElements.forEach(element => {
    const elementPosition = element.getBoundingClientRect().top;
    if (elementPosition < windowHeight - revealPoint) {
      element.classList.add('visible');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('load', revealOnScroll);
  revealOnScroll();
});

// Fade in after fonts load
document.addEventListener('DOMContentLoaded', function() {
  let pageShown = false;
  function showPage() {
    if (!pageShown) {
      pageShown = true;
      document.body.style.opacity = '1';
    }
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(showPage);
  }
  setTimeout(showPage, 1000);
});