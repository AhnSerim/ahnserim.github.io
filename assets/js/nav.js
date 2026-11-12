// Mobile hamburger menu. Progressive enhancement: without JS the nav is
// always visible (see _layout.scss), so this only adds the toggle.
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  var label = btn.querySelector('.visually-hidden');
  var mq = window.matchMedia('(max-width: 767px)');
  btn.hidden = false;
  document.documentElement.classList.add('nav-ready');

  function setOpen(open) {
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (label) label.textContent = open ? '메뉴 닫기' : '메뉴 열기';
  }

  btn.addEventListener('click', function () {
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      btn.focus();
    }
  });

  // Close when clicking outside the header.
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.site-header')) setOpen(false);
  });

  // Reset when resizing back above mobile.
  mq.addEventListener('change', function (e) { if (!e.matches) setOpen(false); });
})();
