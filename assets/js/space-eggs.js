// Easter eggs hidden in the background (see DESIGN.md §6 "이스터에그").
//
//  1. Stowaway — catch the flying ship (click, or the Konami code
//     ↑↑↓↓←→←→BA) and warp to the hidden sector.
//  2. Meteor shower — poke the planet (click/tap, or type "wish") and a
//     shower of pixel meteors rains down; each one counts as a wish
//     (localStorage), shown as an achievement in the hidden sector.
//  3. Peeking alien (Study page only, `[data-alien]`) — a little alien
//     peeks up from the bottom edge now and then; click/tap it before it
//     ducks (or type "alien") to make contact. Counted like wishes. Poke it
//     10 times and it gets angry, shakes the screen and sulks for the tab.
//
// The background is fixed at z-index -1 with pointer-events: none, so it
// never blocks the page. Clicks are hit-tested against the targets'
// on-screen boxes instead, and only count over empty space (not on a link,
// card, box, header…).
(function () {
  var bg = document.querySelector('.space-bg');
  if (!bg) return;
  // The hidden sector is the reward itself: every egg stays off there.
  var warpTo = bg.getAttribute('data-egg');
  if (warpTo && location.pathname.replace(/index\.html$/, '') === warpTo) return;

  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var BLOCKERS = 'a, button, input, textarea, select, label, summary, iframe, pre, kbd, ' +
                 '[role="button"], .post-card, .sector, .pixel-box, .post__sheet, .site-header, .site-footer, .alien';
  var WISH_KEY = 'serim.wishes';
  var ALIEN_KEY = 'serim.aliens';
  var alien = document.querySelector('[data-alien]');

  // ---- Targets -------------------------------------------------------------
  var ship = bg.querySelector('.space-bg__ship');
  var planet = bg.querySelector('.space-bg__planet');

  var eggs = [];
  if (ship && warpTo) eggs.push({ name: 'ship', el: ship, slack: 6, run: warp });
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
  if (ship && warpTo) {
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
    announce('유성우가 떨어집니다. 소원이 하나 늘었습니다.' + (wishes ? ' 지금까지 ' + wishes + '개입니다.' : ''));
    setTimeout(function () { showering = false; }, Math.max(longest, 1600));
  }

  // ==========================================================================
  // 3. Peeking alien (Study page)
  // ==========================================================================
  // States: hidden → up (peeking, pokeable) → hidden; up → angry → hidden.
  // Every click while it's up is a poke: it startles and stays a bit
  // longer, so you can keep poking. The first poke of each peek counts as a
  // contact. Its mood worsens with the pokes of this page visit, and at
  // ANGRY_AT it blows up, shakes the screen and sulks: it won't show up
  // again in this tab (sessionStorage).
  var alienState = 'hidden';
  var alienTimer = 0;
  var PEEK_MS = 2600;                    // how long it stays up
  var POKE_MS = 1400;                    // extra stay after each poke
  var DUCK_MS = 480;                     // CSS slide time (+ a frame)
  var ANGRY_AT = 10;
  var ANGRY_KEY = 'serim.aliens.angry';  // times it was made angry
  var SULK_KEY = 'serim.alien.sulk';     // sessionStorage: sulking in this tab
  var pokes = 0;                         // pokes during this page visit
  var contacted = false;                 // already counted for this peek
  // mood by poke count → shown by CSS ([data-mood]) and the bubble text
  var MOODS = [
    { at: 1, mood: 'startled', alert: '!' },
    { at: 5, mood: 'annoyed',  alert: '?!' },
    { at: 8, mood: 'furious',  alert: '!!' },
    { at: ANGRY_AT, mood: 'angry', alert: '#@!' }
  ];
  var alertEl = alien && alien.querySelector('.alien__alert');

  function later(min, max) { return min + Math.round(Math.random() * (max - min)); }
  function schedulePeek(ms) { clearTimeout(alienTimer); alienTimer = setTimeout(peek, ms); }
  function sulking() { try { return sessionStorage.getItem(SULK_KEY) === '1'; } catch (e) { return false; } }

  function setMood() {
    var m = null;
    MOODS.forEach(function (s) { if (pokes >= s.at) m = s; });
    if (!m) { alien.removeAttribute('data-mood'); return; }
    alien.setAttribute('data-mood', m.mood);
    if (alertEl) alertEl.textContent = m.alert;
  }

  function peek() {
    if (alienState !== 'hidden' || sulking()) return;
    if (document.hidden) { schedulePeek(3000); return; } // wait for the tab
    // somewhere along the content column, on the 4px grid
    var col = document.querySelector('.site-main .container');
    var cr = col ? col.getBoundingClientRect() : { left: 0, right: innerWidth };
    var w = alien.offsetWidth || 96;
    alien.style.left = snap(cr.left + Math.random() * Math.max(cr.right - cr.left - w, 0)) + 'px';
    alien.hidden = false;
    alienState = 'up';
    contacted = false;
    setMood(); // still grumpy from earlier pokes
    // two frames: let it render below the edge first so the slide-up runs
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { alien.classList.add('is-up'); });
    });
    alienTimer = setTimeout(function () { duck(later(10000, 18000)); }, PEEK_MS);
  }

  // Slide back down; `next` = ms until the next peek (null: never).
  function duck(next) {
    clearTimeout(alienTimer);
    alien.classList.remove('is-up', 'is-caught');
    setTimeout(function () {
      alien.hidden = true;
      alienState = 'hidden';
      if (next != null) schedulePeek(next);
    }, DUCK_MS);
  }

  function poke() {
    if (alienState !== 'up') return;
    clearTimeout(alienTimer);
    pokes++;
    setMood();
    // restart the startle jump on every poke
    alien.classList.remove('is-caught');
    void alien.offsetWidth;
    alien.classList.add('is-caught');

    if (!contacted) {
      contacted = true;
      var n = bump(ALIEN_KEY);
      popOverAlien('alien', '+1 CONTACT', n ? 'ALIEN × ' + n : '');
      announce('외계인과 접촉했습니다.' + (n ? ' 지금까지 ' + n + '번째 접촉입니다.' : ''));
    }
    if (pokes >= ANGRY_AT) { getAngry(); return; }
    alienTimer = setTimeout(function () { duck(later(10000, 18000)); }, POKE_MS);
  }

  function getAngry() {
    alienState = 'angry';
    bump(ANGRY_KEY);
    try { sessionStorage.setItem(SULK_KEY, '1'); } catch (e) {}
    popOverAlien('angry', 'ANGRY!!', "DON'T POKE ME");
    announce('외계인이 화가 났습니다! 한동안 나타나지 않을 것입니다.');
    // it stomps: the whole page shakes for a moment
    var main = document.querySelector('.site-main');
    if (main && main.animate && !reduce.matches) {
      main.animate(
        [{ translate: '0 0' }, { translate: '-8px 0' }, { translate: '8px 4px' },
         { translate: '-8px -4px' }, { translate: '8px 0' }, { translate: '0 0' }],
        { duration: 480, easing: 'steps(6, end)' }
      );
    }
    // fumes for a bit, then storms off for good (this tab)
    setTimeout(function () { duck(null); }, 1800);
  }

  function popOverAlien(kind, score, total) {
    var r = alien.getBoundingClientRect();
    scorePop({ kind: kind, x: r.left + r.width / 2, y: r.top - 40, score: score, total: total }); // above the bubble
  }

  // Keyboard path ("alien"): call it up now and poke it once.
  function summonAlien() {
    if (sulking()) {
      scorePop({ kind: 'angry', x: innerWidth / 2, y: innerHeight - 120, score: '...', total: 'STILL ANGRY' });
      announce('외계인은 아직 화가 나 있습니다.');
      return;
    }
    if (alienState === 'hidden') { clearTimeout(alienTimer); peek(); }
    setTimeout(poke, 700);
  }

  if (alien) {
    alien.addEventListener('click', poke);
    if (!sulking()) schedulePeek(later(5000, 8000));
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
