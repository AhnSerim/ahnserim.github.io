// Home hero "terminal" intro (see DESIGN.md §8 "타이핑"):
//   > BOOTING serim.space ...  OK
//   Hello World!
//   개발 및 독서기록▌
// Each line is typed out in turn while the block cursor follows along.
//
// Progressive enhancement: the inline script in <head> adds `.fx-type`
// (hides the lines) only on the first home visit of the tab session, when
// motion is allowed. Without it (JS off, reduced motion, already booted)
// everything simply shows at once. Untyped characters stay in place but
// invisible, so the layout never shifts; screen readers get the full text
// from a visually-hidden copy. Click or press a key to skip.
(function () {
  var root = document.documentElement;
  var hero = document.querySelector('[data-typing]');
  if (!hero) return;
  window.__typing = true;

  var BOOTED_KEY = 'serim.booted';
  var cursor = hero.querySelector('.home-hero__cursor');
  var boot = hero.querySelector('.home-hero__boot');
  var lines = [].slice.call(hero.querySelectorAll('.home-hero__boot, .home-hero__content > h1, .home-hero__content > p'));
  var SPEED = { boot: 28, h1: 90, p: 60 };       // ms per character

  function addOk() {
    if (!boot || boot.querySelector('.home-hero__ok')) return;
    var ok = document.createElement('span');
    ok.className = 'home-hero__ok';
    ok.textContent = ' OK';
    boot.appendChild(ok);
  }
  function park() {                               // cursor rests after the last line
    var last = lines[lines.length - 1];
    if (cursor && last) last.appendChild(cursor);
    if (cursor) cursor.classList.remove('is-typing');
  }

  if (!root.classList.contains('fx-type')) { addOk(); park(); return; }

  // ---- Prepare: [sr-only full text][aria-hidden: typed | cursor | rest] ----
  var jobs = lines.map(function (el) {
    var full = el.textContent.replace(/\s+/g, ' ').trim();
    var typed = document.createElement('span');
    var rest = document.createElement('span');
    rest.className = 'type-rest';
    rest.textContent = full;
    var vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    vis.appendChild(typed);
    vis.appendChild(rest);
    el.textContent = '';
    if (el.getAttribute('aria-hidden') !== 'true') {
      var sr = document.createElement('span');
      sr.className = 'visually-hidden';
      sr.textContent = full;
      el.appendChild(sr);
    }
    el.appendChild(vis);
    var speed = el === boot ? SPEED.boot : (el.tagName === 'H1' ? SPEED.h1 : SPEED.p);
    return { el: el, full: full, typed: typed, rest: rest, vis: vis, speed: speed };
  });
  root.classList.remove('fx-type');               // lines now hold invisible text

  var timer = 0, done = false;
  function show(job, n) {
    job.typed.textContent = job.full.slice(0, n);
    job.rest.textContent = job.full.slice(n);
    if (cursor) job.vis.insertBefore(cursor, job.rest);
  }

  function finish() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    jobs.forEach(function (j) { show(j, j.full.length); });
    addOk();
    park();
    try { sessionStorage.setItem(BOOTED_KEY, '1'); } catch (e) {}
    removeEventListener('keydown', finish);
    removeEventListener('pointerdown', finish);
  }

  function run(i, n) {
    if (done) return;
    if (i >= jobs.length) { finish(); return; }
    var job = jobs[i];
    show(job, n);
    if (n < job.full.length) {
      // a little jitter so it feels hand-typed; spaces go quicker
      var ch = job.full.charAt(n);
      var wait = ch === ' ' ? job.speed * 0.5 : job.speed * (0.7 + Math.random() * 0.6);
      timer = setTimeout(function () { run(i, n + 1); }, wait);
      return;
    }
    // line done: boot line gets its OK, then a beat before the next line
    if (job.el === boot) addOk();
    timer = setTimeout(function () { run(i + 1, 0); }, job.el === boot ? 450 : 300);
  }

  if (cursor) cursor.classList.add('is-typing');  // solid while typing
  addEventListener('keydown', finish);
  addEventListener('pointerdown', finish);
  timer = setTimeout(function () { run(0, 0); }, 250);
})();
