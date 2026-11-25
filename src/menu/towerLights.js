/**
 * Tower Lights: the building at dusk; sections switch on the lights in their part of the tower.
 *   const lights = createTowerLights(hostEl, { src, width, height, regions, zones });
 *   lights.intro()           // every window switches on bottom → top, then settles to a few lit homes
 *   lights.light('edeck')    // that zone's windows flicker on, floor by floor, from the bottom up
 *   lights.light(null)       // back to the resting night
 *   lights.rest('story')     // the zone shown softly while nothing is hovered
 *   lights.destroy()
 * regions: [{ x:[x0,x1], y:[y0,y1], row, bay }]  window grid areas (image px)
 * zones:   { id: [[x0,x1,y0,y1], ...] }          which windows belong to each section (image px)
 */
export function createTowerLights(host, { src, width: IW, height: IH, regions, zones }) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas'); cv.className = 'tl-canvas';
  const g = cv.getContext('2d');
  if (!g) return null;
  const night = document.createElement('canvas'), lit = document.createElement('canvas'), bloom = document.createElement('canvas');
  night.width = lit.width = IW; night.height = lit.height = IH;
  const img = new Image();
  let ready = false, alive = true, hot = null, restId = null, raf = 0, dirty = true, k = 1, dpr = 1;

  let introPending = false, introTimer = 0;

  // the window grid
  const cells = [];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  regions.forEach((R) => {
    for (let y = R.y[0]; y + R.row * .6 <= R.y[1]; y += R.row)
      for (let x = R.x[0]; x + R.bay * .6 <= R.x[1]; x += R.bay) {
        const w = Math.min(R.bay, R.x[1] - x), h = Math.min(R.row, R.y[1] - y);
        const ix = R.street ? 0 : R.bay * .12, iy = R.street ? 0 : R.row * .16;      // keep mullions + floor slabs dark so it reads as windows
        cells.push({ x: x + ix, y: y + iy, w: w - ix * 2, h: h - iy * 2, cx: x + w / 2, cy: y + h / 2, L: 0, T: 0, at: 0, amb: !R.street && rnd() < .085, r: rnd(), warm: .72 + rnd() * .28, street: !!R.street });
      }
  });
  const inZone = (c, id) => (zones[id] || []).some(([x0, x1, y0, y1]) => c.cx >= x0 && c.cx <= x1 && c.cy >= y0 && c.cy <= y1);
  const zoneSpan = (id) => { const rs = zones[id] || [[0, 0, 0, 1]]; return [Math.min(...rs.map((r) => r[2])), Math.max(...rs.map((r) => r[3]))]; };

  img.onload = () => {
    // night: the render pushed into dusk; lit: warm, bright interior light
    let n = night.getContext('2d');
    n.filter = 'brightness(.5) saturate(.6) contrast(1.1)'; n.drawImage(img, 0, 0, IW, IH); n.filter = 'none';
    n.globalCompositeOperation = 'multiply'; n.fillStyle = '#5a4f7d'; n.fillRect(0, 0, IW, IH);
    n.globalCompositeOperation = 'source-over';
    const sky = n.createLinearGradient(0, 0, 0, IH * .5); sky.addColorStop(0, 'rgba(20,6,14,.55)'); sky.addColorStop(1, 'rgba(20,6,14,0)');
    n.fillStyle = sky; n.fillRect(0, 0, IW, IH * .5);
    const l = lit.getContext('2d');
    l.filter = 'brightness(1.12) saturate(1.2) sepia(.28)'; l.drawImage(img, 0, 0, IW, IH); l.filter = 'none';
    l.globalCompositeOperation = 'soft-light'; l.fillStyle = 'rgba(255,170,80,.55)'; l.fillRect(0, 0, IW, IH);
    host.append(cv);
    ready = true;
    size();
    if (introPending && !hot) startIntro();
    else schedule(performance.now());
  };
  img.src = src;

  function size() {
    const r = host.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); k = cv.width / IW;
    bloom.width = Math.ceil(cv.width / 6); bloom.height = Math.ceil(cv.height / 6); dirty = true;
  }
  const ro = new ResizeObserver(size); ro.observe(host);

  function schedule(now, reschedule = false) {
    const [y0, y1] = hot ? zoneSpan(hot) : [0, 1];
    cells.forEach((c) => {
      let T;
      if (hot) T = inZone(c, hot) ? 1 : (c.amb ? .35 : 0);
      else if (restId && inZone(c, restId)) T = .42;
      else T = c.amb ? .7 : 0;
      if (!reschedule && T === c.T) return;
      const rising = T > c.L;
      // switch on floor by floor from the bottom; switch off quickly and loosely
      const lag = rising && hot ? (1 - (c.cy - y0) / Math.max(1, y1 - y0)) * 620 + c.r * 180 : c.r * 220;
      c.T = T; c.at = now + (reduce ? 0 : lag);
      if (reduce) c.L = T; c.flick = rising && !reduce;
    });
    dirty = true;
  }
  function frame(now) {
    if (!alive) return;
    if (ready) {
      let moving = false;
      cells.forEach((c) => {
        if (now < c.at) { moving = true; return; }
        const d = c.T - c.L; if (Math.abs(d) < .004) { if (d) dirty = true; c.L = c.T; return; }
        moving = true;
        c.L += d * (d > 0 ? .16 : .1);
        if (c.flick && d > 0 && c.L < .85 && Math.random() < .18) c.L *= .55;      // the tube-light flicker
      });
      if (moving || dirty) draw();
      dirty = false;
    }
    raf = requestAnimationFrame(frame);
  }
  function draw() {
    if (!cv.width || !cv.height || !bloom.width || !bloom.height) return;   // host not laid out yet
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.drawImage(night, 0, 0, cv.width, cv.height);
    const b = bloom.getContext('2d'); b.clearRect(0, 0, bloom.width, bloom.height);
    const bk = bloom.width / IW;
    cells.forEach((c) => {
      if (c.L < .01) return;
      g.globalAlpha = c.L * c.warm;
      g.drawImage(lit, c.x, c.y, c.w, c.h, c.x * k, c.y * k, c.w * k, c.h * k);
      b.fillStyle = c.street ? `rgba(255,200,120,${c.L * .5})` : `rgba(255,178,92,${c.L})`;
      b.fillRect(c.x * bk, c.y * bk, c.w * bk, c.h * bk);
    });
    g.globalAlpha = .75; g.globalCompositeOperation = 'screen'; g.filter = `blur(${Math.round(10 * dpr)}px)`;
    g.drawImage(bloom, 0, 0, cv.width, cv.height);
    g.filter = 'none'; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  raf = requestAnimationFrame(frame);
  // a home somewhere switches its light on or off now and then
  const homes = cells.filter(c => !c.street);
  const life = reduce ? 0 : setInterval(() => { if (!ready || hot || introTimer || !homes.length) return; const c = homes[(Math.random() * homes.length) | 0]; c.amb = !c.amb; schedule(performance.now()); }, 1400);

  function stopIntro() {
    introPending = false;
    clearTimeout(introTimer);
    introTimer = 0;
  }

  function startIntro() {
    introPending = false;
    const now = performance.now();
    cells.forEach((c) => {
      c.T = 1;
      c.L = 0;
      c.flick = true;
      c.at = now + 250 + (1 - c.cy / IH) * 1350 + c.r * 200;
    });
    introTimer = setTimeout(() => {
      introTimer = 0;
      schedule(performance.now());
    }, 2300);
  }

  return {
    light(id) {
      if (id === hot) return;
      hot = id;
      const interrupted = Boolean(introTimer);
      stopIntro();
      schedule(performance.now(), interrupted);
    },
    rest(id) {
      restId = ['home', 'address', 'contact'].includes(id) ? null : id;
      if (!hot && !introTimer) schedule(performance.now());
    },
    intro() {
      if (reduce) return;
      if (ready) startIntro();
      else introPending = true;
    },
    destroy() {
      alive = false;
      img.onload = null;
      stopIntro();
      cancelAnimationFrame(raf);
      clearInterval(life);
      ro.disconnect();
      cv.remove();
    },
  };
}
