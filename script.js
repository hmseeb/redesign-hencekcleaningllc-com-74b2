/* =============================================================
   HenceK Cleaning Service — interactions
   Vanilla JS. No dependencies, no external APIs.
   ============================================================= */
(function () {
  'use strict';

  /* ---------- current year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- sticky header state ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- active nav link on scroll ---------- */
  var sections = Array.prototype.slice.call(
    document.querySelectorAll('main section[id]')
  );
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav a[href^="#"]')
  );

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- quote form -> mailto ---------- */
  var form = document.getElementById('quoteForm');
  var status = document.getElementById('quoteStatus');
  var EMAIL = 'hencekcleaningllc@gmail.com';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setStatus(message, ok) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-ok', !!ok);
    status.classList.toggle('is-error', !ok);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.querySelector('#qName');
      var email = form.querySelector('#qEmail');
      var phone = form.querySelector('#qPhone');
      var service = form.querySelector('#qService');
      var message = form.querySelector('#qMessage');

      [name, email].forEach(function (el) { el.classList.remove('is-invalid'); });

      if (!name.value.trim()) {
        name.classList.add('is-invalid');
        name.focus();
        setStatus('Please enter your name so we know who to reply to.', false);
        return;
      }

      if (!EMAIL_RE.test(email.value.trim())) {
        email.classList.add('is-invalid');
        email.focus();
        setStatus('Please enter a valid email address.', false);
        return;
      }

      var subject = 'Cleaning quote request — ' + service.value;
      var bodyLines = [
        'Name: ' + name.value.trim(),
        'Email: ' + email.value.trim(),
        'Phone: ' + (phone.value.trim() || 'Not provided'),
        'Service needed: ' + service.value,
        '',
        'Details:',
        message.value.trim() || 'No additional details provided.',
        '',
        '— Sent from hencekcleaningllc.com'
      ];

      var href =
        'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(bodyLines.join('\n'));

      window.location.href = href;
      setStatus('Opening your email app… If nothing happens, email us at ' + EMAIL + '.', true);
    });
  }

  /* ---------- smooth in-page scrolling with header offset ---------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;

    var hash = link.getAttribute('href');
    if (!hash || hash === '#' || hash.length < 2) return;

    var target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    var headerHeight = header ? header.offsetHeight : 0;
    var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top: Math.max(top, 0), behavior: reduce ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', hash);
  });
})();
