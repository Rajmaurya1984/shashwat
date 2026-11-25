import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { menuData } from './menuData.js';
import { centreOf } from './trefoilPortal.js';
import { useTransition } from '../lib/transition.jsx';
import { createTowerLights } from './towerLights.js';
import { createFloorScan } from './floorScan.js';
import { TREFOIL, trefoilMask } from './towerMask.js';
import { project } from '../data/project.js';
import './contents.css';

/**
 * Contents Menu: a straight numbered list on the left; on the right the tower lives inside the 
* three loops of the Shashwat mark, ringed by a field of gold dots that answers each section.
 */
const { tower, sections, windows, floorScan } = menuData;
const zones = Object.fromEntries(sections.map(({ id, rects }) => [id, rects]));
const BOX_LIGHTS = ['lobby', 'edeck'];

/** Gold dot field around the trefoil: dots grow toward the loops, breathe, and send a wave out on hover. */
function createDotField(canvas) {
  const g = canvas.getContext('2d'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dots = [], raf = 0, wave = -1, alive = true;
  function size() {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.width = r.width * dpr; H = canvas.height = r.height * dpr;
    const step = Math.max(9, W / 70), circ = TREFOIL.map(([x, y, rr]) => [x / 100 * W, y / 100 * H, rr / 100 * W]);
    dots = [];
    for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
      // distance to the trefoil's outer edge (negative inside)
      const d = Math.min(...circ.map(([cx, cy, rr]) => Math.hypot(x - cx, y - cy) - rr)) / W;
      if (d < .012 || d > .26) continue;
      dots.push({ x, y, d, s: Math.max(0, 1 - (d - .012) / .25), p: Math.random() * 6.28 });
    }
    if (reduce) draw(0);
  }
  function draw(t) {
    g.clearRect(0, 0, W, H);
    const R = Math.max(1.2, W / 340);
    for (const o of dots) {
      let k = o.s * o.s;
      if (!reduce) k *= .82 + .18 * Math.sin(t / 900 + o.p);
      if (wave >= 0) { const w = (t - wave) / 1000 * .32 - o.d; if (w > -.03 && w < .03) k += (1 - Math.abs(w) / .03) * .9; }
      if (k < .03) continue;
      g.globalAlpha = Math.min(1, .25 + k * .75);
      g.fillStyle = '#d9a06a';
      g.beginPath(); g.arc(o.x, o.y, R * (.35 + k), 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
  }
  function frame(t) { if (!alive) return; draw(t); if (wave >= 0 && t - wave > 1200) wave = -1; raf = requestAnimationFrame(frame); }
  const ro = new ResizeObserver(size); ro.observe(canvas); size();
  if (!reduce) raf = requestAnimationFrame(frame);
  return { pulse() { if (!reduce) wave = performance.now(); }, destroy() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); } };
}

export default function ContentsMenu() {
  const { search } = useLocation();
  const { go } = useTransition();
  const from = new URLSearchParams(search).get('from') || '/';
  const current = sections.find((s) => s.path === from || (s.path !== '/' && from.startsWith(s.path + '/')))?.id;
  const [hot, setHot] = useState(null);
  const [entered, setEntered] = useState(false);
  const towerRef = useRef(null), dotsRef = useRef(null), lights = useRef(null), scan = useRef(null), field = useRef(null);
  const mask = useMemo(trefoilMask, []);
  const hs = sections.find((s) => s.id === hot);

  useEffect(() => {
    const host = towerRef.current;
    lights.current = createTowerLights(host, { ...tower, regions: windows, zones });
    lights.current?.intro();
    scan.current = createFloorScan(host, { width: tower.width, height: tower.height, towers: floorScan, delay: 2.4 });
    field.current = createDotField(dotsRef.current);
    document.body.classList.add('landing');
    const f = requestAnimationFrame(() => setEntered(true)), t = setTimeout(() => setEntered(true), 150);
    return () => { document.body.classList.remove('landing'); cancelAnimationFrame(f); clearTimeout(t); lights.current?.destroy(); scan.current?.destroy(); field.current?.destroy(); };
  }, []);

  useEffect(() => {
    lights.current?.light(BOX_LIGHTS.includes(hot) ? hot : null);
    if (!hot) { scan.current?.highlight(null); scan.current?.play(); return; }
    field.current?.pulse();
    if (hot === 'home' || hot === 'address' || BOX_LIGHTS.includes(hot) || hot === 'location') scan.current?.highlight(null);
    else scan.current?.highlight(zones[hot]);
  }, [hot]);

  return (
    <main className={'ct-page' + (entered ? ' in' : '')} aria-label="Contents" style={{ backgroundImage: 'url("/assets/home/Home_background.jpg")' }}>
      <header className="ct-top">
        <img className="ct-dev" src={encodeURI('/assets/home/Raj Realty logo.png')} alt="Raj Realty Group" />
      </header>

      <nav className="ct-list" aria-label="Sections" onPointerLeave={() => setHot(null)}>
        <div className="ct-eb">Contents</div>
        <ol>
          {sections.map((s, i) => (
            <li key={s.id} className={(hot === s.id ? 'hot' : '') + (current === s.id ? ' cur' : '')} style={{ '--i': i }}>
              <button type="button" aria-current={current === s.id ? 'location' : undefined}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHot(s.id); }}
                onFocus={() => setHot(s.id)} onBlur={() => setHot(null)}
                onClick={(e) => go(s.path, centreOf(e.currentTarget.querySelector('.ct-t')))}>
                <span className="ct-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="ct-t">{s.label}</span>
                <span className="ct-w">{s.where}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <figure className="ct-stage" aria-hidden="true">
        <canvas className="ct-dots" ref={dotsRef} />
        <div className="ct-window" style={{ WebkitMaskImage: mask, maskImage: mask }}>
          <div className="ct-tower" ref={towerRef}><img src={tower.src} alt="" /></div>
        </div>
        <svg className="ct-rims" viewBox="0 0 100 100">
          {TREFOIL.map(([x, y, r], k) => <circle key={k} cx={x} cy={y} r={r} style={{ '--k': k }} />)}
        </svg>
        <figcaption className="ct-cap" key={hot ?? 'rest'}>
          <span>{hs ? hs.where : 'Shree Shashwat 3.0'}</span>
          <p>{hs ? hs.line : 'Two towers above Mira Road, made to last.'}</p>
        </figcaption> 
      </figure>

      <div className="ct-line" aria-hidden="true" />
      <div className="ct-foot">Artist’s impression</div>
      <div className="ct-powered"><img className="poly-credit-logo" src={project.brand.polyLogo} alt="Polycrayons" /></div>
    </main> 
  );
}
