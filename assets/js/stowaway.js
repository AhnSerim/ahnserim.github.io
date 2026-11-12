// Easter egg (see DESIGN.md §8 "이스터에그"): catch the background ship and
// warp to the hidden sector.
//
// The ship lives in the fixed background (z-index -1, pointer-events none),
// so it never blocks the page. Instead, a click anywhere is hit-tested
// against the ship's on-screen box: if it lands on the ship over empty
// space (not on a link, card, box, header…), the egg fires.
// Keyboard players can enter the Konami code (↑↑↓↓←→←→BA) instead.
(function () {
  var bg = document.querySelector('.space-bg');
  var ship = bg && bg.querySelector('.space-bg__ship');
  var target = bg && bg.getAttribute('data-egg');
  if (!ship || !target) return;
  if (location.pathname === target) return; // already there

  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // Anything that is (or sits on) real UI keeps its normal behavior.
  var BLOCKERS = 'a, button, input, textarea, select, label, summary, iframe, pre, ' +
                 '[role="button"], .post-card, .sector, .pixel-box, .site-header, .site-footer';

  function onShip(x, y, el) {
    if (el && el.closest && el.closest(BLOCKERS)) return false;
    var r = ship.getBoundingClientRect();
    // a few px of slack so a moving target is fair game
    return r.width > 0 && x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6;
  }

  // ---- Hover: pause the ship + pointer cursor (one check per frame) -----
  var hovering = false, lastX = -1, lastY = -1, lastEl = null, queued = false;
  function setHover(on) {
    if (on === hovering) return;
    hovering = on;
    root.classList.toggle('egg-hover', on);
  }
  function checkHover() {
    queued = false;
    setHover(onShip(lastX, lastY, lastEl));
  }
  document.addEventListener('mousemove', function (e) {
    lastX = e.clientX; lastY = e.clientY; lastEl = e.target;
    if (!queued) { queued = true; requestAnimationFrame(checkHover); }
  }, { passive: true });
  document.addEventListener('mouseleave', function () { setHover(false); });

  // ---- Click: warp -------------------------------------------------------
  var warping = false;
  function warp() {
    if (warping) return;
    warping = true;
    setHover(false);
    if (reduce.matches || !ship.animate) { location.href = target; return; }

    // Freeze the ship where it is, then blast it off to the right.
    var from = getComputedStyle(ship).transform;
    if (!from || from === 'none') from = 'translate(0, 0)';
    ship.style.animation = 'none';
    ship.style.transform = from;
    ship.animate(
      [{ transform: from }, { transform: from + ' translateX(-12px)', offset: .3 }, { transform: from + ' translateX(110vw)' }],
      { duration: 520, easing: 'steps(6, end)', fill: 'forwards' }
    );

    var flash = document.createElement('div');
    flash.className = 'warp-flash';
    flash.setAttribute('aria-hidden', 'true');
    flash.innerHTML = '<span class="warp-flash__text">WARP ▶▶</span>';
    document.body.appendChild(flash);

    setTimeout(function () { location.href = target; }, 620);
  }

  document.addEventListener('click', function (e) {
    if (e.button !== 0 || e.defaultPrevented) return;
    var sel = window.getSelection && window.getSelection();
    if (sel && !sel.isCollapsed) return; // user was selecting text
    if (onShip(e.clientX, e.clientY, e.target)) warp();
  });

  // ---- Konami code -------------------------------------------------------
  var CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var pos = 0;
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var key = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === CODE[pos] ? pos + 1 : (key === CODE[0] ? 1 : 0);
    if (pos === CODE.length) { pos = 0; warp(); }
  });

  // Back/forward cache: reset if the user comes back from the hidden sector.
  addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    warping = false;
    // cancel the warp first (only scripted animations exist while warping),
    // then hand the ship back to its CSS fly loop
    ship.getAnimations && ship.getAnimations().forEach(function (a) { a.cancel(); });
    ship.style.animation = '';
    ship.style.transform = '';
    var f = document.querySelector('.warp-flash');
    if (f) f.remove();
  });
})();
