/* ==========================================================================
   Baby’s Birthday — app logic
   One page, five "screens". Because the page never reloads, the music keeps
   playing while she moves from screen to screen.
   ========================================================================== */
(() => {
  'use strict';

  const cfg = window.BIRTHDAY_CONFIG;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (name, attrs = {}) => {
    const el = document.createElementNS(SVGNS, name);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  /* ------------------------------------------------------------ Fill text */
  $$('[data-name]').forEach((el) => (el.textContent = cfg.name));

  /* ------------------------------------------------------------ Router */
  const screens = $$('.screen');
  const TOTAL = screens.length;
  let current = 0;

  function show(n) {
    if (n < 1 || n > TOTAL) n = 1;
    current = n;
    screens.forEach((s, i) => {
      const p = i + 1;
      s.classList.toggle('active', p === n);
      s.classList.toggle('before', p < n);
      s.classList.toggle('after', p > n);
      s.inert = p !== n;
      s.setAttribute('aria-hidden', String(p !== n));
    });
    screens[n - 1].scrollTop = 0;
    if (n !== 3) closeLightbox();
  }

  function go(n) {
    if (n === current) return;
    location.hash = '#/' + n;
  }

  window.addEventListener('hashchange', () => {
    const m = location.hash.match(/^#\/(\d)$/);
    show(m ? +m[1] : 1);
  });

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (b) go(+b.dataset.go);
  });

  /* ------------------------------------------------------------ Music */
  const audio = $('#bgm');
  const musicBtn = $('#music');
  const musicLabel = $('#music-label');
  audio.src = cfg.music;
  let fadeTimer;

  function fadeTo(target, ms, then) {
    clearInterval(fadeTimer);
    const start = audio.volume, steps = 20;
    let i = 0;
    fadeTimer = setInterval(() => {
      i++;
      audio.volume = Math.min(1, Math.max(0, start + (target - start) * (i / steps)));
      if (i >= steps) { clearInterval(fadeTimer); if (then) then(); }
    }, ms / steps);
  }

  function playMusic() {
    audio.volume = 0;
    const p = audio.play();
    if (p && p.then) {
      p.then(() => fadeTo(cfg.musicVolume, 1400)).catch(() => {
        musicBtn.classList.add('error');
        musicLabel.textContent = 'Music file not found';
        setTimeout(() => { musicBtn.classList.remove('error'); musicLabel.textContent = 'Play music'; }, 3500);
      });
    }
  }
  function pauseMusic() { fadeTo(0, 500, () => audio.pause()); }

  musicBtn.addEventListener('click', () => {
    musicBtn.classList.add('touched');
    audio.paused ? playMusic() : pauseMusic();
  });
  audio.addEventListener('play', () => {
    document.body.classList.add('playing');
    musicBtn.setAttribute('aria-pressed', 'true');
    musicBtn.setAttribute('aria-label', 'Pause music');
    musicLabel.textContent = 'Pause music';
  });
  audio.addEventListener('pause', () => {
    document.body.classList.remove('playing');
    musicBtn.setAttribute('aria-pressed', 'false');
    musicBtn.setAttribute('aria-label', 'Play music');
    musicLabel.textContent = 'Play music';
  });

  /* ------------------------------------------------------------ Page 1: countdown */
  const target = new Date(cfg.birthday).getTime();
  const pad = (n) => String(n).padStart(2, '0');
  const cd = { d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s') };
  const note = $('#cd-note');
  // Show the date exactly as written in the config (avoids timezone shifts)
  const m = cfg.birthday.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    note.textContent = `until ${+m[3]} ${months[+m[2] - 1]} ${m[1]}`;
  }

  function tick() {
    const diff = Math.max(0, target - Date.now());
    const s = Math.floor(diff / 1000);
    cd.d.textContent = pad(Math.floor(s / 86400));
    cd.h.textContent = pad(Math.floor((s % 86400) / 3600));
    cd.m.textContent = pad(Math.floor((s % 3600) / 60));
    cd.s.textContent = pad(s % 60);
    if (diff === 0) note.textContent = 'Today is your day 💜';
  }
  tick();
  setInterval(tick, 1000);

  /* Passcode gate: the only way past page 1 */
  const gate = $('#gate'), pass = $('#pass'), gateMsg = $('#gate-msg'), gateLabel = $('#gate-label'), beginBtn = $('#begin');
  let unlocked = false;

  pass.addEventListener('input', () => {
    pass.value = pass.value.replace(/\D/g, '').slice(0, 4);
    gateMsg.textContent = '';
  });

  gate.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!unlocked) {
      if (pass.value !== String(cfg.passcode)) {
        gateMsg.textContent = 'That’s not it — try again 💜';
        pass.value = '';
        gate.classList.remove('shake'); void gate.offsetWidth; gate.classList.add('shake');
        pass.focus();
        return;
      }
      unlocked = true;
      gate.classList.add('unlocked');
      gateLabel.textContent = 'Welcome back 💜';
      beginBtn.textContent = 'Begin';
      pass.blur();
    }
    // This tap is the user gesture that lets the browser start the song
    if (cfg.startMusicOnBegin && audio.paused) { musicBtn.classList.add('touched'); playMusic(); }
    go(2);
  });

  /* ------------------------------------------------------------ Page 2: letter */
  const envelope = $('#envelope');
  const letter = $('#letter');
  const envHint = $('#env-hint');
  const continue2 = $('#continue-2');
  let letterTimers = [];

  (function buildLetter() {
    const L = cfg.letter;
    const greeting = $('#letter-greeting');
    greeting.textContent = L.greeting;
    greeting.style.setProperty('--i', 0);
    const body = $('#letter-body');
    L.paragraphs.forEach((t, i) => {
      const p = document.createElement('p');
      p.textContent = t;
      p.style.setProperty('--i', i + 1);
      body.appendChild(p);
    });
    const n = L.paragraphs.length;
    const closing = $('#letter-closing');
    closing.textContent = L.closing; closing.style.setProperty('--i', n + 1);
    const sig = $('#letter-signature');
    sig.textContent = L.signature; sig.style.setProperty('--i', n + 2);
  })();

  function openEnvelope() {
    if (envelope.classList.contains('open')) return;
    envelope.classList.add('open');
    envHint.classList.add('hide');
    const later = (fn, ms) => letterTimers.push(setTimeout(fn, ms));
    later(() => envelope.classList.add('gone'), 1700);
    later(() => {
      envelope.hidden = true;
      letter.hidden = false;
      screens[1].scrollTop = 0;
    }, 2250);
    later(() => { continue2.hidden = false; }, 2250 + 600 * (cfg.letter.paragraphs.length + 2) + 800);
  }
  envelope.addEventListener('click', openEnvelope);

  function resetLetter() {
    letterTimers.forEach(clearTimeout); letterTimers = [];
    envelope.classList.remove('open', 'gone');
    envelope.hidden = false;
    letter.hidden = true;
    continue2.hidden = true;
    envHint.classList.remove('hide');
  }

  /* ------------------------------------------------------------ Page 3: gallery + lightbox */
  const gallery = $('#gallery');
  const rotations = [-3, 2.5, -1.5, 3, -2.5, 1.5, -3.5, 2];
  const FALLBACK = 'assets/images/placeholder.svg';

  cfg.photos.forEach((ph, i) => {
    const li = document.createElement('li');
    li.style.setProperty('--i', i);
    li.style.setProperty('--r', rotations[i % rotations.length] + 'deg');
    const btn = document.createElement('button');
    btn.className = 'polaroid';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open photo: ' + ph.caption);
    btn.style.setProperty('--r', rotations[i % rotations.length] + 'deg');
    const frame = document.createElement('span'); frame.className = 'photo';
    const img = document.createElement('img');
    img.src = ph.src; img.alt = ph.caption; img.loading = 'lazy'; img.decoding = 'async';
    img.addEventListener('error', () => { img.src = FALLBACK; }, { once: true });
    frame.appendChild(img);
    const cap = document.createElement('span'); cap.className = 'cap'; cap.textContent = ph.caption;
    btn.append(frame, cap);
    btn.addEventListener('click', () => openLightbox(i));
    li.appendChild(btn);
    gallery.appendChild(li);
  });

  const lb = $('#lightbox'), lbFig = $('#lb-fig'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbCount = $('#lb-count');
  let lbIndex = 0, lbOpener = null;

  function fillLightbox(i) {
    const ph = cfg.photos[i];
    lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = FALLBACK; };
    lbImg.src = ph.src; lbImg.alt = ph.caption;
    lbCap.textContent = ph.caption;
    lbCount.textContent = `${i + 1} / ${cfg.photos.length}`;
  }
  function openLightbox(i) {
    lbIndex = i; lbOpener = document.activeElement;
    fillLightbox(i);
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('open'));
    $('#lb-close').focus();
  }
  function closeLightbox() {
    if (lb.hidden) return;
    lb.classList.remove('open');
    setTimeout(() => { lb.hidden = true; }, 350);
    if (lbOpener && lbOpener.focus) lbOpener.focus();
  }
  function stepLightbox(d) {
    const n = cfg.photos.length;
    lbIndex = (lbIndex + d + n) % n;
    lbFig.classList.add('swap');
    setTimeout(() => { fillLightbox(lbIndex); lbFig.classList.remove('swap'); }, 220);
  }
  $('#lb-close').addEventListener('click', closeLightbox);
  $('#lb-prev').addEventListener('click', () => stepLightbox(-1));
  $('#lb-next').addEventListener('click', () => stepLightbox(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
    touchX = null;
  });

  /* ------------------------------------------------------------ Page 4: reason cards */
  const cardsEl = $('#cards');
  const surpriseBtn = $('#surprise-btn');

  cfg.reasons.forEach((r, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.style.setProperty('--i', i);
    wrap.innerHTML = `
      <button class="card-btn" type="button" aria-pressed="false">
        <span class="card-inner">
          <span class="face front glass">
            <span class="icon" aria-hidden="true"></span>
            <h3></h3>
            <span class="tap">Tap to open</span>
          </span>
          <span class="face back glass">
            <h3></h3>
            <span class="msg"></span>
          </span>
        </span>
      </button>`;
    $('.icon', wrap).textContent = r.icon;
    $$('h3', wrap).forEach((h) => (h.textContent = r.title));
    $('.msg', wrap).textContent = r.text;
    const btn = $('.card-btn', wrap);
    btn.addEventListener('click', () => {
      const flipped = wrap.classList.toggle('flipped');
      btn.setAttribute('aria-pressed', String(flipped));
      surpriseBtn.classList.toggle('ready', $$('.card.flipped').length === cfg.reasons.length);
    });
    cardsEl.appendChild(wrap);
  });

  function resetCards() {
    $$('.card.flipped').forEach((c) => c.classList.remove('flipped'));
    $$('.card-btn').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    surpriseBtn.classList.remove('ready');
  }

  /* ------------------------------------------------------------ Page 5: cake */
  const cake = $('#cake');
  const hint = $('#cake-hint');
  const finalEl = $('#final');
  let lit = true;

  (function buildCake() {
    const deco = $('#cake-deco');
    const candles = $('#cake-candles');

    // Frosting drips along the top edge of each tier
    [[98, 92, 124, '#ffffff'], [64, 140, 192, '#ffe9f3'], [34, 196, 252, '#f3eaff']].forEach(([x, y, w, col]) => {
      deco.appendChild(svgEl('rect', { x, y, width: w, height: 13, rx: 6, fill: col }));
      const count = Math.floor(w / 24);
      for (let i = 0; i < count; i++) {
        const cx = x + 12 + i * ((w - 24) / (count - 1));
        const len = 10 + ((i * 7) % 4) * 5;
        deco.appendChild(svgEl('rect', { x: cx - 5, y: y + 4, width: 10, height: len + 6, rx: 5, fill: col }));
      }
    });

    // Sprinkles on the bottom tier
    const sprinkleCols = ['#ffffff', '#ff9ec8', '#8e63cf', '#ffe3a3', '#b8e8ff'];
    for (let i = 0; i < 30; i++) {
      const x = 48 + ((i * 53) % 224), y = 226 + ((i * 29) % 38);
      deco.appendChild(svgEl('rect', {
        x, y, width: 9, height: 3.4, rx: 1.7, fill: sprinkleCols[i % 5],
        transform: `rotate(${(i * 47) % 180} ${x + 4.5} ${y + 1.7})`, opacity: .9
      }));
    }

    // Little hearts on the middle tier
    for (let i = 0; i < 5; i++) {
      const t = svgEl('text', { x: 92 + i * 34, y: 188, 'font-size': 18, fill: '#fff', 'text-anchor': 'middle', opacity: .9 });
      t.textContent = '♥';
      deco.appendChild(t);
    }

    // Candles (flames are lit on load)
    [116, 138, 160, 182, 204].forEach((x, i) => {
      const g = svgEl('g');
      g.appendChild(svgEl('rect', { x: x - 3.5, y: 62, width: 7, height: 31, rx: 2.5, fill: i % 2 ? '#ffd1e6' : '#ffffff' }));
      [68, 78, 88].forEach((yy) => g.appendChild(svgEl('rect', { x: x - 3.5, y: yy, width: 7, height: 3, fill: i % 2 ? '#f08fbd' : '#c9a8f2', opacity: .75 })));
      g.appendChild(svgEl('line', { x1: x, y1: 62, x2: x, y2: 56, stroke: '#6a4a8a', 'stroke-width': 1.5, 'stroke-linecap': 'round' }));

      const pos = svgEl('g', { transform: `translate(${x} 50)` });
      pos.appendChild(svgEl('circle', { class: 'flame-glow', r: 24, cy: -2, fill: 'url(#gGlow)' }));
      const flame = svgEl('g', { class: 'flame' });
      flame.style.setProperty('--d', (i * -0.23) + 's');
      flame.appendChild(svgEl('path', { d: 'M0 -17 C5 -9 7 -3 0 4 C-7 -3 -5 -9 0 -17 Z', fill: 'url(#gFlame)' }));
      flame.appendChild(svgEl('ellipse', { cx: 0, cy: -1, rx: 2.2, ry: 4, fill: '#fffdf0', opacity: .9 }));
      pos.appendChild(flame);
      const smoke = svgEl('path', { class: 'smoke', d: 'M0 0 q-6 -8 0 -15 q6 -8 0 -16' });
      smoke.style.setProperty('--d', (i * .08) + 's');
      pos.appendChild(smoke);
      g.appendChild(pos);
      candles.appendChild(g);
    });
  })();

  function toggleCandles() {
    const rect = cake.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height * 0.28;
    if (lit) {
      lit = false;
      cake.classList.add('out');
      hint.textContent = 'Tap again to relight the candles';
      finalEl.classList.add('show');
      setTimeout(() => finalEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }), 900);
    } else {
      lit = true;
      cake.classList.remove('out');
      hint.textContent = 'Tap the cake and make a wish';
    }
    celebrate(x, y);
  }
  cake.addEventListener('click', toggleCandles);
  cake.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCandles(); } });

  (function buildFinal() {
    const card = $('#final-card');
    cfg.finalMessage.paragraphs.forEach((t) => {
      const p = document.createElement('p'); p.textContent = t; card.appendChild(p);
    });
    const s = document.createElement('p'); s.className = 'sig'; s.textContent = cfg.finalMessage.signature; card.appendChild(s);
  })();

  function resetCake() {
    lit = true;
    cake.classList.remove('out');
    hint.textContent = 'Tap the cake and make a wish';
    finalEl.classList.remove('show');
  }

  /* ------------------------------------------------------------ Restart */
  $('#restart').addEventListener('click', () => {
    go(1);
    setTimeout(() => { resetLetter(); resetCards(); resetCake(); closeLightbox(); }, 1000);
  });

  /* ------------------------------------------------------------ Floating hearts */
  const heartsLayer = $('#hearts');
  const heartColors = ['#f6b4d4', '#cdb6f5', '#ffffff', '#f08fbd', '#b48fe8'];

  function spawnHeart({ x, bottom, burst = false } = {}) {
    const h = document.createElement('span');
    h.className = 'heart';
    h.textContent = '♥';
    const size = burst ? 16 + Math.random() * 26 : 12 + Math.random() * 20;
    h.style.setProperty('--x', (x ?? Math.random() * 100) + (x === undefined ? 'vw' : 'px'));
    h.style.setProperty('--s', size + 'px');
    h.style.setProperty('--c', pick(heartColors));
    h.style.setProperty('--t', (burst ? 5 + Math.random() * 4 : 11 + Math.random() * 9) + 's');
    h.style.setProperty('--w', (Math.random() * 50 + 10) + 'px');
    h.style.setProperty('--o', (burst ? .95 : .35 + Math.random() * .4).toFixed(2));
    if (bottom !== undefined) h.style.bottom = bottom + 'px';
    h.addEventListener('animationend', () => h.remove());
    heartsLayer.appendChild(h);
  }

  if (!reduceMotion) {
    for (let i = 0; i < 5; i++) setTimeout(() => spawnHeart(), i * 600);
    setInterval(() => {
      if (!document.hidden && heartsLayer.childElementCount < 16) spawnHeart();
    }, 1100);
  }

  /* ------------------------------------------------------------ Twinkling stars */
  const sc = $('#stars'), sctx = sc.getContext('2d');
  let W, H, stars = [], shooting = null, nextShoot = performance.now() + 5000;

  function sizeStars() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    sc.width = W * dpr; sc.height = H * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(190, Math.round((W * H) / 8500));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.3 + .3, p: Math.random() * 6.28, s: Math.random() * 1.4 + .4,
      c: pick(['255,255,255', '255,255,255', '246,200,225', '215,195,250'])
    }));
    if (reduceMotion) drawStars(0);
  }

  function drawStars(t) {
    sctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = reduceMotion ? .7 : .3 + .7 * (.5 + .5 * Math.sin(t / 1000 * s.s + s.p));
      sctx.globalAlpha = a;
      sctx.fillStyle = `rgb(${s.c})`;
      sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, 6.2832); sctx.fill();
      if (s.r > 1.2) { // tiny four-point sparkle on the brightest stars
        sctx.strokeStyle = `rgba(${s.c},${a * .6})`; sctx.lineWidth = .6;
        sctx.beginPath();
        sctx.moveTo(s.x - s.r * 4, s.y); sctx.lineTo(s.x + s.r * 4, s.y);
        sctx.moveTo(s.x, s.y - s.r * 4); sctx.lineTo(s.x, s.y + s.r * 4);
        sctx.stroke();
      }
    }
    if (shooting) {
      const k = (t - shooting.t0) / 1100;
      if (k >= 1) { shooting = null; }
      else {
        const x = shooting.x + shooting.dx * k, y = shooting.y + shooting.dy * k;
        const g = sctx.createLinearGradient(x, y, x - shooting.dx * .18, y - shooting.dy * .18);
        g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        sctx.globalAlpha = 1 - k * k; sctx.strokeStyle = g; sctx.lineWidth = 1.8;
        sctx.beginPath(); sctx.moveTo(x, y); sctx.lineTo(x - shooting.dx * .18, y - shooting.dy * .18); sctx.stroke();
      }
    }
    sctx.globalAlpha = 1;
  }

  function starLoop(t) {
    if (!document.hidden) {
      if (!shooting && t > nextShoot) {
        shooting = { t0: t, x: Math.random() * W * .7, y: Math.random() * H * .35, dx: W * .35, dy: H * .22 };
        nextShoot = t + 7000 + Math.random() * 7000;
      }
      drawStars(t);
    }
    requestAnimationFrame(starLoop);
  }
  sizeStars();
  window.addEventListener('resize', sizeStars);
  if (!reduceMotion) requestAnimationFrame(starLoop);

  /* ------------------------------------------------------------ Confetti */
  const cc = $('#confetti'), cctx = cc.getContext('2d');
  let parts = [], cRaf = 0, cW, cH;
  const confettiColors = ['#f6b4d4', '#cdb6f5', '#ffffff', '#ffe3a3', '#f08fbd', '#a874e6', '#b8e8ff'];

  function sizeConfetti() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cW = innerWidth; cH = innerHeight;
    cc.width = cW * dpr; cc.height = cH * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeConfetti();
  window.addEventListener('resize', sizeConfetti);

  function burst(x, y, n, spread = Math.PI * 1.15, angle = -Math.PI / 2) {
    for (let i = 0; i < n; i++) {
      const a = angle + (Math.random() - .5) * spread;
      const v = 6 + Math.random() * 11;
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .2 + Math.random() * .12,
        w: 6 + Math.random() * 7, h: 4 + Math.random() * 6,
        rot: Math.random() * 6.28, vr: (Math.random() - .5) * .35,
        col: pick(confettiColors), wob: Math.random() * 10,
        shape: pick(['rect', 'rect', 'circ', 'heart']),
        life: 1, decay: .004 + Math.random() * .006
      });
    }
    if (!cRaf) cRaf = requestAnimationFrame(confettiLoop);
  }

  function confettiLoop() {
    cctx.clearRect(0, 0, cW, cH);
    parts = parts.filter((p) => p.life > 0 && p.y < cH + 40);
    for (const p of parts) {
      p.vx *= .985; p.vy = (p.vy + p.g) * .992;
      p.x += p.vx + Math.sin(p.wob += .08) * .6; p.y += p.vy;
      p.rot += p.vr; p.life -= p.decay;
      cctx.save();
      cctx.globalAlpha = Math.min(1, p.life * 2);
      cctx.translate(p.x, p.y); cctx.rotate(p.rot);
      cctx.fillStyle = p.col;
      if (p.shape === 'rect') cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      else if (p.shape === 'circ') { cctx.beginPath(); cctx.arc(0, 0, p.h / 1.6, 0, 6.2832); cctx.fill(); }
      else { cctx.font = `${p.w * 2}px sans-serif`; cctx.textAlign = 'center'; cctx.textBaseline = 'middle'; cctx.fillText('♥', 0, 0); }
      cctx.restore();
    }
    cRaf = parts.length ? requestAnimationFrame(confettiLoop) : 0;
    if (!cRaf) cctx.clearRect(0, 0, cW, cH);
  }

  function celebrate(x, y) {
    const k = reduceMotion ? .3 : 1;
    burst(x, y, Math.round(150 * k));
    if (!reduceMotion) {
      setTimeout(() => burst(cW * .12, cH * .75, 70, Math.PI * .6, -Math.PI / 3), 250);
      setTimeout(() => burst(cW * .88, cH * .75, 70, Math.PI * .6, -Math.PI * 2 / 3), 400);
      for (let i = 0; i < 18; i++) {
        setTimeout(() => spawnHeart({ x: Math.max(10, Math.min(cW - 30, x + (Math.random() - .5) * 360)), bottom: Math.random() * 120 - 30, burst: true }), i * 90);
      }
    }
  }

  /* ------------------------------------------------------------ Install as an app (PWA) */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  /* ------------------------------------------------------------ Start */
  // Always begin on page 1, even if the link has a hash or the page was refreshed.
  history.replaceState(null, '', '#/1');
  show(1);
})();
