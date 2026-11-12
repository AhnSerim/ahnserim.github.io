// Mobile "stage select" menu. Progressive enhancement: without JS the nav is
// always visible (see _layout.scss), so this only adds the hamburger toggle.
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  var label = btn.querySelector('.visually-hidden');
  var mq = window.matchMedia('(max-width: 767px)');
  btn.hidden = false;
  document.documentElement.classList.add('nav-ready');

  function isOpen() { return btn.getAttribute('aria-expanded') === 'true'; }

  function setOpen(open, opts) {
    if (open === isOpen()) return;
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (label) label.textContent = open ? '메뉴 닫기' : '메뉴 열기';
    if (opts && opts.returnFocus) btn.focus();
  }

  btn.addEventListener('click', function () { setOpen(!isOpen()); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) setOpen(false, { returnFocus: true });
  });

  // Close when clicking outside the header, or after picking a menu item
  // (matters for same-page links, where no navigation happens).
  document.addEventListener('click', function (e) {
    if (!isOpen()) return;
    if (!e.target.closest('.site-header') || e.target.closest('.site-nav__link')) setOpen(false);
  });

  // Close when keyboard focus leaves the menu (Tab past the last item).
  nav.addEventListener('focusout', function (e) {
    if (isOpen() && mq.matches && e.relatedTarget && !e.relatedTarget.closest('.site-header')) setOpen(false);
  });

  // Reset when resizing back above mobile.
  function onChange(e) { if (!e.matches) setOpen(false); }
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange); // Safari < 14
})();
