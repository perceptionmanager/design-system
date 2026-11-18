/* perceptionmanager design system — page shell behavior (shell.js).
   Pairs with shell.css. No dependencies, no build step: load it with <script src=".../shell.js" defer>.
   Each behavior switches on from markup, so a page only gets what it has:
     [data-menu-open] / [data-menu-close] / .pm-site-menu[data-menu]   mobile menu
     [data-theme-toggle]                                                theme switch (with the boot script in <head>, see docs/shell.md)
     [data-scroll-progress]                                             reading-progress bar under the header
     [data-blob-group] > [data-blob-target]                             backdrop glows (placed once)
     .pm-backdrop__aura + .pm-backdrop__blob--coral/--cyan              engraved line pattern inside the glows
                                                                        (off when <body data-backdrop-lines="off">)
     [data-magnetic]                                                    buttons that lean toward the pointer
     a[href^="mailto:"]                                                 copy the address too, and say so
     .pm-page h1                                                        title build-up, word by word in dots and lines
                                                                        (<html class="pm-title-pending"> hides it before first paint)
     <body data-serif-reveal> + main h2                                 section titles switch from sans to serif as they scroll in
     .pm-modal__img                                                     click, Ctrl +/- or pinch to zoom the image modal
     .pm-stat-bar .pm-stat__value                                       figures pop in when the bar scrolls into view
     <body data-color-slots> + [data-color-slot]                        stat and step numbers tinted by the glows (Lab layout)
   Helpers for page scripts: pmShell.buildTitle(h1, options) builds a title (for <h1 data-title-build="manual">);
   pmShell.numPop(container, selector) pops figures in; pmShell.colorSlots() tints
   [data-color-slot] figures by the glows; pmShell.mixColor(fromRGB, toRGB, t) blends brand colors for the theme.
   Runs once the page has parsed, after the page's own DOMContentLoaded handlers, so a page script can still
   switch a behavior off (for example data-backdrop-lines="off") before the shell starts. */
window.pmShell = (function () {
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---- mobile menu overlay ---- */
  function initMobileMenu() {
    var openers = document.querySelectorAll('[data-menu-open]');
    var closers = document.querySelectorAll('[data-menu-close]');
    var overlays = document.querySelectorAll('.pm-site-menu[data-menu]');
 
    function setExpanded(v) { openers.forEach(function (btn) { btn.setAttribute('aria-expanded', v ? 'true' : 'false'); }); }
    function open() { overlays.forEach(function (o) { o.classList.add('is-open'); }); setExpanded(true); }
    function close() { overlays.forEach(function (o) { o.classList.remove('is-open'); }); setExpanded(false); }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.querySelector('.pm-site-menu[data-menu].is-open')) {
        close();
        if (openers[0]) openers[0].focus();
      }
    });

    openers.forEach(function (btn) { btn.addEventListener('click', open); });
    closers.forEach(function (btn) { btn.addEventListener('click', close); });
    overlays.forEach(function (o) {
      o.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    });
  }
 
  /* ---- theme switch ----
     The page boot script (in each <head>) has already set <html data-theme> from the saved choice or the system setting.
     The header button flips it and remembers the choice. A change of the system setting always wins over a saved choice and is followed. */
  function initThemeToggle() {
    var root = document.documentElement;
    var btns = document.querySelectorAll('[data-theme-toggle]');
    var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
    function isLight() { return root.getAttribute('data-theme') === 'light'; }
    function sync() {
      btns.forEach(function (b) { b.setAttribute('aria-label', isLight() ? 'Switch to dark theme' : 'Switch to light theme'); });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var next = isLight() ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('pm-theme', next); } catch (e) {}
        sync();
      });
    });
    if (mq && mq.addEventListener) mq.addEventListener('change', function (e) {
      /* the system setting just changed, so it is the newer choice: drop any saved one and follow it */
      try { localStorage.removeItem('pm-theme'); } catch (err) {}
      root.setAttribute('data-theme', e.matches ? 'light' : 'dark');
      sync();
    });
    sync();
  }

  /* ---- scroll progress bar under the nav ---- */
  function initScrollProgress() {
    var bars = document.querySelectorAll('[data-scroll-progress]');
    if (!bars.length) return;
    function update() {
      var h = document.documentElement;
      var max = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
      var pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      bars.forEach(function (bar) { bar.style.width = pct + '%'; });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
 
  /* ---- backdrop glows: placed once ----
     Each [data-blob-group] (data-tx-range / data-ty-range / data-scale-min / data-scale-max / data-blur-min /
     data-blur-max / data-op-min / data-op-max) holds one or more [data-blob-target] elements (a .pm-backdrop__clear
     mask and a .pm-backdrop__blob glow) that share one placement. On load each group is placed once: a random offset,
     size and strength inside those ranges, and the blur at the middle of its range. Nothing moves afterwards, so the
     glows cost nothing while the page is open. (Until v0.7.0 they drifted on a loop; data-dur-min / data-dur-max are
     no longer read.) With "reduce motion" on, the groups sit at the middle of their ranges.
     group.blobState (read-only) gives the placement, { tx, ty, scale, op, blur }, for page scripts. */
  function initBlobDrift() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('[data-blob-group]').forEach(function (group) {
      var tx = num(group, 'txRange', 150), ty = num(group, 'tyRange', 140);
      var sc = [num(group, 'scaleMin', 0.55), num(group, 'scaleMax', 1.7)], op = [num(group, 'opMin', 0.14), num(group, 'opMax', 0.6)];
      var st = reduced
        ? { tx: 0, ty: 0, scale: (sc[0] + sc[1]) / 2, op: (op[0] + op[1]) / 2 }
        : { tx: rand(-tx, tx), ty: rand(-ty, ty), scale: rand(sc[0], sc[1]), op: rand(op[0], op[1]) };
      st.blur = Math.round((num(group, 'blurMin', 30) + num(group, 'blurMax', 130)) / 2);
      group.querySelectorAll('[data-blob-target]').forEach(function (el) {
        el.style.transform = 'translate(' + st.tx.toFixed(1) + 'px,' + st.ty.toFixed(1) + 'px) scale(' + st.scale.toFixed(3) + ')';
        el.style.opacity = st.op.toFixed(3);
        if (el.classList.contains('pm-backdrop__blob')) el.style.filter = 'blur(' + st.blur + 'px)';
      });
      Object.defineProperty(group, 'blobState', { configurable: true, get: function () { return st; } });
    });
    function num(el, key, fallback) {
      var v = el.dataset[key];
      return v === undefined ? fallback : Number(v);
    }
  }
 
  /* ---- magnetic buttons (desktop / mouse only) ----
     A gentle nudge toward the pointer, not a pull: the button moves 14% of the
     pointer's offset from its centre, never more than 6px. Override per button
     with data-magnetic="0.2" (a bare data-magnetic uses the default). Off with
     "reduce motion". */
  var MAGNETIC_STRENGTH = 0.14, MAGNETIC_MAX = 6;
  function initMagnetic() {
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnetic')) || MAGNETIC_STRENGTH;
      function limit(v) { return v < -MAGNETIC_MAX ? -MAGNETIC_MAX : v > MAGNETIC_MAX ? MAGNETIC_MAX : v; }
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = limit((e.clientX - r.left - r.width / 2) * strength);
        var y = limit((e.clientY - r.top - r.height / 2) * strength);
        el.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---- mailto contact fallback ----
     A mailto: link silently does nothing on a machine with no default mail
     client configured (common wherever email lives entirely in a browser —
     exactly the laptops hiring teams tend to use). This copies the address
     to the clipboard on click, alongside the normal mailto: behavior, and
     shows a small confirmation right next to the control that was clicked
     (to its right when there is room, below it in the header and on narrow
     screens) so the person always leaves with the address ready to paste. */
  function initMailtoCopy() {
    var links = document.querySelectorAll('a[href^="mailto:"]');
    if (!links.length) return;

    var tip = document.createElement('div');
    tip.className = 'pm-copy-tip';
    tip.setAttribute('role', 'status');
    tip.setAttribute('aria-live', 'polite');
    document.body.appendChild(tip);
    var CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

    function place(anchor) {
      var GAP = 12, M = 8;
      var r = anchor.getBoundingClientRect();
      var w = tip.offsetWidth, h = tip.offsetHeight;
      var vw = document.documentElement.clientWidth, vh = window.innerHeight;
      var inNav = !!anchor.closest('.pm-site-header');
      var x, y;
      if (!inNav && r.right + GAP + w <= vw - M) {            // beside, to the right
        x = r.right + GAP; y = r.top + (r.height - h) / 2;
      } else if (!inNav && r.left - GAP - w >= M) {           // beside, to the left
        x = r.left - GAP - w; y = r.top + (r.height - h) / 2;
      } else {                                                // under (or over) the control
        x = inNav ? r.right - w : r.left + (r.width - w) / 2;
        y = (r.bottom + GAP + h <= vh - M) ? r.bottom + GAP : r.top - GAP - h;
      }
      tip.style.left = Math.round(Math.min(Math.max(M, x), vw - w - M)) + 'px';
      tip.style.top = Math.round(Math.max(M, y)) + 'px';
    }

    function hide() { tip.classList.remove('is-visible'); }

    function show(anchor, address) {
      tip.innerHTML = CHECK + '<span>Email copied</span>';
      tip.title = address;
      tip.classList.remove('is-visible');
      place(anchor);
      void tip.offsetWidth; // restart the transition on repeated clicks
      tip.classList.add('is-visible');
      clearTimeout(tip._hideTimer);
      tip._hideTimer = setTimeout(hide, 2400);
    }

    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);

    links.forEach(function (link) {
      link.addEventListener('click', function () {
        var address = link.href.replace(/^mailto:/, '').split('?')[0];
        if (!address || !navigator.clipboard || !navigator.clipboard.writeText) return;
        navigator.clipboard.writeText(address).then(function () {
          show(link, address);
        }).catch(function () {
          // Clipboard blocked (e.g. insecure context) — mailto: still fires normally.
        });
      });
    });
  }

  /* ---- backdrop line pattern ----
     Fine horizontal lines (one every 3px), each a random run of dots and dashes, that show only inside the lit areas
     of the backdrop: each .pm-backdrop__blob glow and the coloured .pm-backdrop__aura behind the page title. Added to
     every page with the backdrop; nothing to put in the HTML. Opt a page out with <body data-backdrop-lines="off">.
     - One 360x90 dot-and-dash tile is drawn per page load and used as a mask; the element's colour (coral, cyan, or
       coral into cyan on the aura) shows only through it, faded out from the centre (.pm-backdrop__lines in
       shell.css). Brighter glows get stronger lines.
     - Placed once from where the glows ended up, again only on resize. Nothing is redrawn, so it costs nothing while
       the page is open. (Until v0.7.0 this was a canvas redrawn every frame.)
     Decorative only: empty, aria-hidden. If the tile cannot be drawn, shell.css falls back to plain 1px lines. */
  function initBackdropLines() {
    if (document.body.getAttribute('data-backdrop-lines') === 'off') return;
    var tile = '';
    try {
      var TW = 360, TH = 90, PITCH = 3, cv = document.createElement('canvas'), c2 = cv.getContext('2d');
      cv.width = TW; cv.height = TH; c2.fillStyle = '#000';
      for (var y = 0; y < TH; y += PITCH) {
        var x = Math.floor(Math.random() * 6);
        while (x < TW) {
          var len = Math.random() < 0.5 ? 1 : 3 + Math.floor(Math.random() * 8);   // a dot, or a dash of 3-10px
          c2.fillRect(x, y, Math.min(len, TW - x), 1);
          x += len + 2 + Math.floor(Math.random() * 5);                              // gap of 2-6px
        }
      }
      tile = 'url("' + cv.toDataURL('image/png') + '")';
    } catch (e) { tile = ''; }
    // the tile goes straight into each element's mask (with its --fade), not through a custom property
    function useTile(el) {
      if (!tile) return;
      var v = tile + ', ' + getComputedStyle(el).getPropertyValue('--fade').trim();
      el.style.webkitMaskImage = v; el.style.maskImage = v;
    }
    function make(cls) {
      var el = document.createElement('div');
      el.className = 'pm-backdrop__lines ' + cls; el.setAttribute('aria-hidden', 'true');
      return el;
    }
    var made = [];
    document.querySelectorAll('.pm-backdrop__blob').forEach(function (blob) {
      var el = make(blob.classList.contains('pm-backdrop__blob--cyan') ? 'pm-backdrop__lines--cyan' : 'pm-backdrop__lines--coral');
      var group = blob.closest('[data-blob-group]') || blob.parentNode;   // beside the group, so the group's light-theme dimming doesn't apply twice
      group.parentNode.insertBefore(el, group.nextSibling); useTile(el);
      made.push({ el: el, blob: blob });
    });
    var aura = document.querySelector('.pm-backdrop__aura');
    if (aura && aura.parentNode) { var a = make('pm-backdrop__lines--aura'); aura.parentNode.insertBefore(a, aura.nextSibling); useTile(a); }
    function place() {
      made.forEach(function (m) {
        if (!m.blob.offsetParent) { m.el.style.display = 'none'; return; }   // glow hidden at this width
        m.el.style.display = '';
        var box = m.el.offsetParent || document.body;                       // positioned against this
        var r = m.blob.getBoundingClientRect(), h = box.getBoundingClientRect();
        var size = Math.round(r.width * 1.44);                          // the lines reach a little past the glow
        m.el.style.width = m.el.style.height = size + 'px';
        m.el.style.left = Math.round(r.left - h.left + r.width / 2 - size / 2) + 'px';
        m.el.style.top = Math.round(r.top - h.top + r.height / 2 - size / 2) + 'px';   // whole pixels keep the lines sharp
        var op = parseFloat(m.blob.style.opacity) || 0.35;
        m.el.style.setProperty('--i', Math.max(0.12, Math.min(1, (op - 0.08) / 0.5)).toFixed(3));
      });
    }
    place();
    var t = 0;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(place, 150); });
  }

  /* ---- color-interpolation helper, used by pages that fade a value's
     color based on scroll/blob depth (e.g. stat callouts) ---- */
  /* The pages pass the dark theme's brand colours (coral, cyan, light ink). In the light theme those would be unreadable as text,
     so they are swapped for the matching text tokens: coral -> text.accent, cyan -> text.interactive-hover, ink -> text.primary.
     In dark the tokens resolve to the same three colours, so nothing changes there. */
  var themeColorCache = {};
  function tokenRGB(token) {
    var theme = document.documentElement.getAttribute('data-theme') || 'dark';
    var key = theme + token;
    if (!themeColorCache[key]) {
      var probe = document.createElement('span');
      probe.style.color = 'var(' + token + ')';
      probe.style.display = 'none';
      document.body.appendChild(probe);
      var m = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g);
      document.body.removeChild(probe);
      themeColorCache[key] = m ? [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])] : null;
    }
    return themeColorCache[key];
  }
  var BRAND_TEXT = { '255,106,76': '--pm-color-text-accent', '69,224,255': '--pm-color-text-interactive-hover', '243,241,236': '--pm-color-text-primary' };
  function forTheme(rgb) {
    var token = BRAND_TEXT[rgb.join(',')];
    return (token && tokenRGB(token)) || rgb;
  }
  function mixColor(fromRGB, toRGB, t) {
    fromRGB = forTheme(fromRGB); toRGB = forTheme(toRGB);
    t = Math.min(1, Math.max(0, t));
    var r = Math.round(fromRGB[0] + (toRGB[0] - fromRGB[0]) * t);
    var g = Math.round(fromRGB[1] + (toRGB[1] - fromRGB[1]) * t);
    var b = Math.round(fromRGB[2] + (toRGB[2] - fromRGB[2]) * t);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
 
  /* ---- page title build-up ----
     Replaces the title pop-in (until v0.8.0). Every .pm-page h1 is built word by word, left to right, in the system's
     drawing language: each word is outlined and its text line traced in grayscale dots and lines (with corner handles,
     a small size label and a sparse dot field lit by a sweep), then the real word fades in from a slight blur.
     - Words: a title already split into .pm-split-word spans is used as it is; plain text is split into
       .pm-title-word spans here, keeping any inline markup around the words.
     - Before first paint: add the class pm-title-pending to <html> in the <head> boot script (docs/shell.md); shell.css
       hides the title until the build starts, and shows it after 3s if the script never runs. Without that class the
       title shows briefly before the build.
     - <h1 data-title-build="manual"> leaves the start to the page: call pmShell.buildTitle(h1, options), which returns
       { finished: Promise, cancel() } (the portfolio's home page chains its AI field after it). data-title-build="off"
       skips the build.
     - Any click, key or focus finishes it at once. Off with reduced motion. Decorative layer: aria-hidden. */
  var TB_NS = 'http://www.w3.org/2000/svg';
  function tbClamp(x) { return Math.max(0, Math.min(1, x)); }
  function tbSmooth(a, b, x) { var q = tbClamp((x - a) / (b - a)); return q * q * (3 - 2 * q); }
  function tbF(n) { return (+n).toFixed(2); }
  function tbBezier(x1, y1, x2, y2) {
    function cx(t) { return 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t; }
    function cy(t) { return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t; }
    return function (x) { if (x <= 0) return 0; if (x >= 1) return 1; var lo = 0, hi = 1, m = 0.5; for (var i = 0; i < 28; i++) { m = (lo + hi) / 2; if (cx(m) < x) lo = m; else hi = m; } return cy(m); };
  }
  var TB_OUT = tbBezier(0.16, 1, 0.3, 1), TB_REVEAL = tbBezier(0.22, 1, 0.36, 1), TB_FLOW = 0.016;
  function tbSvg(tag, attrs, parent) {
    var e = document.createElementNS(TB_NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  // half a rounded box from the left middle to the right middle, over the top (dir 1) or under the bottom (dir 0):
  // both halves start on the left and meet on the right, so every word is drawn left to right
  function tbHalf(x, y, w, h, r, dir) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    function X(v) { return tbF(x + v); } function Y(v) { return tbF(y + v); } var R = tbF(r);
    return dir
      ? 'M' + X(0) + ' ' + Y(h / 2) + 'V' + Y(r) + 'A' + R + ' ' + R + ' 0 0 1 ' + X(r) + ' ' + Y(0) + 'H' + X(w - r) + 'A' + R + ' ' + R + ' 0 0 1 ' + X(w) + ' ' + Y(r) + 'V' + Y(h / 2)
      : 'M' + X(0) + ' ' + Y(h / 2) + 'V' + Y(h - r) + 'A' + R + ' ' + R + ' 0 0 0 ' + X(r) + ' ' + Y(h) + 'H' + X(w - r) + 'A' + R + ' ' + R + ' 0 0 0 ' + X(w) + ' ' + Y(h - r) + 'V' + Y(h / 2);
  }
  var TB_DEFAULTS = {
    words: '',        // selector for the word spans; default: .pm-split-word if present, else words split here
    delay: 120,       // ms before the first word starts
    wordDraw: 520,    // ms to trace one word
    stagger: 190,     // ms between word starts
    maxSpan: 1300,    // long titles: starts are squeezed so the last word starts within this many ms
    fade: 360,        // ms the real word takes to fade in
    revealAt: 0.62,   // fraction of wordDraw at which the word starts fading in
    dotGap: 6.4,      // spacing of the dots on a line
    fieldGap: 30,     // spacing of the background dot field
    pad: 6            // space between a word's glyphs and its outline
  };
  // wrap each word of plain text in a span; whitespace stays as text, so lines wrap as before
  function tbSplit(h1) {
    if (h1.querySelector('.pm-split-word')) return '.pm-split-word';
    if (h1.querySelector('.pm-title-word')) return '.pm-title-word';
    var walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
        var s = document.createElement('span'); s.className = 'pm-title-word'; s.textContent = tok; frag.appendChild(s);
      });
      n.parentNode.replaceChild(frag, n);
    });
    return '.pm-title-word';
  }
  function tbMeasure(h1, words, o) {
    var R = h1.getBoundingClientRect();
    return { R: R, w: R.width, h: R.height, words: words.map(function (el, i) {
      var rg = document.createRange(); rg.selectNodeContents(el);
      var rects = Array.prototype.filter.call(rg.getClientRects(), function (q) { return q.width && q.height; });
      var q = rects.length ? rects.reduce(function (a, b) { return { left: Math.min(a.left, b.left), top: Math.min(a.top, b.top), right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom) }; }) : el.getBoundingClientRect();
      var hh = q.bottom - q.top, trimT = hh * 0.1, trimB = hh * 0.06;   // hug the letters, not the line's leading
      return { el: el, i: i, text: el.textContent.trim(), x: q.left - R.left - o.pad, y: q.top - R.top + trimT - o.pad * 0.6, w: q.right - q.left + 2 * o.pad, h: hh - trimT - trimB + o.pad * 1.2 };
    }) };
  }
  function tbBuild(M, o) {
    var MG = 36, w = M.w, h = M.h;
    var layer = document.createElement('div');
    layer.className = 'pm-tb'; layer.setAttribute('aria-hidden', 'true');
    layer.style.left = tbF(M.R.left + window.scrollX) + 'px'; layer.style.top = tbF(M.R.top + window.scrollY) + 'px';
    layer.style.width = tbF(w) + 'px'; layer.style.height = tbF(h) + 'px';
    var root = tbSvg('svg', { 'class': 'pm-tb__svg', width: tbF(w), height: tbF(h), viewBox: '0 0 ' + tbF(w) + ' ' + tbF(h) }, layer);
    document.body.appendChild(layer);
    var G = { layer: layer, words: [], dots: [] };
    var dots = tbSvg('g', {}, root), SP = o.fieldGap;                    // sparse dot field, lit by the sweep
    for (var x = -MG + ((w + 2 * MG) % SP) / 2; x <= w + MG; x += SP) for (var y = -MG + ((h + 2 * MG) % SP) / 2; y <= h + MG; y += SP) {
      var out = Math.max(0, -x, x - w, -y, y - h);
      G.dots.push({ el: tbSvg('circle', { cx: tbF(x), cy: tbF(y), r: 1, 'class': 'pm-tb__dot' }, dots), x: x, y: y, edge: 1 - tbClamp(out / MG) });
    }
    function line(d, parent, cls) { var e = tbSvg('path', { d: d, 'class': cls || 'pm-tb__wire' }, parent); return { el: e, L: e.getTotalLength(), gap: o.dotGap }; }
    function head(parent, r) { return tbSvg('circle', { r: r || 2.3, 'class': 'pm-tb__head', opacity: 0 }, parent); }
    M.words.forEach(function (W) {
      var g = tbSvg('g', {}, root), r = Math.min(6, W.h / 4);
      var outline = [1, 0].map(function (dir) { var s = line(tbHalf(W.x, W.y, W.w, W.h, r, dir), g); s.head = head(g); return s; });
      var tx0 = W.x + o.pad + 2, tx1 = W.x + W.w - o.pad - 2, ty = W.y + W.h * 0.56;   // the text line, with end caps
      var tl = line('M' + tbF(tx0) + ' ' + tbF(ty) + 'H' + tbF(tx1), g); tl.head = head(g, 1.9);
      tl.caps = [tbSvg('circle', { cx: tbF(tx0), cy: tbF(ty), r: 1.6, 'class': 'pm-tb__head', opacity: 0 }, g), tbSvg('circle', { cx: tbF(tx1), cy: tbF(ty), r: 1.6, 'class': 'pm-tb__head', opacity: 0 }, g)];
      var probe = tbSvg('path', { d: 'M0 ' + tbF(W.y - 14) + 'V' + tbF(W.y + W.h + 14), 'class': 'pm-tb__guide pm-tb__guide--dashed', opacity: 0 }, g);
      var base = line('M' + tbF(W.x - 12) + ' ' + tbF(W.y + W.h) + 'H' + tbF(W.x + W.w + 12), g, 'pm-tb__guide'); base.gap = 6.5;
      var handles = [[W.x, W.y], [W.x + W.w, W.y], [W.x + W.w, W.y + W.h], [W.x, W.y + W.h]].map(function (p) {
        return { el: tbSvg('rect', { x: -2, y: -2, width: 4, height: 4, 'class': 'pm-tb__handle', transform: 'translate(' + tbF(p[0]) + ' ' + tbF(p[1]) + ') scale(0)' }, g), x: p[0], y: p[1] };
      });
      var label = tbSvg('text', { x: tbF(W.x), y: tbF(W.y - 6), 'class': 'pm-tb__label', opacity: 0 }, g);
      var t0 = o.delay + W.i * o.stagger;
      G.words.push({ W: W, g: g, outline: outline, text: tl, probe: probe, base: base, handles: handles, label: label, t0: t0, t1: t0 + o.wordDraw, fadeAt: t0 + o.wordDraw * o.revealAt });
    });
    G.end = G.words.length ? Math.max.apply(null, G.words.map(function (k) { return Math.max(k.t1 + 220, k.fadeAt + o.fade); })) : o.delay;
    return G;
  }
  function tbLine(s, q, t) {
    var on = q > 0; s.el.style.opacity = on ? 1 : 0;
    if (on) {
      var n = Math.floor((s.L * Math.min(1, q)) / s.gap) + 1;
      if (n !== s.n) { s.n = n; s.el.style.strokeDasharray = new Array(n).join('0 ' + tbF(s.gap) + ' ') + '0 ' + tbF(s.L + 10); }
      s.el.style.strokeDashoffset = tbF(-(t * TB_FLOW) % s.gap);
    }
    if (s.head) {
      var live = q > 0 && q < 1; s.head.setAttribute('opacity', live ? 1 : 0);
      if (live) { var pt = s.el.getPointAtLength(Math.floor((s.L * q) / s.gap) * s.gap); s.head.setAttribute('cx', tbF(pt.x)); s.head.setAttribute('cy', tbF(pt.y)); }
    }
    if (s.caps) { s.caps[0].setAttribute('opacity', on ? 1 : 0); s.caps[1].setAttribute('opacity', q >= 1 ? 1 : 0); }
  }
  function tbFrame(G, t, o) {
    var sweep = -999, live = 0;                                          // x of the rightmost drawing head
    G.words.forEach(function (K) {
      var p = tbClamp((t - K.t0) / (K.t1 - K.t0));
      var oq = TB_OUT(tbClamp(p / 0.78)), tq = TB_OUT(tbClamp((p - 0.3) / 0.62));
      K.g.setAttribute('opacity', tbF(1 - TB_REVEAL(tbClamp((t - K.fadeAt) / (o.fade * 1.1)))));   // the drawing clears as the word comes in
      K.outline.forEach(function (s) { tbLine(s, oq, t); });
      tbLine(K.text, tq, t);
      var bq = TB_OUT(tbClamp(p / 0.5)); tbLine(K.base, bq, t); K.base.el.style.opacity = bq > 0 ? 0.55 : 0;
      var hq = TB_OUT(tbClamp((p - 0.12) / 0.3));
      K.handles.forEach(function (hd) { hd.el.setAttribute('transform', 'translate(' + tbF(hd.x) + ' ' + tbF(hd.y) + ') scale(' + tbF(hq) + ')'); });
      K.label.setAttribute('opacity', tbF(p > 0 ? 0.85 : 0));
      K.label.textContent = (K.W.text.replace(/[^\w]/g, '').toLowerCase() || 'word') + ' ' + Math.round(K.W.w * oq) + '×' + Math.round(K.W.h * oq);
      var hx = K.W.x + K.W.w * oq, pOn = p > 0 && p < 1;
      K.probe.setAttribute('transform', 'translate(' + tbF(hx) + ' 0)');
      K.probe.setAttribute('opacity', tbF(pOn ? tbSmooth(0, 0.08, p) * (1 - tbSmooth(0.7, 0.95, p)) * 0.7 : 0));
      if (pOn) { live++; sweep = Math.max(sweep, hx); }
      var e = TB_REVEAL(tbClamp((t - K.fadeAt) / o.fade)), st = K.W.el.style;   // the real word: faint and blurred to sharp
      st.opacity = tbF(e);
      st.filter = e > 0 && e < 0.99 ? 'blur(' + tbF(3 * (1 - e)) + 'px)' : '';
    });
    var fieldOn = tbSmooth(o.delay - 120, o.delay + 200, t) * (1 - tbSmooth(G.end - 500, G.end, t));
    G.dots.forEach(function (d) {
      var lit = live ? Math.exp(-Math.pow((d.x - sweep) / 26, 2)) : 0;
      d.el.setAttribute('opacity', tbF(Math.max(0.35, lit) * d.edge * fieldOn));
      d.el.setAttribute('r', tbF(0.95 + lit * 0.7));
      d.el.classList.toggle('is-lit', lit > 0.4);
    });
  }
  // pmShell.buildTitle(h1, options) -> { finished: Promise, cancel() }
  function buildTitle(h1, options) {
    var o = {}, k;
    for (k in TB_DEFAULTS) o[k] = TB_DEFAULTS[k];
    for (k in (options || {})) o[k] = options[k];
    var sel = o.words || tbSplit(h1);
    var words = Array.prototype.slice.call(h1.querySelectorAll(sel));
    if (words.length > 1) o.stagger = Math.min(o.stagger, o.maxSpan / (words.length - 1));
    var resolve, raf = 0, G = null, stopped = false;
    var finished = new Promise(function (r) { resolve = r; });
    // words keep animation:none and no transform afterwards, or a stylesheet word animation would replay
    function settle() { words.forEach(function (el) { el.style.animation = 'none'; el.style.transform = 'none'; el.style.opacity = '1'; el.style.filter = ''; }); }
    function finish() { if (stopped) return; stopped = true; cancelAnimationFrame(raf); if (G) G.layer.remove(); settle(); h1.style.opacity = '1'; resolve(h1); }
    words.forEach(function (el) { el.style.animation = 'none'; el.style.transform = 'none'; el.style.opacity = '0'; });
    h1.style.animation = 'none'; h1.style.opacity = '1';                 // the title's own fade, if any, is replaced by the build
    document.documentElement.classList.remove('pm-title-pending');
    try { G = tbBuild(tbMeasure(h1, words, o), o); }
    catch (e) { finish(); return { finished: finished, cancel: finish }; }
    var t0 = performance.now();
    tbFrame(G, 0, o);
    function tick(now) {
      if (stopped) return;
      var t = now - t0; tbFrame(G, t, o);
      if (t >= G.end) { finish(); return; }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return { finished: finished, cancel: finish };
  }
  function initTitleBuild() {
    var root = document.documentElement;
    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var titles = Array.prototype.filter.call(document.querySelectorAll('.pm-page h1'), function (h1) {
      var m = h1.getAttribute('data-title-build'); return m !== 'manual' && m !== 'off' && h1.textContent.trim();
    });
    if (reduced || !titles.length) { root.classList.remove('pm-title-pending'); return; }
    var runs = [], interrupted = false, events = ['pointerdown', 'keydown', 'focusin'];
    function stop() { interrupted = true; runs.forEach(function (r) { r.cancel(); }); events.forEach(function (t) { document.removeEventListener(t, stop, true); }); root.classList.remove('pm-title-pending'); }
    events.forEach(function (t) { document.addEventListener(t, stop, true); });
    // text is measured from the fonts: wait for them, briefly
    var fonts = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 600); })]) : Promise.resolve();
    fonts.then(function () {
      if (interrupted) return;
      titles.forEach(function (h1) { runs.push(buildTitle(h1)); });
      Promise.all(runs.map(function (r) { return r.finished; })).then(function () { events.forEach(function (t) { document.removeEventListener(t, stop, true); }); });
    });
  }

  /* ---- section titles: sans to serif as they scroll in ----
     Opt in with <body data-serif-reveal>. Each visible section h2 in <main> starts in the sans face; as it comes into
     view its letters switch to the serif face one by one, left to right, word after word. Titles that come into view
     together play in page order. Each letter switches at once (no fade); the serif glyph keeps the width, so nothing
     shifts. A small dotted mark, picked at random (a corner along the foot or top, a side guide, an arm reaching out,
     or loose dots), shows at the left edge as a title starts and at the right edge as it ends, then both go.
     Screen readers get the title from aria-label. Titles already scrolled past show in serif straight away.
     Off with reduced motion. */
  function initSerifTitles() {
    if (!document.body.hasAttribute('data-serif-reveal') || !('IntersectionObserver' in window)) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var LETTER = 14, WORD = 35, GAP = 60;                                  // ms between letters, extra between words, between titles
    var titles = Array.prototype.slice.call(document.querySelectorAll('main h2:not(.pm-visually-hidden):not(.pt-visually-hidden):not(.sr-only)'));
    function split(el) {
      var text = el.textContent.replace(/\s+/g, ' ').trim();
      el.setAttribute('aria-label', text);
      var wrap = document.createElement('span'); wrap.setAttribute('aria-hidden', 'true');
      var chars = [], words = text.split(' ');
      words.forEach(function (w, wi) {
        var ws = document.createElement('span'); ws.className = 'pm-sr-word';
        Array.prototype.forEach.call(w, function (ch) {
          var c = document.createElement('span'); c.className = 'pm-sr-ch'; c.setAttribute('data-ch', ch);
          var s = document.createElement('span'); s.className = 'pm-sr-s'; s.textContent = ch;
          c.appendChild(s); ws.appendChild(c); chars.push({ el: c, word: wi });
        });
        wrap.appendChild(ws);
        if (wi < words.length - 1) wrap.appendChild(document.createTextNode(' '));
      });
      el.textContent = ''; el.appendChild(wrap);
      el.classList.add('pm-sr-armed');
      return { chars: chars, wrap: wrap };
    }
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function mark(svg, x, y0, y1, dir) {                                  // dir 1 = left edge, -1 = right edge
      var g = tbSvg('g', {}, svg), ym = (y0 + y1) / 2, L = Math.round(rnd(10, 24)), d = '', dots = [];
      switch (Math.floor(Math.random() * 5)) {
        case 0: d = 'M' + x + ' ' + y0 + 'V' + y1 + 'H' + (x + dir * L); dots = [[x, y0], [x + dir * L, y1]]; break;   // corner, foot
        case 1: d = 'M' + x + ' ' + y1 + 'V' + y0 + 'H' + (x + dir * L); dots = [[x, y1], [x + dir * L, y0]]; break;   // corner, top
        case 2: d = 'M' + x + ' ' + y0 + 'V' + y1; dots = [[x, y0], [x, y1]]; break;                                   // side guide
        case 3: d = 'M' + x + ' ' + ym + 'H' + (x - dir * L); dots = [[x - dir * L, ym], [x, rnd(y0, y1)]]; break;   // arm outward
        default: dots = [[x, y0 + rnd(0, 6)], [x - dir * rnd(4, 10), ym], [x, y1 - rnd(0, 6)]];                    // loose dots
      }
      if (d) tbSvg('path', { d: d, 'class': 'pm-sr-mark-line' }, g);
      dots.forEach(function (p) { tbSvg('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 2.3, 'class': 'pm-sr-mark-dot' }, g); });
      return g;
    }
    function marks(el) {
      var rg = document.createRange(); rg.selectNodeContents(el);
      var rs = Array.prototype.filter.call(rg.getClientRects(), function (r) { return r.width && r.height; });
      if (!rs.length) return null;
      var H = el.getBoundingClientRect(), first = rs[0], last = rs[rs.length - 1], P = 9;
      var svg = tbSvg('svg', { 'class': 'pm-sr-marks', 'aria-hidden': 'true', width: H.width, height: H.height }, el);
      mark(svg, Math.round(first.left - H.left - P) + 0.5, Math.round(first.top - H.top) - 2, Math.round(first.bottom - H.top) + 2, 1);
      var b = mark(svg, Math.round(last.right - H.left + P) + 0.5, Math.round(last.top - H.top) - 2, Math.round(last.bottom - H.top) + 2, -1);
      b.style.display = 'none';
      return { svg: svg, end: b };
    }
    var queue = [], busy = false;
    function next() {
      if (busy || !queue.length) return;
      busy = true;
      var it = queue.shift(), chars = it.chars, t = 0, m = marks(it.el);
      chars.forEach(function (c, i) {
        if (i && c.word !== chars[i - 1].word) t += WORD;
        setTimeout(function () { c.el.classList.add('is-on'); }, t);
        if (i < chars.length - 1) t += LETTER;
      });
      if (m) { setTimeout(function () { m.end.style.display = ''; }, t); setTimeout(function () { m.svg.remove(); }, t + 220); }
      setTimeout(function () { busy = false; next(); }, t + LETTER + GAP);
    }
    // the observer watches the title's text, not the h2: in some layouts an h2 stretches to its column's height
    var items = titles.map(function (el) { var s = split(el); return { el: el, chars: s.chars, t: s.wrap }; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting || e.boundingClientRect.bottom > 0) return;
        io.unobserve(e.target);
        e.target.querySelectorAll('.pm-sr-ch').forEach(function (c) { c.classList.add('is-on'); });
      });
      entries.filter(function (e) { return e.isIntersecting; })
        .map(function (e) { return items.filter(function (it) { return it.t === e.target; })[0]; })
        .sort(function (a, b) { return titles.indexOf(a.el) - titles.indexOf(b.el); })
        .forEach(function (it) { io.unobserve(it.t); queue.push(it); });
      next();
    }, { rootMargin: '0px 0px -12% 0px', threshold: 1 });
    items.forEach(function (it) { io.observe(it.t); });
  }


  /* ---- number pop-in for any figure ----
     pmShell.numPop(container, figureSelector): splits each figure into characters and plays the pop-in when the
     container scrolls into view, each figure a beat after the one before it. Screen readers get the figure from aria-label. */
  function numPop(container, selector) {
    if (!container || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var figs = container.querySelectorAll(selector);
    figs.forEach(function (b, n) {
      var text = b.textContent;
      b.setAttribute('aria-label', text);
      b.textContent = '';
      Array.from(text).forEach(function (ch, i) {
        var s = document.createElement('span');
        s.className = 'pm-num-pop__ch';
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--np-i', i);
        s.textContent = ch;
        b.appendChild(s);
      });
      b.classList.remove('is-animating');
      b.classList.add('pm-num-pop');
      b.style.setProperty('--np-base', (250 + n * 140) + 'ms');
    });
    function play() { figs.forEach(function (b) { b.classList.add('is-animating'); }); }
    if (!window.IntersectionObserver) { play(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { play(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(container);
  }


  /* ---- figures that take their color from the glows ----
     pmShell.colorSlots(): every [data-color-slot] element (the Lab page layout: stat0-2 in the stat bar, step0-3 in the
     steps) is tinted between coral and cyan by how close the glows ([data-blob-role="coral"|"cyan"]) are on
     desktop, and from coral toward the text color by depth on phones. Anchors are where each slot sits relative to the
     glows; pass your own for another layout. Colors switch to the theme's text tokens in light (see mixColor). */
  var LAB_ANCHORS = {
    desktop: { stat0: [-160, 0], stat1: [0, 0], stat2: [160, 0], step0: [-80, -210], step1: [-80, -70], step2: [-80, 70], step3: [-80, 210] },
    mobile: { stat0: 260, stat1: 290, stat2: 320, step0: 480, step1: 610, step2: 740, step3: 870 }
  };
  // case-study pages with three method steps instead of four
  var THREE_STEP_ANCHORS = {
    desktop: { stat0: [-160, 0], stat1: [0, 0], stat2: [160, 0], step0: [-80, -140], step1: [-80, 0], step2: [-80, 140] },
    mobile: { stat0: 260, stat1: 290, stat2: 320, step0: 480, step1: 610, step2: 740 }
  };
  var ANCHOR_PRESETS = { lab: LAB_ANCHORS, 'three-steps': THREE_STEP_ANCHORS };
  function colorSlots(anchors) {
    if (typeof anchors === 'string') anchors = ANCHOR_PRESETS[anchors];
    anchors = anchors || LAB_ANCHORS;
    var coralGroup = document.querySelector('[data-blob-role="coral"]');
    var cyanGroup = document.querySelector('[data-blob-role="cyan"]');
    var els = document.querySelectorAll('[data-color-slot]');
    if (!els.length) return;
    var mqDesktop = window.matchMedia('(min-width: 861px)');
    var CORAL = [255, 106, 76], CYAN = [69, 224, 255], INK = [243, 241, 236];
    function desktopColor(pos) {
      var coral = (coralGroup && coralGroup.blobState) || { tx: 0, ty: 0 };
      var cyan = (cyanGroup && cyanGroup.blobState) || { tx: 0, ty: 0 };
      var dCoral = Math.hypot(pos[0] - (200 + coral.tx), pos[1] - coral.ty) + 1;
      var dCyan = Math.hypot(pos[0] - (-200 + cyan.tx), pos[1] - cyan.ty) + 1;
      var wCoral = 1 / (dCoral * dCoral), wCyan = 1 / (dCyan * dCyan);
      return mixColor(CORAL, CYAN, wCyan / (wCoral + wCyan));
    }
    function mobileColor(depth) {
      var coral = (coralGroup && coralGroup.blobState) || { ty: 0 };
      return mixColor(CORAL, INK, Math.min(1, Math.max(0, depth - (40 + coral.ty)) / 700));
    }
    function update() {
      var desktop = mqDesktop.matches;
      els.forEach(function (el) {
        var slot = el.getAttribute('data-color-slot');
        var a = desktop ? anchors.desktop[slot] : anchors.mobile[slot];
        if (a === undefined) return;
        el.style.color = desktop ? desktopColor(a) : mobileColor(a);
      });
    }
    update();                                   // the glows are placed once, so once is enough (and on resize)
    window.addEventListener('resize', update);
  }

  // ---- Standard footer ----
  // Every product uses the same footer, written here so it changes in one place. Put
  // <footer class="pm-site-footer" data-pm-footer></footer> on the page; this fills it in. The logos are inlined
  // (the build copies them from logos/logos.svg), so a product needs no sprite copy for the footer.
  var FOOTER_LOGOS = {"figma":{"viewBox":"0 0 24 24","inner":"<path d=\"M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z\"/>"},"claude":{"viewBox":"0 0 24 24","inner":"<path d=\"m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z\"/>"},"github":{"viewBox":"0 0 24 24","inner":"<path d=\"M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12\"/>"},"googlecloud":{"viewBox":"0 0 24 24","inner":"<path d=\"M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-2.821-4.552l-.043.043.006-.05A9.344 9.344 0 0 0 12.19 2.38zm-.358 4.146c1.244-.04 2.518.368 3.486 1.15a5.186 5.186 0 0 1 1.862 4.078v.518c3.53-.07 3.53 5.262 0 5.193h-5.193l-.008.009v-.04H6.785a2.59 2.59 0 0 1-1.067-.23h.001a2.597 2.597 0 1 1 3.437-3.437l3.013-3.012A6.747 6.747 0 0 0 8.11 8.24c.018-.01.04-.026.054-.023a5.186 5.186 0 0 1 3.67-1.69z\"/>"},"vercel":{"viewBox":"0 0 24 24","inner":"<path d=\"m12 1.608 12 20.784H0Z\"/>"},"human":{"viewBox":"5 1.5 14 21.5","inner":"<circle cx=\"12\" cy=\"4.2\" r=\"2.4\"/><path d=\"M9.2 8h5.6c1.2 0 2.2 1 2.2 2.2V15h-1.7v7h-3.1v-5.6h-1.4V22H8.7v-7H7v-4.8C7 9 8 8 9.2 8z\"/>"}};
  function footerLogo(name, extra) {
    var l = FOOTER_LOGOS[name];
    if (!l) return '';
    return '<svg class="pm-site-footer__logo' + (extra ? ' ' + extra : '') + '" viewBox="' + l.viewBox + '" aria-hidden="true" focusable="false">' + l.inner + '</svg>';
  }
  function initFooter() {
    document.querySelectorAll('footer[data-pm-footer]').forEach(function (f) {
      f.classList.add('pm-site-footer');
      // optional extra tools a product uses: <footer data-pm-footer data-pm-footer-tools="google-cloud">
      var tools = (f.getAttribute('data-pm-footer-tools') || '').split(/\s+/);
      var built = tools.indexOf('google-cloud') >= 0
        ? footerLogo('figma') + ' Figma, ' + footerLogo('claude') + ' Claude and ' + footerLogo('googlecloud') + ' Google Cloud'
        : footerLogo('figma') + ' Figma and ' + footerLogo('claude') + ' Claude';
      f.innerHTML = '<div class="pm-site-footer__inner">' +
        '<span>\u00a9 Alex Grinyayev \u00b7 ' + new Date().getFullYear() + '</span>' +
        '<span>Built with ' + built + ', source on ' + footerLogo('github') +
        ' GitHub, deployed on ' + footerLogo('vercel') + ' Vercel. Validated by ' + footerLogo('human', 'pm-site-footer__logo--human') + ' human.</span>' +
        '</div>';
    });
  }

  // ---- Image modal ----
  // Buttons with data-modal-src open the picture in a shared <dialog class="pm-modal"> (data-modal-alt is its alt text).
  // showModal() gives the focus trap, Escape, the inert page and focus return; a click on the dim backdrop also closes.
  // The page can keep its own dialog: give it id="pmImageModal" with an img.pm-modal__img and a .pm-modal__close.
  var imageModal = null;
  function getImageModal() {
    if (imageModal) return imageModal;
    var dlg = document.getElementById('pmImageModal');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'pmImageModal';
      dlg.className = 'pm-modal';
      dlg.setAttribute('aria-label', 'Enlarged image');
      dlg.innerHTML = '<button type="button" class="pm-modal__close" aria-label="Close">' +
        '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
        '<div class="pm-modal__body"><img class="pm-modal__img" alt=""></div>';
      document.body.appendChild(dlg);
    }
    var close = dlg.querySelector('.pm-modal__close');
    if (close) close.addEventListener('click', function () { dlg.close(); });
    // a click outside the picture (on the backdrop or the empty dialog area) closes it
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    imageModal = dlg;
    return dlg;
  }
  function openImage(src, alt) {
    var dlg = getImageModal();
    var img = dlg.querySelector('.pm-modal__img');
    img.src = src;
    img.alt = alt || '';
    if (alt) dlg.setAttribute('aria-label', alt);
    if (!dlg.open) dlg.showModal();
  }
  /* ---- zoom in the image modal ----
     A fitted picture is often too small to read (a journey map, a diagram), so:
     - click or tap the picture: fitted <-> full size (at least twice the fitted size), keeping the clicked spot
       under the pointer;
     - Ctrl + / Ctrl - (Cmd on a Mac), Ctrl + scroll or a trackpad pinch: zoom in and out in steps; Ctrl 0 fits it again.
       While the modal is open these zoom the picture, not the page;
     - drag with the mouse (or swipe) to move around; Escape or closing the modal resets it. */
  function initImageZoom() {
    var drag = null, STEP = 1.4;
    function openDialog() { return document.querySelector('.pm-modal[open]'); }
    function parts(dlg) { return { img: dlg.querySelector('.pm-modal__img'), body: dlg.querySelector('.pm-modal__body') }; }
    function ready(dlg) { if (!dlg.__zoomReady) { dlg.__zoomReady = true; dlg.addEventListener('close', function () { fit(dlg); }); } }
    function fit(dlg) { var p = parts(dlg); dlg.classList.remove('is-zoomed'); dlg.__fitW = 0; if (p.img) p.img.style.width = ''; }
    // zoom to width w; (ax, ay) is the screen point that stays put (default: the middle of the view)
    function zoomTo(dlg, w, ax, ay) {
      var p = parts(dlg); if (!p.img || !p.body) return;
      ready(dlg);
      if (!dlg.classList.contains('is-zoomed')) dlg.__fitW = p.img.getBoundingClientRect().width;
      var fitW = dlg.__fitW, max = Math.max((p.img.naturalWidth || fitW) * 2, fitW * 4);
      if (w <= fitW * 1.02) { fit(dlg); return; }
      w = Math.min(w, max);
      var r = p.img.getBoundingClientRect();
      if (ax === undefined) { var c = dlg.classList.contains('is-zoomed') ? p.body.getBoundingClientRect() : r; ax = c.left + c.width / 2; ay = c.top + c.height / 2; }
      var fx = (ax - r.left) / r.width, fy = (ay - r.top) / r.height;
      dlg.classList.add('is-zoomed');
      p.img.style.width = Math.round(w) + 'px';
      var b = p.body.getBoundingClientRect();
      p.body.scrollLeft = fx * p.img.offsetWidth - (ax - b.left);
      p.body.scrollTop = fy * p.img.offsetHeight - (ay - b.top);
    }
    function current(dlg) { var p = parts(dlg); return p.img ? p.img.getBoundingClientRect().width : 0; }
    document.addEventListener('click', function (e) {
      // the end of a drag is not a click (and must not reach the click-outside-to-close)
      if (drag && drag.moved) { e.stopPropagation(); e.preventDefault(); return; }
      var img = e.target.closest && e.target.closest('.pm-modal__img');
      if (!img) return;
      var dlg = img.closest('.pm-modal');
      if (!dlg) return;
      if (dlg.classList.contains('is-zoomed')) { fit(dlg); return; }
      zoomTo(dlg, Math.max(img.naturalWidth || 0, img.getBoundingClientRect().width * 2), e.clientX, e.clientY);
    }, true);
    document.addEventListener('keydown', function (e) {
      var dlg = openDialog();
      if (!dlg || !(e.ctrlKey || e.metaKey) || !parts(dlg).img) return;
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomTo(dlg, current(dlg) * STEP); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomTo(dlg, current(dlg) / STEP); }
      else if (e.key === '0') { e.preventDefault(); fit(dlg); }
    });
    document.addEventListener('wheel', function (e) {                   // Ctrl + wheel, and a trackpad pinch
      var dlg = openDialog();
      if (!dlg || !e.ctrlKey || !parts(dlg).img) return;
      e.preventDefault();
      zoomTo(dlg, current(dlg) * Math.exp(-e.deltaY * 0.004), e.clientX, e.clientY);
    }, { passive: false });
    document.addEventListener('pointerdown', function (e) {             // mouse drag pans; touch scrolls natively
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      var body = e.target.closest && e.target.closest('.pm-modal.is-zoomed .pm-modal__body');
      if (!body) return;
      drag = { body: body, x: e.clientX, y: e.clientY, sl: body.scrollLeft, st: body.scrollTop, moved: false };
      e.preventDefault();
    });
    document.addEventListener('pointermove', function (e) {
      if (!drag || drag.done) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; drag.body.classList.add('is-dragging'); }
      drag.body.scrollLeft = drag.sl - dx; drag.body.scrollTop = drag.st - dy;
    });
    document.addEventListener('pointerup', function () {
      if (!drag) return;
      drag.body.classList.remove('is-dragging'); drag.done = true;
      var d = drag; setTimeout(function () { if (drag === d) drag = null; }, 0);   // the click that follows still sees .moved
    });
  }

  function initImageModal() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-modal-src]');
      if (!btn) return;
      e.preventDefault();
      openImage(btn.getAttribute('data-modal-src'), btn.getAttribute('data-modal-alt'));
    });
  }

  var started = false;
  function init() {
    if (started) return;
    started = true;
    initFooter();
    initMobileMenu();
    initThemeToggle();
    initScrollProgress();
    initBlobDrift();
    initMagnetic();
    initMailtoCopy();
    initBackdropLines();
    initTitleBuild();
    initSerifTitles();
    initImageModal();
    initImageZoom();
    // the shared stat bar's figures pop in when it scrolls into view; a page that fills them later marks the bar
    // data-num-pop="manual" and calls pmShell.numPop(bar, '.pm-stat__value') once the numbers are in
    document.querySelectorAll('.pm-page .pm-stat-bar:not([data-num-pop="manual"])').forEach(function (bar) { numPop(bar, '.pm-stat__value'); });
    // <body data-color-slots> uses the Lab layout's anchors; data-color-slots="three-steps" the three-step case-study layout
    if (document.body.hasAttribute('data-color-slots')) colorSlots(document.body.getAttribute('data-color-slots'));
  }
  function boot() { setTimeout(init, 0); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return { init: init, rand: rand, mixColor: mixColor, numPop: numPop, colorSlots: colorSlots, openImage: openImage, buildTitle: buildTitle };
})();
