// Easter eggs hidden in the background (see DESIGN.md §6 "이스터에그").
//
//  1. Stowaway — catch the flying ship (click, or the Konami code
//     ↑↑↓↓←→←→BA) and warp to the hidden sector.
//  2. Meteor shower — poke the planet (click/tap, or type "wish") and a
//     shower of pixel meteors rains down; each one counts as a wish
//     (localStorage), shown as an achievement in the hidden sector.
//     Click/tap a falling meteor to catch it: it bursts into sparks and
//     stays pinned in the sky as a new star (kept across visits). Catch all
//     six of one shower for a PERFECT bonus.
//     On the nights around a real meteor shower's peak (Perseids, Geminids…)
//     a HUD tag names it and stray meteors fall by themselves now and then;
//     catching one logs that shower in the observation log.
//  3. Peeking alien (Study page only, `[data-alien]`) — a little alien
//     peeks up from the bottom edge now and then; click/tap it before it
//     ducks (or type "alien") to make contact. Counted like wishes. Poke it
//     10 times and it gets angry, shakes the screen and sulks for the tab.
//  4. Bookworm (Reading page only, `[data-worm]`) — a pink bookworm in
//     glasses pokes out of the top edge of a book card and inches along.
//     Click/tap it (or type "book") to feed it a page: it grows a segment.
//     Feed it 5 times and it turns into a butterfly and flies away.
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
                 '[role="button"], .post-card, .sector, .pixel-box, .post__sheet, .site-header, .site-footer, .alien, .worm';
  var WISH_KEY = 'serim.wishes';
  var ALIEN_KEY = 'serim.aliens';
  var CATCH_KEY = 'serim.meteors';          // meteors caught
  var PERFECT_KEY = 'serim.meteors.perfect'; // showers fully caught
  var SKY_KEY = 'serim.sky';                // pinned stars [[fx, fy], …]
  var SKY_MAX = 12;
  var SHOWERS_KEY = 'serim.showers';         // real showers logged (count)
  var SHOWERS_SEEN_KEY = 'serim.showers.seen'; // ["geminids-2026", …]
  var alien = document.querySelector('[data-alien]');
  var worm = document.querySelector('[data-worm]');

  // ---- Targets -------------------------------------------------------------
  var ship = bg.querySelector('.space-bg__ship');
  var planet = bg.querySelector('.space-bg__planet');

  var eggs = [];
  if (ship && warpTo) eggs.push({ name: 'ship', el: ship, slack: 6, run: warp });
  if (planet) eggs.push({ name: 'planet', el: planet, slack: 0, run: meteorShower });
  if (!eggs.length) return;

  function eggAt(x, y, el) {
    if (el && el.closest && el.closest(BLOCKERS)) return null;
    var m = meteorAt(x, y);
    if (m) return m;
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
    // meteorAt() hands out a fresh object per check: compare the element
    if (egg === hovered || (egg && hovered && egg.el === hovered.el)) return;
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
  if (worm) codes.push(sequence(['b', 'o', 'o', 'k'], summonWorm));
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
  var falling = [];     // catchable meteors of the current shower
  var caught = 0;       // caught in the current shower
  // fingers are blunter than a mouse pointer: a bit more slack on touch
  var CATCH_SLACK = matchMedia('(pointer: coarse)').matches ? 20 : 12;

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
      caught = 0;

      // Even spread: one meteor per equal slot of the start line (see
      // meteorStart), jittered within it. The slot order is shuffled so they
      // don't sweep one way.
      var slot = 1 / COUNT;
      var order = shuffle(range(COUNT));
      for (var i = 0; i < COUNT; i++) {
        var s = (order[i] + 0.5 + (Math.random() - 0.5) * 0.5) * slot;
        var delay = i * 240 + Math.round(Math.random() * 60);
        longest = Math.max(longest, dropMeteor(layer, s, delay, false));
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

  // Meteors start on an L along the top edge (from 20% of the width) and
  // down the right edge (to 60% of the height); `s` is 0–1 along it. For a
  // 45° fall, distance along that L == distance between the tracks, so equal
  // steps of `s` give evenly spaced tracks.
  function meteorStart(s) {
    var top = innerWidth * 0.8, d = s * (top + innerHeight * 0.6);
    return d < top ? [snap(innerWidth * 0.2 + d), -32] : [snap(innerWidth), snap(d - top - 32)];
  }

  // Drop one catchable meteor into `layer`; returns when it's done (ms).
  // `stray` = fell on its own during a real shower (not a WISH shower).
  function dropMeteor(layer, s, delay, stray) {
    var m = document.createElement('span');
    m.className = 'meteor';
    m.innerHTML = METEOR_SVG;
    if (stray) m.setAttribute('data-stray', '');
    var p = meteorStart(s);
    var d = snap(innerHeight * (0.5 + Math.random() * 0.2));
    var dur = 1000 + Math.round(Math.random() * 300);
    m.style.left = p[0] + 'px';
    m.style.top = p[1] + 'px';
    layer.appendChild(m);
    falling.push(m);
    m.animate(
      // invisible until its delay is up (fill: both keeps frame 0)
      [{ transform: 'translate(0, 0)', opacity: 0 },
       { opacity: 1, offset: .05 },
       { transform: 'translate(' + -d * .8 + 'px,' + d * .8 + 'px)', opacity: 1, offset: .8 },
       { transform: 'translate(' + -d + 'px,' + d + 'px)', opacity: 0 }],
      { duration: dur, delay: delay, easing: 'steps(12, end)', fill: 'both' }
    ).onfinish = function () { forget(m); m.remove(); };
    return delay + dur;
  }

  function forget(m) {
    var i = falling.indexOf(m);
    if (i >= 0) falling.splice(i, 1);
    return i >= 0;
  }

  // ---- Catching a meteor --------------------------------------------------
  // A meteor is fair game while it's visible (not waiting on its delay,
  // not fading out at the end of its fall).
  function meteorAt(x, y) {
    for (var i = 0; i < falling.length; i++) {
      var m = falling[i];
      if (parseFloat(getComputedStyle(m).opacity) < .5) continue;
      var r = m.getBoundingClientRect(), s = CATCH_SLACK;
      if (x >= r.left - s && x <= r.right + s && y >= r.top - s && y <= r.bottom + s) {
        return { name: 'meteor', el: m, run: catchMeteor.bind(null, m) };
      }
    }
    return null;
  }

  function catchMeteor(m) {
    if (!forget(m)) return;
    setHover(null);
    // freeze it mid-fall, flash, and burst
    m.getAnimations().forEach(function (a) { a.pause(); });
    m.classList.add('is-caught');
    var r = m.getBoundingClientRect();
    // the meteor's head is its bottom-left 2×2 block
    var x = snap(r.left + 4), y = snap(r.bottom - 4);
    burst(x, y);
    setTimeout(function () { m.remove(); }, 120);
    pinStar(x, y, true);

    var n = bump(CATCH_KEY);
    if (m.hasAttribute('data-stray')) { catchStray(x, y, n); return; }
    caught++;
    if (caught === COUNT) {
      var p = bump(PERFECT_KEY);
      scorePop({ kind: 'perfect', x: x, y: y - 40, score: 'PERFECT!!', total: 'ALL ' + COUNT + ' CAUGHT' });
      announce('유성 ' + COUNT + '개를 모두 잡았습니다. 퍼펙트입니다!' + (p ? ' 지금까지 ' + p + '번 성공했습니다.' : ''));
      return;
    }
    scorePop({ kind: 'catch', x: x, y: y - 40, score: '+1 CATCH', total: n ? '☆ × ' + n : '' });
    announce('유성을 잡았습니다. 하늘에 별이 하나 생겼습니다.' + (n ? ' 지금까지 ' + n + '개를 잡았습니다.' : ''));
  }

  // 8 pixel sparks flying out from (x, y).
  function burst(x, y) {
    var b = document.createElement('div');
    b.className = 'meteor-burst';
    b.style.left = x + 'px';
    b.style.top = y + 'px';
    for (var k = 0; k < 8; k++) {
      var a = k * Math.PI / 4, d = k % 2 ? 20 : 28;
      var s = document.createElement('i');
      s.style.setProperty('--dx', snap(Math.cos(a) * d) + 'px');
      s.style.setProperty('--dy', snap(Math.sin(a) * d) + 'px');
      b.appendChild(s);
    }
    bg.appendChild(b);
    setTimeout(function () { b.remove(); }, 500);
  }

  // ---- The sky: caught meteors stay on as stars ------------------------------
  var STAR_SVG =
    '<svg viewBox="0 0 5 5" width="20" height="20" shape-rendering="crispEdges">' +
    '<rect x="2" y="0" width="1" height="5" fill="#ffe066"/>' +
    '<rect x="0" y="2" width="5" height="1" fill="#ffe066"/>' +
    '<rect x="2" y="2" width="1" height="1" fill="#e8ebff"/></svg>';
  var sky = null;

  function readSky() {
    try {
      var a = JSON.parse(localStorage.getItem(SKY_KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }

  // Pin a star at (x, y) px; saved as viewport fractions so it survives
  // resizes. Only the newest SKY_MAX stars are kept.
  function pinStar(x, y, fresh) {
    if (!sky) {
      sky = document.createElement('div');
      sky.className = 'space-bg__caught';
      bg.appendChild(sky);
    }
    var st = document.createElement('span');
    st.className = 'caught-star' + (fresh ? ' is-new' : '');
    st.innerHTML = STAR_SVG;
    st.style.left = (x / innerWidth * 100).toFixed(2) + '%';
    st.style.top = (y / innerHeight * 100).toFixed(2) + '%';
    st.style.animationDelay = fresh ? '' : -Math.round(Math.random() * 4000) + 'ms';
    sky.appendChild(st);
    while (sky.children.length > SKY_MAX) sky.removeChild(sky.firstChild);
    if (!fresh) return;
    var saved = readSky();
    saved.push([+(x / innerWidth).toFixed(3), +(y / innerHeight).toFixed(3)]);
    try { localStorage.setItem(SKY_KEY, JSON.stringify(saved.slice(-SKY_MAX))); } catch (e) {}
  }

  readSky().forEach(function (p) {
    if (p && isFinite(p[0]) && isFinite(p[1])) pinStar(p[0] * innerWidth, p[1] * innerHeight, false);
  });

  // ---- Real meteor showers ---------------------------------------------------
  // On the nights around a real shower's peak (visitor's local date), a HUD
  // tag names it and stray meteors fall on their own every few seconds.
  // Catching one logs that shower (once per shower per year).
  // Preview any of them with ?shower=<id>, e.g. ?shower=geminids.
  var SHOWERS = [ // id, HUD name, peak month, peak day (typical dates)
    ['quadrantids', 'QUADRANTIDS', 1, 4],
    ['lyrids', 'LYRIDS', 4, 22],
    ['eta-aquariids', 'ETA AQUARIIDS', 5, 6],
    ['perseids', 'PERSEIDS', 8, 12],
    ['orionids', 'ORIONIDS', 10, 21],
    ['leonids', 'LEONIDS', 11, 17],
    ['geminids', 'GEMINIDS', 12, 14]
  ];
  var SHOWER_DAYS = 2;   // active from 2 days before to 2 days after the peak
  var DAY = 86400000;

  function activeShower() {
    var force = (location.search.match(/[?&]shower=([a-z-]+)/) || [])[1];
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (var i = 0; i < SHOWERS.length; i++) {
      var s = SHOWERS[i];
      if (force && force !== s[0]) continue;
      // check last/this/next year so early January sees late December, etc.
      for (var y = today.getFullYear() - 1; y <= today.getFullYear() + 1; y++) {
        var peak = new Date(y, s[2] - 1, s[3]);
        var diff = force ? 0 : Math.round((today - peak) / DAY);
        if (force) y = today.getFullYear();
        if (Math.abs(diff) <= SHOWER_DAYS) {
          return { id: s[0], name: s[1], year: y, diff: diff, month: s[2], day: s[3] };
        }
      }
    }
    return null;
  }

  var shower = activeShower();
  var strayLayer = null;

  function showHud() {
    var hud = document.createElement('p');
    hud.className = 'shower-hud';
    var when = shower.diff === 0 ? 'TONIGHT' : (shower.diff < 0 ? 'D' + shower.diff : 'D+' + shower.diff);
    hud.innerHTML =
      '<span class="shower-hud__icon" aria-hidden="true">' + METEOR_SVG + '</span>' +
      '<span class="shower-hud__text">' +
        '<span class="shower-hud__name">METEOR SHOWER · ' + shower.name + '</span>' +
        '<span class="shower-hud__peak">PEAK ' + pad(shower.month) + '.' + pad(shower.day) + ' · ' + when + '</span>' +
      '</span>';
    hud.setAttribute('aria-label', '지금은 ' + shower.name + ' 유성우 기간입니다. 하늘에 유성이 가끔 떨어집니다.');
    document.body.appendChild(hud);
    // tell, then fold down to just the icon so it never sits on the text
    setTimeout(function () { hud.classList.add('is-folded'); }, 8000);
  }

  function scheduleStray() {
    setTimeout(function () {
      if (!document.hidden && !warping) {
        if (!strayLayer) {
          strayLayer = document.createElement('div');
          strayLayer.className = 'meteor-shower';
          bg.appendChild(strayLayer);
        }
        dropMeteor(strayLayer, Math.random(), 0, true);
      }
      scheduleStray();
    }, 4000 + Math.round(Math.random() * 8000));
  }

  // A stray caught: the first one of this shower (this year) opens a log entry.
  function catchStray(x, y, n) {
    var tag = shower.id + '-' + shower.year, seen = [];
    try { seen = JSON.parse(localStorage.getItem(SHOWERS_SEEN_KEY) || '[]'); } catch (e) {}
    if (!Array.isArray(seen)) seen = [];
    if (seen.indexOf(tag) < 0) {
      seen.push(tag);
      try {
        localStorage.setItem(SHOWERS_SEEN_KEY, JSON.stringify(seen));
        localStorage.setItem(SHOWERS_KEY, seen.length);
      } catch (e) {}
      scorePop({ kind: 'observe', x: x, y: y - 40, score: 'NEW LOG!', total: shower.name + ' ' + shower.year });
      announce(shower.name + ' 유성우의 유성을 잡아 관측 일지에 기록했습니다.');
      return;
    }
    scorePop({ kind: 'catch', x: x, y: y - 40, score: '+1 CATCH', total: n ? '☆ × ' + n : '' });
    announce(shower.name + ' 유성우의 유성을 잡았습니다.' + (n ? ' 지금까지 ' + n + '개를 잡았습니다.' : ''));
  }

  if (shower) {
    showHud();
    if (!reduce.matches && document.body.animate) scheduleStray();
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
  // 4. Bookworm (Reading page)
  // ==========================================================================
  // States: hidden → up (out of a card's top edge, inching along, feedable)
  // → hidden; up → gone (butterfly). Each feed = one page eaten (counted)
  // and one more body segment, kept for this page visit. At BUTTERFLY_AT it
  // curls into a cocoon, a butterfly flies off, and it's gone for the tab.
  var WORM_KEY = 'serim.worms';               // pages fed
  var BUTTERFLY_KEY = 'serim.worms.butterfly'; // metamorphoses
  var FLOWN_KEY = 'serim.worm.flown';         // sessionStorage: flew away
  var WORM_UP_MS = 3200;                      // how long it stays out
  var WORM_FEED_MS = 1600;                    // extra stay after each feed
  var BUTTERFLY_AT = 5;
  var wormState = 'hidden';
  var wormTimer = 0;
  var feeds = 0;                              // this page visit
  var crawl = null;                           // the inching animation
  var wormHole = worm && worm.querySelector('.worm__hole');
  var wormAlert = worm && worm.querySelector('.worm__alert');

  // Pixel art (SVG user units = sprite pixels), drawn at --worm-px per pixel.
  var PINK = '#ff7ad9', LIGHT = '#e8ebff', DARK = '#070a1c', DIM = '#a9b0d6', STAR = '#ffe066';
  function px(x, y, w, h, fill, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (extra || '') + '/>';
  }
  function sprite(w, h, body) {
    return '<svg class="worm__sprite" viewBox="0 0 ' + w + ' ' + h + '" style="--w:' + w + ';--h:' + h +
           '" shape-rendering="crispEdges">' + body + '</svg>';
  }
  // 5 rows: 1px tail, 2px body segments (wiggle up 1px), 4×4 head in glasses
  function wormArt(segs) {
    var b = px(0, 3, 1, 2, PINK);
    for (var i = 0; i < segs; i++) {
      var x = 1 + i * 2;
      b += '<g class="worm__seg">' + px(x, 2, 2, 3, PINK) + px(x, 2, 1, 1, LIGHT, ' opacity=".6"') + '</g>';
    }
    var h = 1 + segs * 2;
    b += px(h, 1, 4, 4, PINK) + px(h, 2, 4, 1, DARK) + px(h + 1, 2, 1, 1, LIGHT) + px(h + 3, 2, 1, 1, LIGHT) +
         px(h + 2, 4, 2, 1, DARK, ' opacity=".5"');
    return sprite(h + 4, 5, b);
  }
  function cocoonArt() {
    return sprite(4, 5, px(1, 0, 2, 1, DIM) + px(0, 1, 4, 3, DIM) + px(1, 4, 2, 1, DIM) +
                        px(0, 2, 4, 1, PINK) + px(1, 1, 1, 1, LIGHT));
  }
  var BUTTERFLY_SVG =
    '<svg viewBox="0 0 7 6" shape-rendering="crispEdges">' +
    px(2, 0, 1, 1, STAR) + px(4, 0, 1, 1, STAR) + px(3, 1, 1, 5, LIGHT) +
    '<g class="butterfly__wing">' + px(0, 1, 2, 1, PINK) + px(0, 2, 3, 1, PINK) + px(1, 3, 2, 1, PINK) +
      px(0, 4, 3, 1, PINK) + px(0, 5, 2, 1, PINK) + px(1, 2, 1, 1, LIGHT) + '</g>' +
    '<g class="butterfly__wing butterfly__wing--r">' + px(5, 1, 2, 1, PINK) + px(4, 2, 3, 1, PINK) + px(4, 3, 2, 1, PINK) +
      px(4, 4, 3, 1, PINK) + px(5, 5, 2, 1, PINK) + px(5, 2, 1, 1, LIGHT) + '</g></svg>';

  function wormPx() { return parseInt(getComputedStyle(worm).getPropertyValue('--worm-px'), 10) || 8; }
  function flown() { try { return sessionStorage.getItem(FLOWN_KEY) === '1'; } catch (e) { return false; } }
  function wormLater(ms) { clearTimeout(wormTimer); wormTimer = setTimeout(wormPeek, ms); }
  function wormSegs() { return 2 + feeds; }

  // A book card (or the empty-state box) whose top edge is on screen.
  function wormSpot() {
    var header = document.querySelector('.site-header');
    var minY = (header ? header.getBoundingClientRect().bottom : 0) + 56;
    var boxes = [].slice.call(document.querySelectorAll('.post-list .post-card, .site-main .empty-state'))
      .filter(function (b) {
        var r = b.getBoundingClientRect();
        return r.width > 200 && r.top > minY && r.top < innerHeight - 40;
      });
    return boxes.length ? boxes[Math.floor(Math.random() * boxes.length)] : null;
  }

  function wormPeek() {
    if (wormState !== 'hidden' || flown()) return;
    if (document.hidden) { wormLater(3000); return; }
    var box = wormSpot();
    if (!box) { wormLater(3000); return; }
    var u = wormPx(), r = box.getBoundingClientRect();
    var w = (5 + wormSegs() * 2) * u, room = Math.max(r.width - w - 32 - 8 * u, 0);
    wormHole.innerHTML = wormArt(wormSegs());
    // page coordinates: it rides along with the card when you scroll
    worm.style.left = snap(r.left + scrollX + 16 + Math.random() * room) + 'px';
    worm.style.top = snap(r.top + scrollY) - 5 * u + 'px';
    worm.hidden = false;
    wormState = 'up';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        worm.classList.add('is-up');
        // inch forward: 4 hops of 2 sprite pixels
        if (!reduce.matches && worm.animate) {
          crawl = worm.animate([{ translate: '0 0' }, { translate: 8 * u + 'px 0' }],
                               { duration: WORM_UP_MS, easing: 'steps(4, end)', fill: 'forwards' });
        }
      });
    });
    wormTimer = setTimeout(function () { wormDuck(later(9000, 16000)); }, WORM_UP_MS + 400);
  }

  // Burrow back into the book; `next` = ms until it comes out again.
  function wormDuck(next) {
    clearTimeout(wormTimer);
    worm.classList.remove('is-up', 'is-fed');
    wormState = 'ducking';
    setTimeout(function () {
      worm.hidden = true;
      if (crawl) { crawl.cancel(); crawl = null; }
      wormState = 'hidden';
      if (next != null) wormLater(next);
    }, 480);
  }

  function feedWorm() {
    if (wormState !== 'up') return;
    clearTimeout(wormTimer);
    feeds++;
    var n = bump(WORM_KEY);
    if (feeds >= BUTTERFLY_AT) { metamorphose(); return; }
    // one segment longer, growing at the tail so the head stays put
    worm.style.left = parseFloat(worm.style.left) - 2 * wormPx() + 'px';
    wormHole.innerHTML = wormArt(wormSegs());
    if (wormAlert) wormAlert.textContent = feeds === BUTTERFLY_AT - 1 ? 'BURP' : 'NOM!';
    worm.classList.remove('is-fed');
    void worm.offsetWidth;
    worm.classList.add('is-fed');
    popOverWorm('worm', '+1 PAGE', n ? 'PAGE × ' + n : '');
    announce('책벌레가 책장을 먹고 한 마디 자랐습니다.' + (n ? ' 지금까지 ' + n + '장을 먹였습니다.' : ''));
    wormTimer = setTimeout(function () { wormDuck(later(9000, 16000)); }, WORM_FEED_MS);
  }

  function metamorphose() {
    wormState = 'gone';
    try { sessionStorage.setItem(FLOWN_KEY, '1'); } catch (e) {}
    var b = bump(BUTTERFLY_KEY);
    var motion = !reduce.matches && !!document.body.animate;
    // curl up into a cocoon where the head was
    var u = wormPx();
    worm.style.left = parseFloat(worm.style.left) + (1 + wormSegs() * 2) * u + 'px';
    worm.classList.remove('is-fed');
    worm.classList.add('is-cocoon');
    wormHole.innerHTML = cocoonArt();
    announce('책벌레가 고치가 되었습니다…');

    setTimeout(function () {
      var r = wormHole.getBoundingClientRect();
      worm.hidden = true;
      worm.classList.remove('is-up', 'is-cocoon');
      if (crawl) { crawl.cancel(); crawl = null; }
      scorePop({ kind: 'butterfly', x: r.left + r.width / 2, y: r.top - 40,
                 score: 'METAMORPHOSIS!', total: 'BOOKWORM ▶ BUTTERFLY' });
      announce('책벌레가 나비가 되어 날아갔습니다!' + (b ? ' 지금까지 ' + b + '마리를 날려 보냈습니다.' : ''));
      if (!motion) return;
      var fly = document.createElement('div');
      fly.className = 'butterfly';
      fly.setAttribute('aria-hidden', 'true');
      fly.innerHTML = BUTTERFLY_SVG;
      fly.style.left = snap(r.left) + 'px';
      fly.style.top = snap(r.bottom - 6 * u) + 'px';
      document.body.appendChild(fly);
      // zigzag up and off the top-right of the screen
      var dx = snap(Math.min(innerWidth * 0.3, 320)), dy = snap(r.bottom + 64);
      fly.animate(
        [{ translate: '0 0' },
         { translate: dx * .3 + 'px ' + -dy * .3 + 'px' },
         { translate: dx * .1 + 'px ' + -dy * .55 + 'px' },
         { translate: dx * .6 + 'px ' + -dy * .8 + 'px' },
         { translate: dx + 'px ' + -dy + 'px' }],
        { duration: 2000, easing: 'steps(16, end)', fill: 'forwards' }
      ).onfinish = function () { fly.remove(); };
    }, motion ? 900 : 0);
  }

  function popOverWorm(kind, score, total) {
    var r = wormHole.getBoundingClientRect();
    scorePop({ kind: kind, x: r.right - 16, y: r.top - 72, score: score, total: total }); // above the bubble
  }

  // Keyboard path ("book"): call it out now and feed it once.
  function summonWorm() {
    if (flown()) {
      scorePop({ kind: 'worm', x: innerWidth / 2, y: innerHeight - 120, score: '...', total: 'IT FLEW AWAY' });
      announce('책벌레는 이미 나비가 되어 날아갔습니다.');
      return;
    }
    if (wormState === 'gone') return;
    // still burrowing back in: call it again once it's down
    if (wormState === 'ducking') { setTimeout(summonWorm, 500); return; }
    if (wormState === 'hidden') { clearTimeout(wormTimer); wormPeek(); }
    setTimeout(feedWorm, 700);
  }

  if (worm && wormHole) {
    worm.addEventListener('click', feedWorm);
    // a resize moves the cards out from under it: hide and come back later
    addEventListener('resize', function () { if (wormState === 'up') wormDuck(later(9000, 16000)); });
    if (!flown()) wormLater(later(4000, 7000));
  }


  // ==========================================================================
  // Shared helpers
  // ==========================================================================
  function snap(v) { return Math.round(v / 4) * 4; } // stay on the 4px grid
  function pad(n) { return (n < 10 ? '0' : '') + n; }
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
