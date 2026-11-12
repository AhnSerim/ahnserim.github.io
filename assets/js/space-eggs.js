// Easter eggs hidden in the background (see DESIGN.md §6 "이스터에그").
//
//  1. Stowaway — catch the flying ship (click, or the Konami code
//     ↑↑↓↓←→←→BA) and warp to the hidden sector.
//  2. Meteor shower — poke the planet (click/tap, or type "wish") and a
//     shower of pixel meteors rains down; each one counts as a wish
//     (localStorage), shown as an achievement in the hidden sector.
//  3. Peeking alien (Study page only, `[data-alien]`) — a little alien
//     peeks up from the bottom edge now and then; click/tap it before it
//     ducks (or type "alien") to make contact. Counted like wishes.
//
// The background is fixed at z-index -1 with pointer-events: none, so it
// never blocks the page. Clicks are hit-tested against the targets'
// on-screen boxes instead, and only count over empty space (not on a link,
// card, box, header…).
(function () {
  var bg = document.querySelector('.space-bg');
  if (!bg) return;

  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var BLOCKERS = 'a, button, input, textarea, select, label, summary, iframe, pre, kbd, ' +
                 '[role="button"], .post-card, .sector, .pixel-box, .site-header, .site-footer, .alien';
  var WISH_KEY = 'serim.wishes';
  var ALIEN_KEY = 'serim.aliens';
  var alien = document.querySelector('[data-alien]');

  // ---- Targets -------------------------------------------------------------
  var ship = bg.querySelector('.space-bg__ship');
  var planet = bg.querySelector('.space-bg__planet');
  var warpTo = bg.getAttribute('data-egg');

  var eggs = [];
  if (ship && warpTo && location.pathname !== warpTo) eggs.push({ name: 'ship', el: ship, slack: 6, run: warp });
  if (planet) eggs.push({ name: 'planet', el: planet, slack: 0, run: meteorShower });
  if (!eggs.length) return;

  function eggAt(x, y, el) {
    if (el && el.closest && el.closest(BLOCKERS)) return null;
    for (var i = 0; i < eggs.length; i++) {
      var r = eggs[i].el.getBoundingClientRect(), s = eggs[i].slack;
      // a few px of slack so a moving target is fair game
      if (r.width > 0 && x >= r.left - s && x <= r.right + s && y >= r.top - s && y <= r.bottom + s) return eggs[i];
    }
    return null;
  }

  function typing(e) {
    var t = e.target;
    return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  }

  // ---- Hover: highlight the target + pointer cursor (one check per frame)
  var hovered = null, lastX = -1, lastY = -1, lastEl = null, queued = false;
  function setHover(egg) {
    if (egg === hovered) return;
    hovered = egg;
    root.classList.toggle('egg-hover', !!egg);
    if (egg) root.setAttribute('data-egg-hover', egg.name);
    else root.removeAttribute('data-egg-hover');
  }
  document.addEventListener('mousemove', function (e) {
    lastX = e.clientX; lastY = e.clientY; lastEl = e.target;
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; setHover(eggAt(lastX, lastY, lastEl)); });
  }, { passive: true });
  document.addEventListener('mouseleave', function () { setHover(null); });

  document.addEventListener('click', function (e) {
    if (e.button !== 0 || e.defaultPrevented) return;
    var sel = window.getSelection && window.getSelection();
    if (sel && !sel.isCollapsed) return; // user was selecting text
    var egg = eggAt(e.clientX, e.clientY, e.target);
    if (egg) egg.run();
  });

  // ---- Keyboard codes ------------------------------------------------------
  function sequence(code, run) {
    var pos = 0;
    return function (key) {
      pos = key === code[pos] ? pos + 1 : (key === code[0] ? 1 : 0);
      if (pos === code.length) { pos = 0; run(); }
    };
  }
  var codes = [sequence(['w', 'i', 's', 'h'], meteorShower)];
  if (eggs[0].name === 'ship') {
    codes.push(sequence(['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft',
                         'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], warp));
  }
  if (alien) codes.push(sequence(['a', 'l', 'i', 'e', 'n'], summonAlien));
  document.addEventListener('keydown', function (e) {
    if (typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    var key = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
    codes.forEach(function (feed) { feed(key); });
  });

  // ==========================================================================
  // 1. Stowaway: warp to the hidden sector
  // ==========================================================================
  var warping = false;
  function warp() {
    if (warping) return;
    warping = true;
    setHover(null);
    if (reduce.matches || !ship.animate) { location.href = warpTo; return; }

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

    setTimeout(function () { location.href = warpTo; }, 620);
  }

  // Back/forward cache: reset if the user comes back from the hidden sector.
  addEventListener('pageshow', function (e) {
    if (!e.persisted || !ship) return;
    warping = false;
    // cancel the warp first (only scripted animations exist while warping),
    // then hand the ship back to its CSS fly loop
    ship.getAnimations && ship.getAnimations().forEach(function (a) { a.cancel(); });
    ship.style.animation = '';
    ship.style.transform = '';
    var f = document.querySelector('.warp-flash');
    if (f) f.remove();
  });

  // ==========================================================================
  // 2. Meteor shower: make a wish
  // ==========================================================================
  var METEOR_SVG =
    '<svg viewBox="0 0 8 8" width="32" height="32" shape-rendering="crispEdges">' +
    '<rect x="7" y="0" width="1" height="1" fill="#e8ebff" opacity=".15"/>' +
    '<rect x="6" y="1" width="1" height="1" fill="#e8ebff" opacity=".3"/>' +
    '<rect x="5" y="2" width="1" height="1" fill="#e8ebff" opacity=".5"/>' +
    '<rect x="4" y="3" width="1" height="1" fill="#e8ebff" opacity=".7"/>' +
    '<rect x="2" y="4" width="2" height="2" fill="#e8ebff"/>' +
    '<rect x="0" y="6" width="2" height="2" fill="#ffe066"/>' +
    '<rect x="1" y="5" width="1" height="1" fill="#ffe066"/>' +
    '<rect x="2" y="6" width="1" height="1" fill="#ffe066"/></svg>';
  var COUNT = 6;
  var showering = false;

  // +1 on a localStorage counter; 0 when storage is blocked.
  function bump(key) {
    try {
      var n = (parseInt(localStorage.getItem(key), 10) || 0) + 1;
      localStorage.setItem(key, n);
      return n;
    } catch (e) { return 0; }
  }

  function meteorShower() {
    if (showering) return;
    showering = true;
    setHover(null);
    var wishes = bump(WISH_KEY);
    var motion = !reduce.matches && !!document.body.animate;
    var longest = 0;

    if (motion) {
      // The planet wobbles as if something knocked loose from it.
      // (`translate` composes with the parallax `transform` on the planet.)
      planet && planet.animate(
        [{ translate: '0 0' }, { translate: '-4px 0' }, { translate: '4px 0' }, { translate: '0 0' }],
        { duration: 360, easing: 'steps(4, end)' }
      );

      var layer = document.createElement('div');
      layer.className = 'meteor-shower';
      bg.appendChild(layer);

      // Even spread: meteors start on an L along the top edge (from 20% of
      // the width) and down the right edge (to 60% of the height). For a
      // 45° fall, distance along that L == distance between the tracks, so
      // one meteor per equal slot (jittered within it) = evenly spaced
      // tracks. The slot order is shuffled so they don't sweep one way.
      var vw = innerWidth, vh = innerHeight;
      var top = vw * 0.8, side = vh * 0.6, slot = (top + side) / COUNT;
      var order = shuffle(range(COUNT));
      for (var i = 0; i < COUNT; i++) {
        var m = document.createElement('span');
        m.className = 'meteor';
        m.innerHTML = METEOR_SVG;
        var s = (order[i] + 0.5 + (Math.random() - 0.5) * 0.5) * slot;
        var x = snap(s < top ? vw * 0.2 + s : vw);
        var y = snap(s < top ? -32 : s - top - 32);
        var d = snap(vh * (0.5 + Math.random() * 0.2));
        var dur = 1000 + Math.round(Math.random() * 300);
        var delay = i * 240 + Math.round(Math.random() * 60);
        m.style.left = x + 'px';
        m.style.top = y + 'px';
        layer.appendChild(m);
        m.animate(
          // invisible until its delay is up (fill: both keeps frame 0)
          [{ transform: 'translate(0, 0)', opacity: 0 },
           { opacity: 1, offset: .05 },
           { transform: 'translate(' + -d * .8 + 'px,' + d * .8 + 'px)', opacity: 1, offset: .8 },
           { transform: 'translate(' + -d + 'px,' + d + 'px)', opacity: 0 }],
          { duration: dur, delay: delay, easing: 'steps(12, end)', fill: 'both' }
        );
        longest = Math.max(longest, delay + dur);
      }
      setTimeout(function () { layer.remove(); }, longest + 100);
    }

    var pr = planet ? planet.getBoundingClientRect() : null;
    scorePop({
      kind: 'wish',
      x: pr ? pr.left + pr.width / 2 : innerWidth / 2,
      y: pr ? pr.top + 8 : innerHeight / 2,
      score: '+1 WISH',
      total: wishes ? '★ × ' + wishes : ''
    });
    announce('유성우가 떨어져요. 소원 하나 추가' + (wishes ? ', 지금까지 ' + wishes + '개.' : '.'));
    setTimeout(function () { showering = false; }, Math.max(longest, 1600));
  }

  // ==========================================================================
  // 3. Peeking alien (Study page)
  // ==========================================================================
  // States: hidden → up (peeking, catchable) → hidden, or up → caught → hidden.
  var alienState = 'hidden';
  var alienTimer = 0;
  var PEEK_MS = 2600;                    // how long it stays up
  var DUCK_MS = 480;                     // CSS slide time (+ a frame)

  function later(min, max) { return min + Math.round(Math.random() * (max - min)); }
  function schedulePeek(ms) { clearTimeout(alienTimer); alienTimer = setTimeout(peek, ms); }

  function peek() {
    if (alienState !== 'hidden') return;
    if (document.hidden) { schedulePeek(3000); return; } // wait for the tab
    // somewhere along the content column, on the 4px grid
    var col = document.querySelector('.site-main .container');
    var cr = col ? col.getBoundingClientRect() : { left: 0, right: innerWidth };
    var w = alien.offsetWidth || 96;
    alien.style.left = snap(cr.left + Math.random() * Math.max(cr.right - cr.left - w, 0)) + 'px';
    alien.hidden = false;
    alienState = 'up';
    // two frames: let it render below the edge first so the slide-up runs
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { alien.classList.add('is-up'); });
    });
    alienTimer = setTimeout(function () { duck(later(10000, 18000)); }, PEEK_MS);
  }

  function duck(next) {
    clearTimeout(alienTimer);
    alien.classList.remove('is-up', 'is-caught');
    setTimeout(function () {
      alien.hidden = true;
      alienState = 'hidden';
      schedulePeek(next);
    }, DUCK_MS);
  }

  function catchAlien() {
    if (alienState !== 'up') return;
    alienState = 'caught';
    clearTimeout(alienTimer);
    alien.classList.add('is-caught');
    var n = bump(ALIEN_KEY);
    var r = alien.getBoundingClientRect();
    scorePop({
      kind: 'alien',
      x: r.left + r.width / 2,
      y: r.top - 40,   // above the "!"
      score: '+1 CONTACT',
      total: n ? 'ALIEN × ' + n : ''
    });
    announce('외계인과 접촉했어요' + (n ? '. 지금까지 ' + n + '번째 접촉.' : '.'));
    // startled for a moment, then dives back down; returns much later
    setTimeout(function () { duck(later(20000, 30000)); }, 900);
  }

  // Keyboard path ("alien"): call it up now and make contact.
  function summonAlien() {
    if (alienState === 'caught') return;
    if (alienState === 'hidden') { clearTimeout(alienTimer); peek(); }
    setTimeout(catchAlien, 700);
  }

  if (alien) {
    alien.addEventListener('click', catchAlien);
    schedulePeek(later(5000, 8000));
  }

  // ==========================================================================
  // Shared helpers
  // ==========================================================================
  function snap(v) { return Math.round(v / 4) * 4; } // stay on the 4px grid
  function range(n) { for (var a = [], i = 0; i < n; i++) a.push(i); return a; }
  function shuffle(a) { // Fisher–Yates
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Arcade score popup ("+1 WISH" / "+1 CONTACT") that hops up from (x, y)
  // and fades out. Kept inside the viewport, below the sticky header.
  function scorePop(o) {
    var pop = document.createElement('div');
    pop.className = 'score-pop score-pop--' + o.kind;
    pop.setAttribute('aria-hidden', 'true');
    pop.innerHTML = '<span class="score-pop__score">' + o.score + '</span>' +
                    (o.total ? '<span class="score-pop__total">' + o.total + '</span>' : '');
    var header = document.querySelector('.site-header');
    var minTop = (header ? header.getBoundingClientRect().bottom : 0) + 16;
    pop.style.left = snap(Math.min(Math.max(o.x, 96), innerWidth - 96)) + 'px';
    pop.style.top = snap(Math.min(Math.max(o.y, minTop), innerHeight - 96)) + 'px';
    document.body.appendChild(pop);
    setTimeout(function () { pop.remove(); }, 1700);
  }

  // Screen readers get the same news through a hidden polite live region.
  var live = null;
  function announce(text) {
    if (!live) {
      live = document.createElement('p');
      live.className = 'visually-hidden';
      live.setAttribute('role', 'status');
      document.body.appendChild(live);
    }
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 50);
  }
})();
