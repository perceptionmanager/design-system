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
  var FOOTER_LOGOS = /*__PM_LOGOS__*/{};
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
    // <body data-color-slots> uses the Lab layout's anchors; data-color-slots="three-steps" the three-step case-study layout
    if (document.body.hasAttribute('data-color-slots')) colorSlots(document.body.getAttribute('data-color-slots'));
  }
  function boot() { setTimeout(init, 0); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return { init: init, rand: rand, mixColor: mixColor, numPop: numPop, colorSlots: colorSlots, openImage: openImage };
})();
