// Scroll effects (see DESIGN.md §8):
//  1. Reveal — elements "pixel-rise" into view in 4 steps as you scroll.
//  2. Progress — segmented reading gauge under the header on posts.
//  3. Parallax — star layers / planet drift at different speeds.
// Reveal and parallax are skipped for prefers-reduced-motion; the progress
// gauge is informational, so it always runs.
(function () {
  var root = document.documentElement;
  var motionOK = root.classList.contains('fx-reveal'); // set in <head>
  window.__scrollFx = true;

  // ---- 1. Reveal --------------------------------------------------------
  // Must match the selector list in _sass/_scroll-fx.scss.
  var REVEAL = '[data-reveal], .prose > h2, .prose > h3, .prose > blockquote,' +
               '.prose > div.highlighter-rouge, .prose > figure, .prose > table';

  if (motionOK) {
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // Stagger items that enter together (e.g. a row of cards).
        e.target.style.setProperty('--reveal-delay', Math.min(n++, 5) * 80 + 'ms');
        e.target.classList.add('is-revealed');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    document.querySelectorAll(REVEAL).forEach(function (el) { io.observe(el); });
  }

  // ---- 2 + 3. Scroll-linked updates (one rAF per frame) -----------------
  var bar = document.querySelector('.scroll-progress__bar');
  var far = motionOK && document.querySelector('.space-bg__stars--far');
  var near = motionOK && document.querySelector('.space-bg__stars--near');
  var planet = motionOK && document.querySelector('.space-bg__planet');
  if (!bar && !far) return;

  var SEG = 16;          // progress segment width (12px fill + 4px gap)
  var barW = 0;
  var ticking = false;

  function snap(v) { return Math.round(v / 2) * 2; } // move in whole pixels

  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;

    if (far) {
      // Tiles repeat every 320px / 560px, so wrap for an endless drift.
      far.style.transform = 'translate3d(0,' + -snap((y * 0.04) % 320) + 'px,0)';
      near.style.transform = 'translate3d(0,' + -snap((y * 0.12) % 560) + 'px,0)';
      if (planet) planet.style.transform = 'translate3d(0,' + -snap(Math.min(y * 0.08, 240)) + 'px,0)';
    }

    if (bar) {
      var max = root.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(y / max, 1) : 1;
      // Fill whole segments only, like an 8-bit gauge.
      var p = ratio >= 1 ? 1 : Math.floor(ratio * barW / SEG) * SEG / barW;
      bar.style.setProperty('--progress', p);
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  function measure() {
    if (bar) barW = bar.offsetWidth || 1;
    onScroll();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure); // images change page height
  measure();
})();
