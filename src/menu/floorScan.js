/**
 * Floor Scan: every floor of both towers is outlined in gold.
 *  - sweep: a bright band climbs the building floor by floor, leaves a soft trail, rests, and climbs again
 *  - highlight: the floors of one menu section stay outlined while that section is pointed at
 *
 *   const scan = createFloorScan(host, { width, height, towers, delay });
 *   scan.highlight(rects)        // rects = [[x0, x1, y0, y1], ...] in image px (menuData zones); null clears
 *   scan.pause() / scan.play()
 *   scan.destroy()
 *
 * towers: [{ xs: [left, corner, right], top: [yL, yC, yR], bottom: [yL, yC, yR], floors, perspective }]
 *   All values are pixels on the tower image. `top` is the roof line, `bottom` the line under the lowest
 *   floor, each measured at the same three x positions (left edge, the corner nearest you, right edge).
 *   Floors in between are blended from those two lines, so they tilt toward the corner near the top and
 *   flatten out at the bottom. perspective > 1 makes upper floors slightly shorter (1 = even).
 */
const NS = 'http://www.w3.org/2000/svg';

export function createFloorScan(host, { width, height, towers, delay = 2.6, pulse = 1300, stagger = 62, rest = 1800 }) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'fs-svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  // soft glow behind the bright band
  svg.innerHTML = '<defs><filter id="fs-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter></defs>';
  const glow = document.createElementNS(NS, 'g'); glow.setAttribute('filter', 'url(#fs-glow)'); glow.setAttribute('class', 'fs-glow');
  const lines = document.createElementNS(NS, 'g');
  svg.append(glow, lines);

  // rows[i] = every polygon of floor i (counted from the bottom) on every tower
  const rows = [], all = [];
  towers.forEach(({ xs, top, bottom, floors, perspective = 1 }) => {
    const at = (f) => { const k = Math.pow(f / floors, 1 / perspective); return bottom.map((b, j) => b + (top[j] - b) * k); };
    for (let f = 0; f < floors; f++) {
      const lo = at(f), hi = at(f + 1);
      const pts = [...xs.map((x, j) => `${x},${hi[j]}`), ...xs.map((x, j) => `${x},${lo[j]}`).reverse()].join(' ');
      const mk = (parent, cls) => { const p = document.createElementNS(NS, 'polygon'); p.setAttribute('points', pts); p.setAttribute('class', cls); parent.append(p); return p; };
      const item = { line: mk(lines, 'fs-floor'), halo: mk(glow, 'fs-halo'), f, cx: (xs[0] + xs[2]) / 2, cy: (lo[1] + hi[1]) / 2 };
      (rows[f] ??= []).push(item); all.push(item);
    }
  });
  host.append(svg);

  let anims = [], timer = 0, playing = false, alive = true;
  const total = pulse + (rows.length - 1) * stagger;
  const ease = 'cubic-bezier(.4,0,.2,1)';

  function sweep() {
    anims = [];
    rows.forEach((row, i) => row.forEach(({ line, halo }) => {
      const o = { duration: pulse, delay: i * stagger, easing: ease };
      // sharp rise, slow fall: a bright leading band with a fading trail under it
      anims.push(line.animate([
        { fillOpacity: 0, strokeOpacity: 0 },
        { fillOpacity: .34, strokeOpacity: 1, offset: .18 },
        { fillOpacity: .08, strokeOpacity: .35, offset: .55 },
        { fillOpacity: 0, strokeOpacity: 0 },
      ], o));
      anims.push(halo.animate([{ opacity: 0 }, { opacity: .5, offset: .18 }, { opacity: 0, offset: .6 }, { opacity: 0 }], o));
    }));
    timer = setTimeout(() => { if (playing && alive) sweep(); }, total + rest);
  }

  function stopSweep() { clearTimeout(timer); timer = 0; anims.forEach((a) => a.cancel()); anims = []; }

  function play(after = 0) {
    if (reduce || !alive) return;
    stopSweep(); playing = true;
    timer = setTimeout(() => { if (playing && alive) sweep(); }, after * 1000);
  }

  function highlight(rects) {
    if (rects) { playing = false; stopSweep(); }
    const lit = rects ? all.filter((p) => rects.some(([x0, x1, y0, y1]) => p.cx >= x0 && p.cx <= x1 && p.cy >= y0 && p.cy <= y1)) : [];
    const lo = lit.length ? Math.min(...lit.map((p) => p.f)) : 0;
    all.forEach((p) => {
      const on = lit.includes(p);
      // floors outline from the bottom of the section upward
      p.line.style.transitionDelay = on && !reduce ? `${(p.f - lo) * 22}ms` : '0ms';
      p.line.classList.toggle('lit', on);
    });
  }

  play(delay);

  return {
    play: () => play(.8),
    pause: () => { playing = false; clearTimeout(timer); timer = 0; },
    highlight,
    destroy() { alive = false; stopSweep(); svg.remove(); },
  };
}
