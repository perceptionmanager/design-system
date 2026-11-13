/* perceptionmanager design system — page shell behavior (shell.js).
   Pairs with shell.css. No dependencies, no build step: load it with <script src=".../shell.js" defer>.
   Each behavior switches on from markup, so a page only gets what it has:
     [data-menu-open] / [data-menu-close] / .pm-site-menu[data-menu]   mobile menu
     [data-theme-toggle]                                                theme switch (with the boot script in <head>, see docs/shell.md)
     [data-scroll-progress]                                             reading-progress bar under the header
     [data-blob-group] > [data-blob-target]                             drifting backdrop glows
     .pm-backdrop__aura + .pm-backdrop__blob--coral/--cyan              engraved line pattern inside the glows
                                                                        (off when <body data-backdrop-lines="off">)
     [data-magnetic]                                                    buttons that lean toward the pointer
     a[href^="mailto:"]                                                 copy the address too, and say so
     .pm-page h1                                                        title pop-in, character by character
     .pm-stat-bar .pm-stat__value                                       figures pop in when the bar scrolls into view
     <body data-color-slots> + [data-color-slot]                        stat and step numbers tinted by the glows (Lab layout)
   Helpers for page scripts: pmShell.numPop(container, selector) pops figures in; pmShell.colorSlots() tints
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
 
  /* ---- decorative blob drift ----
     A "blob group" is a wrapper carrying data-tx-range / data-ty-range /
     data-scale-min / data-scale-max / data-blur-min / data-blur-max /
     data-op-min / data-op-max / data-dur-min / data-dur-max, containing one
     or more [data-blob-target] elements (a .grain-clear mask + a .blob glow)
     that share one drift path, matching the original design's per-page tuning.

     How it moves: each group gets one closed, smooth random path (a looping
     Catmull-Rom spline through a handful of random waypoints), sampled into
     Web Animations keyframes. Only transform and opacity animate, so the
     browser runs it on the GPU compositor and it stays smooth even when the
     page's main thread is busy. The blur radius is fixed (the midpoint of the
     data-blur range): animating a blur is what made the old version stutter on
     slower screens, and it also stopped and restarted at every waypoint.
     Exposes the live state on the group element (group.blobState, read-only,
     recomputed on each read) so page scripts can read it. With "reduce motion"
     on, the blobs sit still at their mid position. */
  function initBlobDrift() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canAnimate = !reduced && typeof Element !== 'undefined' && Element.prototype.animate;

    document.querySelectorAll('[data-blob-group]').forEach(function (group) {
      var cfg = {
        tx: num(group, 'txRange', 150), ty: num(group, 'tyRange', 140),
        scale: [num(group, 'scaleMin', 0.55), num(group, 'scaleMax', 1.7)],
        blur: [num(group, 'blurMin', 30), num(group, 'blurMax', 130)],
        op: [num(group, 'opMin', 0.14), num(group, 'opMax', 0.6)],
        dur: [num(group, 'durMin', 4), num(group, 'durMax', 8)]
      };
      var blur = Math.round((cfg.blur[0] + cfg.blur[1]) / 2);
      var N = 7;                                           // waypoints on the loop
      var seg = (cfg.dur[0] + cfg.dur[1]) / 2;             // seconds between waypoints, so one lap is ~40s
      var period = seg * N;
      var wp = { tx: [], ty: [], scale: [], op: [] };
      for (var i = 0; i < N; i++) {
        wp.tx.push(rand(-cfg.tx, cfg.tx));
        wp.ty.push(rand(-cfg.ty, cfg.ty));
        wp.scale.push(rand(cfg.scale[0], cfg.scale[1]));
        wp.op.push(rand(cfg.op[0], cfg.op[1]));
      }
      // closed Catmull-Rom: passes through every waypoint with no stop at any of them
      function cr(pts, u) {
        var i1 = Math.floor(u) % N, f = u - Math.floor(u);
        var p0 = pts[(i1 + N - 1) % N], p1 = pts[i1], p2 = pts[(i1 + 1) % N], p3 = pts[(i1 + 2) % N];
        return 0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
      }
      function clampTo(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
      function sample(t) {                                 // t in seconds
        var u = (((t % period) + period) % period) / seg;
        return {
          tx: clampTo(cr(wp.tx, u), -cfg.tx, cfg.tx), ty: clampTo(cr(wp.ty, u), -cfg.ty, cfg.ty),
          scale: clampTo(cr(wp.scale, u), cfg.scale[0], cfg.scale[1]), op: clampTo(cr(wp.op, u), cfg.op[0], cfg.op[1]),
          blur: blur, dur: seg
        };
      }
      var mid = { tx: 0, ty: 0, scale: (cfg.scale[0] + cfg.scale[1]) / 2, op: (cfg.op[0] + cfg.op[1]) / 2, blur: blur, dur: seg };
      var targets = Array.prototype.slice.call(group.querySelectorAll('[data-blob-target]'));
      var anims = [];

      function css(st) { return 'translate(' + st.tx.toFixed(2) + 'px,' + st.ty.toFixed(2) + 'px) scale(' + st.scale.toFixed(3) + ')'; }

      // blur is fixed; transform/opacity are the only animated properties
      targets.forEach(function (el) {
        if (el.classList.contains('pm-backdrop__blob')) el.style.filter = 'blur(' + blur + 'px)';
      });

      if (canAnimate) {
        var STEP = 0.4, count = Math.ceil(period / STEP), frames = [];
        for (var k = 0; k <= count; k++) {
          var st = sample(k * STEP);
          frames.push({ transform: css(st), opacity: st.op.toFixed(3), offset: Math.min(1, k * STEP / period) });
        }
        targets.forEach(function (el) {
          el.style.willChange = 'transform, opacity';
          anims.push(el.animate(frames, { duration: period * 1000, iterations: Infinity, easing: 'linear', fill: 'both' }));
        });
      } else {
        targets.forEach(function (el) {
          el.style.transform = css(mid);
          el.style.opacity = mid.op;
        });
      }

      // live state for page scripts (read on demand; the animation clock is the single source of time)
      Object.defineProperty(group, 'blobState', {
        configurable: true,
        get: function () {
          if (!anims.length) return mid;
          var t = anims[0].currentTime;
          return sample((t == null ? 0 : Number(t)) / 1000);
        }
      });
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
     An engraved horizontal line pattern that exists only inside the lit areas of the decorative backdrop: the two
     drifting spotlights (.blob.coral / .blob.cyan) and the coloured .aura behind the page title. It is added to every
     page that has the backdrop; nothing to put in the HTML. Opt a page out with <body data-backdrop-lines="off">.
     - Spotlight position, size and brightness are read live from the animated .blob elements every frame, and the
       aura's rotation from its CSS animation, so the lines follow the light as it drifts, grows, fades and turns.
     - Visibility = proximity (strongest at a light's centre, fading to nothing at its edge) x intensity (the blob's
       live opacity). Chromatic split: a coral copy and a cyan copy of the lines, offset by brightness and speed.
     - The canvas is styled by .spotlight-lines in base.css. If that rule is not there yet (stale cached stylesheet),
       the effect simply does not start, so a half-updated deploy can never show an unstyled canvas.
     Decorative only: aria-hidden, paused when the tab is hidden or the hero is scrolled away, still frame for
     reduced motion. */
  function initBackdropLines() {
    var aura = document.querySelector('.pm-backdrop__aura');
    if (!aura || !aura.parentNode || document.body.getAttribute('data-backdrop-lines') === 'off') return;
    var canvas = document.createElement('canvas');
    canvas.className = 'pm-backdrop__lines';
    canvas.setAttribute('aria-hidden', 'true');
    aura.parentNode.insertBefore(canvas, aura.nextSibling);
    if (!canvas.getContext || getComputedStyle(canvas).position !== 'absolute') { canvas.remove(); return; }

    var ctx = canvas.getContext('2d');
    var blobs = [
      { el: document.querySelector('.pm-backdrop__blob--coral'), x: null, y: null, vx: 0, vy: 0 },
      { el: document.querySelector('.pm-backdrop__blob--cyan'), x: null, y: null, vx: 0, vy: 0 }
    ].filter(function (b) { return b.el; });
    var CORAL = 'rgb(255,106,76)', CYAN = 'rgb(69,224,255)';
    var PITCH = 4;          // px between lines
    var THICK = 1.5;        // px line thickness
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W = 0, H = 0, last = 0, raf = 0, timer = 0, lastRaf = 0, frameNo = 0, stopped = false;
    // Quality governor: on a screen that can't keep up, step the effect down instead of letting the page stutter.
    // Only irregular frame times count (a steady 30 fps is a battery-saver cap, not a struggle), and it never steps back up.
    var gov = { wait: 60, n: 0, sum: 0, sumsq: 0, tier: 0 };
    function govern(now) {
      var ms = lastRaf ? now - lastRaf : 0; lastRaf = now;
      if (!ms || ms > 250 || reduced) return;                    // first frame, or a stall from a tab switch
      if (gov.wait > 0) { gov.wait--; return; }
      gov.n++; gov.sum += ms; gov.sumsq += ms * ms;
      if (gov.n < 45) return;
      var mean = gov.sum / gov.n, sd = Math.sqrt(Math.max(0, gov.sumsq / gov.n - mean * mean));
      gov.n = gov.sum = gov.sumsq = 0;
      if (mean > 33 && sd > 4 && gov.tier < 2) {
        gov.tier++; gov.wait = 45;
        if (gov.tier === 1 && dpr > 1) { dpr = 1; resize(); }                       // 1: draw the lines at 1x
        else if (gov.tier === 2) document.documentElement.setAttribute('data-fx', 'lite');   // 2: stop the animated noise layers; lines at half rate
        // The lines are never switched off: an earlier third step hid them for good on light-theme screens with uneven frame times.
      }
    }
    var off = document.createElement('canvas'), octx = off.getContext('2d');
    var tmp = document.createElement('canvas'), tctx = tmp.getContext('2d');

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function grow(c, n) { if (c.width < n) c.width = c.height = n; }   // scratch canvases only ever grow, so no per-frame reallocation
    function auraAngle() {
      var a = aura.getAnimations ? aura.getAnimations()[0] : null;
      var t = a && a.currentTime != null ? Number(a.currentTime) : performance.now();
      return ((t % 34000) / 34000) * Math.PI * 2;
    }

    function frame(now) {
      govern(now);
      if (stopped) return;
      if (gov.tier >= 2 && !reduced && (frameNo++ & 1)) { raf = requestAnimationFrame(frame); return; }   // half rate on slow screens
      var dt = last ? Math.max(1, now - last) / 1000 : 0.016; last = now;
      var origin = canvas.getBoundingClientRect();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'lighter';

      // the coloured aura behind the title: same pattern, lines take the aura's rotating coral/cyan colours
      if (aura.offsetWidth > 4) {
        var arect = aura.getBoundingClientRect();                // centre is unaffected by the aura's rotation
        var ar = aura.offsetWidth / 2 * 0.9;
        var acx = arect.left + arect.width / 2 - origin.left, acy = arect.top + arect.height / 2 - origin.top;
        if (!(acy + ar < 0 || acy - ar > H)) {
          var asize = Math.ceil(ar * 2), apx = Math.round(asize * dpr), AI = 0.85, aoy = 1.2 + 2.2 * AI;
          grow(off, apx); grow(tmp, apx);
          octx.setTransform(1, 0, 0, 1, 0, 0); octx.globalCompositeOperation = 'source-over'; octx.clearRect(0, 0, off.width, off.height);
          octx.setTransform(dpr, 0, 0, dpr, 0, 0);
          var atop = acy - ar, ay0 = Math.floor(atop / PITCH) * PITCH, ang = auraAngle() - Math.PI / 2;
          [[CORAL, -aoy, [1, 0.15, 1, 1]], [CYAN, aoy, [0.15, 1, 0.15, 0.15]]].forEach(function (L) {
            tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.globalCompositeOperation = 'source-over'; tctx.clearRect(0, 0, tmp.width, tmp.height);
            tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            tctx.fillStyle = L[0];
            for (var y = ay0; y < atop + asize; y += PITCH) tctx.fillRect(0, y - atop + L[1], asize, THICK);
            if (tctx.createConicGradient) {          // keep this colour only where the aura is that colour
              var cg = tctx.createConicGradient(ang, ar, ar), w = L[2];
              cg.addColorStop(0, 'rgba(0,0,0,' + w[0] + ')'); cg.addColorStop(1 / 3, 'rgba(0,0,0,' + w[1] + ')');
              cg.addColorStop(2 / 3, 'rgba(0,0,0,' + w[2] + ')'); cg.addColorStop(1, 'rgba(0,0,0,' + w[3] + ')');
              tctx.globalCompositeOperation = 'destination-in'; tctx.fillStyle = cg; tctx.fillRect(0, 0, asize, asize);
            }
            octx.setTransform(1, 0, 0, 1, 0, 0); octx.globalCompositeOperation = 'lighter'; octx.drawImage(tmp, 0, 0);
            octx.setTransform(dpr, 0, 0, dpr, 0, 0);
          });
          octx.globalCompositeOperation = 'destination-in';
          var ag = octx.createRadialGradient(ar, ar, 0, ar, ar, ar);
          ag.addColorStop(0, 'rgba(0,0,0,' + AI + ')'); ag.addColorStop(0.35, 'rgba(0,0,0,' + (AI * 0.7) + ')');
          ag.addColorStop(0.7, 'rgba(0,0,0,' + (AI * 0.2) + ')'); ag.addColorStop(1, 'rgba(0,0,0,0)');
          octx.fillStyle = ag; octx.fillRect(0, 0, asize, asize);
          ctx.drawImage(off, 0, 0, apx, apx, acx - ar, acy - ar, asize, asize);
        }
      }

      // the spotlights: proximity falloff x intensity, with a chromatic split that grows with brightness and speed
      blobs.forEach(function (b) {
        var r = b.el.getBoundingClientRect();
        if (r.width < 4) return;                                // spotlight hidden at this breakpoint
        var cx = r.left + r.width / 2 - origin.left, cy = r.top + r.height / 2 - origin.top;
        var vx = b.x === null ? 0 : (cx - b.x) / dt, vy = b.y === null ? 0 : (cy - b.y) / dt;
        b.vx += (vx - b.vx) * 0.08; b.vy += (vy - b.vy) * 0.08;   // smoothed velocity, px/s
        b.x = cx; b.y = cy;
        var g0 = b.el.closest('[data-blob-group]'), op = g0 && g0.blobState ? g0.blobState.op : (parseFloat(getComputedStyle(b.el).opacity) || 0);   // live opacity from the drift path, no style read
        var I = clamp((op - 0.08) / 0.5, 0.12, 1);             // intensity from the blob's live opacity
        var R = Math.min(r.width * 0.72, 430);                 // reach of the lines
        var size = Math.ceil(R * 2);
        if (cy + R < 0 || cy - R > H) return;
        var oy = 1.2 + 2.2 * I + Math.min(4, Math.abs(b.vy) * 0.05);
        var ox = clamp(b.vx * 0.05, -4, 4);
        var px = Math.round(size * dpr);
        grow(off, px);
        octx.setTransform(1, 0, 0, 1, 0, 0); octx.globalCompositeOperation = 'source-over'; octx.clearRect(0, 0, off.width, off.height);
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
        octx.globalCompositeOperation = 'lighter';
        var top = cy - R, y0 = Math.floor(top / PITCH) * PITCH;  // lines stay locked to the page, not to the spotlight
        function lines(color, dx, dy) {
          octx.fillStyle = color;
          for (var y = y0; y < top + size; y += PITCH) octx.fillRect(dx, y - top + dy, size, THICK);
        }
        lines(CORAL, ox, -oy);
        lines(CYAN, -ox, oy);
        octx.globalCompositeOperation = 'destination-in';
        var g = octx.createRadialGradient(R, R, 0, R, R, R);
        g.addColorStop(0, 'rgba(0,0,0,' + I + ')');
        g.addColorStop(0.35, 'rgba(0,0,0,' + (I * 0.7) + ')');
        g.addColorStop(0.7, 'rgba(0,0,0,' + (I * 0.2) + ')');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        octx.fillStyle = g; octx.fillRect(0, 0, size, size);
        ctx.drawImage(off, 0, 0, px, px, cx - R, cy - R, size, size);
      });
      ctx.globalCompositeOperation = 'source-over';
      if (!reduced) raf = requestAnimationFrame(frame);
    }

    function start() {
      cancelAnimationFrame(raf); clearInterval(timer);
      if (reduced) { frame(performance.now()); timer = setInterval(function () { frame(performance.now()); }, 1500); }
      else raf = requestAnimationFrame(frame);
    }
    // pause while the tab is hidden or the page is scrolled well past the hero (the lit areas live at the top)
    var running = true;
    function gate() {
      var v = !document.hidden && window.scrollY < 1400;
      if (v && !running) { running = true; last = 0; lastRaf = 0; start(); }
      else if (!v && running) { running = false; cancelAnimationFrame(raf); clearInterval(timer); }
    }
    document.addEventListener('visibilitychange', gate);
    window.addEventListener('scroll', gate, { passive: true });
    window.addEventListener('resize', resize);
    resize(); start();
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
 
  /* ---- page title pop-in ----
     Every h1 in .pm-page gets the number pop-in (shell.css "Type motion"): characters rise, pull back and spring
     into place left to right on page load. Markup inside the title (highlighted words, split-word
     spans) is kept; only its text is wrapped. The stagger shrinks on long titles so the whole
     title lands in well under a second. Screen readers get the title from aria-label. */
  function initTitlePop() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.pm-page h1').forEach(function (h1) {
      var label = h1.textContent.replace(/\s+/g, ' ').trim();
      if (!label) return;
      var nodes = [], walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT), n;
      while ((n = walker.nextNode())) nodes.push(n);
      var count = label.replace(/\s/g, '').length;
      var stagger = Math.max(12, Math.min(40, Math.round(700 / count)));
      var i = 0;
      nodes.forEach(function (node) {
        var parts = node.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var word = document.createElement('span');
          word.className = 'pm-num-pop__word';
          Array.from(part).forEach(function (ch) {
            var c = document.createElement('span');
            c.className = 'pm-num-pop__ch';
            c.style.setProperty('--np-i', i++);
            c.textContent = ch;
            word.appendChild(c);
          });
          frag.appendChild(word);
        });
        node.parentNode.replaceChild(frag, node);
      });
      h1.setAttribute('aria-label', label);
      Array.from(h1.children).forEach(function (c) { c.setAttribute('aria-hidden', 'true'); });
      h1.classList.add('pm-num-pop', 'pm-title-pop');
      h1.style.setProperty('--np-stagger', stagger + 'ms');
      h1.style.setProperty('--np-base', '80ms');
      requestAnimationFrame(function () { h1.classList.add('is-animating'); });
    });
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
     steps) is tinted between coral and cyan by how close the drifting glows ([data-blob-role="coral"|"cyan"]) are on
     desktop, and from coral toward the text color by depth on phones. Anchors are where each slot sits relative to the
     glows; pass your own for another layout. Colors switch to the theme's text tokens in light (see mixColor). */
  var LAB_ANCHORS = {
    desktop: { stat0: [-160, 0], stat1: [0, 0], stat2: [160, 0], step0: [-80, -210], step1: [-80, -70], step2: [-80, 70], step3: [-80, 210] },
    mobile: { stat0: 260, stat1: 290, stat2: 320, step0: 480, step1: 610, step2: 740, step3: 870 }
  };
  function colorSlots(anchors) {
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
    update();
    setInterval(update, 300);
    window.addEventListener('resize', update);
  }

  // ---- Standard footer ----
  // Every product uses the same footer, written here so it changes in one place. Put
  // <footer class="pm-site-footer" data-pm-footer></footer> on the page; this fills it in. The logos are inlined
  // (the build copies them from logos/logos.svg), so a product needs no sprite copy for the footer.
  var FOOTER_LOGOS = {"figma":{"viewBox":"0 0 24 24","inner":"<path d=\"M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z\"/>"},"claude":{"viewBox":"0 0 24 24","inner":"<path d=\"m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z\"/>"},"github":{"viewBox":"0 0 24 24","inner":"<path d=\"M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12\"/>"},"vercel":{"viewBox":"0 0 24 24","inner":"<path d=\"m12 1.608 12 20.784H0Z\"/>"},"human":{"viewBox":"5 1.5 14 21.5","inner":"<circle cx=\"12\" cy=\"4.2\" r=\"2.4\"/><path d=\"M9.2 8h5.6c1.2 0 2.2 1 2.2 2.2V15h-1.7v7h-3.1v-5.6h-1.4V22H8.7v-7H7v-4.8C7 9 8 8 9.2 8z\"/>"}};
  function footerLogo(name, extra) {
    var l = FOOTER_LOGOS[name];
    if (!l) return '';
    return '<svg class="pm-site-footer__logo' + (extra ? ' ' + extra : '') + '" viewBox="' + l.viewBox + '" aria-hidden="true" focusable="false">' + l.inner + '</svg>';
  }
  function initFooter() {
    document.querySelectorAll('footer[data-pm-footer]').forEach(function (f) {
      f.classList.add('pm-site-footer');
      f.innerHTML = '<div class="pm-site-footer__inner">' +
        '<span>\u00a9 Alex Grinyayev \u00b7 ' + new Date().getFullYear() + '</span>' +
        '<span>Built with ' + footerLogo('figma') + ' Figma and ' + footerLogo('claude') + ' Claude, source on ' + footerLogo('github') +
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
    initTitlePop();
    initImageModal();
    // the shared stat bar's figures pop in when it scrolls into view; a page that fills them later marks the bar
    // data-num-pop="manual" and calls pmShell.numPop(bar, '.pm-stat__value') once the numbers are in
    document.querySelectorAll('.pm-page .pm-stat-bar:not([data-num-pop="manual"])').forEach(function (bar) { numPop(bar, '.pm-stat__value'); });
    if (document.body.hasAttribute('data-color-slots')) colorSlots();
  }
  function boot() { setTimeout(init, 0); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return { init: init, rand: rand, mixColor: mixColor, numPop: numPop, colorSlots: colorSlots, openImage: openImage };
})();
