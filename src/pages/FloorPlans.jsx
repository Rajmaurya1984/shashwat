import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { centreOf } from '../menu/trefoilPortal.js';
import { useTransition } from '../lib/transition.jsx';
import { VIEW, PLANS, PLAN_FRAME, PLAN_CROP as C, UNITS, UNIT_04_ROOMS, JODI, VIEWS, LIGHTS, viewOf, viewSrc, unitViewOf, UNIT_VIEW_YAW, VIEW_NORTH, currentFloorLight, floorKind, ordinal } from './floorData.js';
import PanoViewer from '../components/panorama/PanoViewer.jsx';
import { loadPanorama } from '../lib/panoramaImages.js';
import Unit04Tour from './Unit04Tour.jsx';
import './floorplans.css';

/**
 * /floor-plans              the twilight view: point at a floor to read its number, click to open its plan
 * /floor-plans/:planId      that floor's plan (planId = tower-floor, e.g. a-12); point at a unit to see its own plan
 */
export default function FloorPlans() {
  const { planId } = useParams();
  const [t, n] = (planId || '').split('-');
  const tower = VIEW.towers.find((x) => x.id === t), floor = Number(n);
  if (t === 'view' && viewOf(floor)) return <FloorView key={floor} floor={floor} />;
  return tower && floorKind(floor) ? <FloorPlan key={planId} tower={tower} floor={floor} /> : <FloorPicker />;
}

function warmFloorView(floor) {
  const view = viewOf(floor);
  if (view) loadPanorama(viewSrc(view, currentFloorLight()), 'low');
}

const V = VIEW;
const slab = (k) => V.roof + V.pitch * k;                       // k-th slab line from the roof down
const floorOfRow = (r) => V.topFloor - r;                       // window row r (0 = top) → floor number
const rowOfFloor = (f) => V.topFloor - f;
const LOBBY = { top: slab(V.rows), bottom: V.ground };          // double-height entrance lobby under the rows

/* ---------------- the twilight view ---------------- */
function FloorPicker() {
  const { go } = useTransition();
  const { search } = useLocation();
  const edit = new URLSearchParams(search).has('edit');
  const svg = useRef(null), wave = useRef(null), waveOn = useRef(true);
  const [hot, setHot] = useState(null);          // { tower, floor }  floor 0 = entrance lobby
  const [tag, setTag] = useState(null);          // screen position of the label beside the tower
  const [entered, setEntered] = useState(false);
  const [probe, setProbe] = useState(null);
  const [pin, setPin] = useState(null);          // a floor with a 360 view that was clicked: its card stays open to choose

  useEffect(() => { const k = (e) => { if (e.key === 'Escape') setPin(null); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);
  useEffect(() => { const f = requestAnimationFrame(() => setEntered(true)), x = setTimeout(() => setEntered(true), 150); return () => { cancelAnimationFrame(f); clearTimeout(x); }; }, []);

  // continuous gold wave up the towers; it rests while a floor is pointed at and resumes after
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rects = [...wave.current.children], PULSE = 1300, STEP = 70, REST = 1400;
    let timer = 0, anims = [], alive = true;
    const run = () => {
      if (!alive) return;
      if (!waveOn.current) { timer = setTimeout(run, 600); return; }
      anims = rects.map((el) => el.animate([
        { fillOpacity: 0, strokeOpacity: 0 },
        { fillOpacity: .3, strokeOpacity: .95, offset: .2 },
        { fillOpacity: .06, strokeOpacity: .3, offset: .55 },
        { fillOpacity: 0, strokeOpacity: 0 },
      ], { duration: PULSE, delay: (V.rows - 1 - Number(el.dataset.row)) * STEP, easing: 'cubic-bezier(.4,0,.2,1)' }));
      timer = setTimeout(run, PULSE + (V.rows - 1) * STEP + REST);
    };
    timer = setTimeout(run, 1600);
    return () => { alive = false; clearTimeout(timer); anims.forEach((a) => a.cancel()); };
  }, []);
  useEffect(() => { waveOn.current = !hot; }, [hot]);

  const band = hot && (hot.floor === 0
    ? { y: LOBBY.top, h: LOBBY.bottom - LOBBY.top }
    : { y: slab(rowOfFloor(hot.floor)), h: V.pitch });

  // keep the label pinned beside the tower at the band, on the side facing open sky
  useEffect(() => {
    if (!hot) return;
    const place = () => {
      const m = svg.current.getScreenCTM(), right = hot.tower.id === 'b';
      const p = svg.current.createSVGPoint(); p.x = right ? hot.tower.x[1] : hot.tower.x[0]; p.y = band.y + band.h / 2;
      const q = p.matrixTransform(m); setTag({ x: q.x, y: q.y, right });
    };
    place(); addEventListener('resize', place); return () => removeEventListener('resize', place);
  }, [hot?.tower.id, hot?.floor]);

  function floorAt(e) {
    const p = svg.current.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(svg.current.getScreenCTM().inverse());
    if (edit) setProbe(`${Math.round(q.x)}, ${Math.round(q.y)}`);
    const tw = V.towers.find((x) => q.x >= x.x[0] && q.x <= x.x[1]);
    if (!tw || q.y < V.roof || q.y > V.ground) return null;
    return { tower: tw, floor: q.y >= LOBBY.top ? 0 : floorOfRow(Math.floor((q.y - V.roof) / V.pitch)) };
  }

  function pick(e) {
    const target = floorAt(e);
    if (!pin && (hot?.tower !== target?.tower || hot?.floor !== target?.floor)) setHot(target);
  }
  function open(e) {
    if (pin) { setPin(null); return; }
    const target = floorAt(e);
    if (!target) return;
    const origin = { x: e.clientX, y: e.clientY };
    if (target.floor === 0) { go('/lobby/360', origin); return; }
    if (viewOf(target.floor)) { warmFloorView(target.floor); setHot(target); setPin(target); return; }
    if (floorKind(target.floor)) go(`/floor-plans/${target.tower.id}-${target.floor}`, origin);
  }

  const kind = hot && floorKind(hot.floor);
  const name = hot && (hot.floor === 0 ? 'Entrance lobby' : hot.floor);
  return (
    <main className={'fp-page fp-view' + (entered ? ' in' : '') + (hot ? ' has-hot' : '')}>
      <img className="fp-render" src={V.src} alt="Shree Shashwat 3.0, Tower A and Tower B at twilight" />
      <div className="fp-shade" />
      <svg ref={svg} className="fp-bands" viewBox={`0 0 ${V.w} ${V.h}`} preserveAspectRatio="xMidYMid slice"
        onPointerMove={pick} onPointerLeave={() => { if (!pin) setHot(null); }} onClick={open} role="img" aria-label="Point at a floor to see its number">
        <defs>
          <linearGradient id="fp-gold" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffe2aa" stopOpacity=".55" /><stop offset=".5" stopColor="#e3b56a" stopOpacity=".32" /><stop offset="1" stopColor="#ffe2aa" stopOpacity=".55" />
          </linearGradient>
          {hot && <mask id="fp-hole"><rect x="0" y="0" width={V.w} height={V.h} fill="#fff" /><rect className="fp-glide" x={hot.tower.x[0]} y={band.y} width={hot.tower.x[1] - hot.tower.x[0]} height={band.h} fill="#000" /></mask>}
        </defs>
        {/* the gold wave: every floor of both towers, lit one after another from the lobby to the roof */}
        <g ref={wave} className="fp-wave" pointerEvents="none">
          {Array.from({ length: V.rows }, (_, r) => V.towers.map((tw) => (
            <rect key={tw.id + r} data-row={r} x={tw.x[0]} y={slab(r)} width={tw.x[1] - tw.x[0]} height={V.pitch} />
          )))}
        </g>
        {V.towers.map((tw) => <rect key={tw.id} className="fp-hit" x={tw.x[0]} y={V.roof - 8} width={tw.x[1] - tw.x[0]} height={V.ground - V.roof + 8} />)}
        {hot && <g className="fp-focus" pointerEvents="none">
          {/* the rest of the tower steps back so the chosen floor reads clearly */}
          <rect x={hot.tower.x[0]} y={V.roof - 8} width={hot.tower.x[1] - hot.tower.x[0]} height={V.ground - V.roof + 8} fill="#12040a" opacity=".42" mask="url(#fp-hole)" />
          <rect className={'fp-band fp-glide' + (kind ? '' : ' off')} x={hot.tower.x[0]} y={band.y} width={hot.tower.x[1] - hot.tower.x[0]} height={band.h} fill={kind ? 'url(#fp-gold)' : 'rgba(255,255,255,.08)'} />
        </g>}
      </svg>

      <header className="fp-head">
        <div className="fp-eb">Floor plans</div>
        <h1>Find your <em>floor</em></h1>
        <p>Point at a tower to read the floor, then click to open its plan or the view from its height.</p>
      </header>

      {hot && tag && (
        <div className={'fp-tag' + (tag.right ? ' r' : '') + (pin ? ' pin' : '')} style={{ left: tag.x, top: tag.y }}>
          <i />
          <div>
            <span>{hot.tower.name}</span>
            <b>{typeof name === 'number' ? <>{ordinal(name)}<small>floor</small></> : name}</b>
            {hot.floor === 0
              ? <em>360° view <br />click to open</em>
              : viewOf(hot.floor)
              ? (pin
                ? <nav className="fp-choose">
                    <em>View from this floor</em>
                    <button type="button" onClick={(e) => go(`/floor-plans/view-${hot.floor}`, centreOf(e.currentTarget))}>360° view <span>→</span></button>
                    {kind && <button type="button" onClick={(e) => go(`/floor-plans/${hot.tower.id}-${hot.floor}`, centreOf(e.currentTarget))}>Floor plan <span>→</span></button>}
                  </nav>
                : <em>{(kind ? PLANS[kind].label : viewOf(hot.floor).sub) + ' · 360° view'}<br />click to choose</em>)
              : <em>{kind ? PLANS[kind].label + ' · click to open' : 'Podium level'}</em>}
          </div>
        </div>
      )}
      {edit && <div className="fp-probe">?edit · {probe ?? 'move over the image'}</div>}
    </main>
  );
}

/* ---------------- one floor's plan ---------------- */
function FloorPlan({ tower, floor }) {
  const { go } = useTransition();
  const { search } = useLocation();
  const edit = new URLSearchParams(search).has('edit');
  const kind = floorKind(floor), plan = PLANS[kind];
  const [hot, setHot] = useState(null);           // unit or jodi id
  const [open, setOpen] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [probe, setProbe] = useState(null);
  const svg = useRef(null);
  const has = plan.units;
  const units = UNITS.filter((u) => has.includes(u.id));
  const all = [...units, ...JODI.filter((j) => j.units.every((id) => has.includes(id)))];
  const sel = all.find((u) => u.id === (open ?? hot));
  const lit = sel ? (sel.units ?? [sel.id]) : [];

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') step(e.key === 'ArrowUp' ? 1 : -1);
    };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  });

  function step(d) {
    let f = floor + d; while (f >= 0 && f <= 40 && !floorKind(f)) f += d;
    if (floorKind(f)) go(`/floor-plans/${tower.id}-${f}`);
  }
  function trace(e) {
    if (!edit) return;
    const p = svg.current.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(svg.current.getScreenCTM().inverse());
    setProbe(`${Math.round(q.x)},${Math.round(q.y)}`);
  }

  return (
    <main className="fp-page fp-plan">
      <aside className="fp-side">
        <button type="button" className="fp-back" onClick={(e) => go('/floor-plans', centreOf(e.currentTarget))}>← All floors</button>
        <div className="fp-eb">{tower.name}</div>
        <div className="fp-floor">
          <h1>{ordinal(floor)}<small>floor</small></h1>
          <div className="fp-step">
            <button type="button" aria-label="Floor above" onClick={() => step(1)}>▲</button>
            <button type="button" aria-label="Floor below" onClick={() => step(-1)}>▼</button>
          </div>
        </div>
        <div className="fp-kind">{plan.label}</div>

        {has.length > 0 && <>
          <div className="fp-sub">Homes on this floor</div>
          <ul className="fp-units" onPointerLeave={() => setHot(null)}>
            {all.map((u) => (
              <li key={u.id}>
                <button type="button" className={(hot === u.id ? 'on' : '') + (u.units ? ' jodi' : '')}
                  onPointerEnter={() => setHot(u.id)} onFocus={() => setHot(u.id)} onClick={() => setOpen(u.id)}>
                  {u.label}{u.sub && <small>{u.sub}</small>}
                </button>
              </li>
            ))}
          </ul>
        </>}
        <p className="fp-fine">Indicative plan. Areas may vary on final measurement.</p>
      </aside>

      <section className="fp-sheet" key={kind}>
        <div className="fp-paper" style={{ aspectRatio: `${C.w} / ${C.h}`, '--fp-ratio': C.w / C.h }}>
          <img src={plan.src} alt={`${tower.name}, ${ordinal(floor)} floor, ${plan.label}`}
            style={{ width: `${PLAN_FRAME.w / C.w * 100}%`, height: `${PLAN_FRAME.h / C.h * 100}%`, left: `${-C.x / C.w * 100}%`, top: `${-C.y / C.h * 100}%` }} />
          {has.length > 0 && (
            <svg ref={svg} viewBox={`${C.x} ${C.y} ${C.w} ${C.h}`} className="fp-overlay" onPointerMove={trace} onPointerLeave={() => setHot(null)}>
              {lit.length > 0 && <>
                {/* everything but the chosen home steps back */}
                <mask id="fp-unit-hole"><rect x={C.x} y={C.y} width={C.w} height={C.h} fill="#fff" />{lit.map((id) => <polygon key={id} points={plan.shapes[id]} fill="#000" />)}</mask>
                <rect className="fp-dim" x={C.x} y={C.y} width={C.w} height={C.h} mask="url(#fp-unit-hole)" />
              </>}
              {units.map((u) => (
                <polygon key={u.id} points={plan.shapes[u.id]} className={'fp-unit' + (lit.includes(u.id) ? ' on' : '')}
                  onPointerEnter={() => setHot(u.id)} onClick={() => setOpen(u.id)} />
              ))}
            </svg>
          )}
        </div>
        {edit && <div className="fp-probe">?edit · {probe ?? 'move over the plan'}</div>}
      </section>

      {/* the hovered unit's own plan */}
      {has.length > 0 && (
        <div className={'fp-peek' + (hot && !open ? ' on' : '') + (lit.some((id) => id === 'u3' || id === 'u4') ? ' up' : '')} aria-hidden={!hot}>
          {sel && !open && <>
            <div className="fp-eb">{sel.sub ?? 'Residence'}</div>
            <b>{sel.label}</b>
            <img src={sel.plan} alt="" />
            <span>Click to open</span>
          </>}
        </div>
      )}

      {open && sel && (
        <div className="fp-box" role="dialog" aria-label={sel.label} onClick={() => setOpen(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={sel.plan} alt={`${sel.label} plan`} />
            <figcaption>{tower.name} · {ordinal(floor)} floor · {sel.label}</figcaption>
            {sel.id === 'u4' && (
              <div className="fp-unit-actions">
                <button type="button" className="fp-unit-360" onPointerEnter={() => warmFloorView(unitViewOf(floor).floor)}
                  onClick={(e) => go(`/floor-plans/view-${unitViewOf(floor).floor}?look=u4&from=${tower.id}-${floor}`, centreOf(e.currentTarget))}>360 View</button>
                <button type="button" className="fp-flat-tour-launch"
                  onPointerEnter={() => loadPanorama(UNIT_04_ROOMS[0].src, 'low')}
                  onFocus={() => loadPanorama(UNIT_04_ROOMS[0].src, 'low')}
                  onClick={() => setTourOpen(true)}>Flat Tour</button>
              </div>
            )}
            <button type="button" className="fp-x" aria-label="Close" onClick={() => setOpen(null)}>✕</button>
          </figure>
        </div>
      )}
      {tourOpen && open === 'u4' && sel && <Unit04Tour plan={sel.plan} floor={floor} startOutside={tourOpen === 'outside'} onClose={() => setTourOpen(false)} />}
    </main>
  );
}

const floorPanoramas = new Map(VIEWS.map((view) => [view.floor, LIGHTS.map(({ id }) => viewSrc(view, id))]));

/* ---------------- the view from a floor, in 360° ---------------- */
const KEY = PLANS.typical;
const KEY_UNITS = UNITS.filter((u) => KEY.units.includes(u.id));
const centreOfShape = (pts) => { const p = pts.split(' ').map((q) => q.split(',').map(Number)); return p.reduce((a, [x, y]) => [a[0] + x / p.length, a[1] + y / p.length], [0, 0]); };
const KEY_AT = Object.fromEntries(KEY_UNITS.map((u) => [u.id, centreOfShape(KEY.shapes[u.id])]));

function FloorView({ floor }) {
  const { go } = useTransition();
  const { search } = useLocation();
  const q = new URLSearchParams(search), from = q.get('from'), first = KEY.units.includes(q.get('look')) ? q.get('look') : null;
  const v = viewOf(floor);
  const [pick, setPick] = useState(first ?? 'u4');                 // the home chosen on the plan
  const [aim, setAim] = useState(first ? UNIT_VIEW_YAW[first] : 0); // pano yaw to turn to
  const cone = useRef(null);
  const back = from ? `/floor-plans/${from}` : '/floor-plans';
  const pickLabel = UNITS.find((u) => u.id === pick).label.replace('Unit', 'Apt');
  function lookFrom() { const y = UNIT_VIEW_YAW[pick]; setAim((a) => (a === y ? y + 0.001 : y)); }
  function radar(heading, fov) {
    if (!cone.current) return;
    cone.current.style.transform = `rotate(${VIEW_NORTH + heading}deg)`;
    cone.current.style.setProperty('--fov', fov + 'deg');
  }
  const [light, setLight] = useState(currentFloorLight);
  const [list, setList] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') { if (list) setList(false); else go(back); } };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [list]);

  return (
    <main className="fp-page fp-360v">
      <PanoViewer src={viewSrc(v, light)} preload={floorPanoramas.get(floor)} startYaw={aim} onView={radar} autoRotate={first ? 0 : 1.5} onReady={() => setReady(true)} onError={() => setReady(true)} />
      {!ready && <div className="fp-360load">Loading the view…</div>}
      <div className="fp-360bar">
        <button type="button" className="fp-pill" onClick={(e) => go(back, centreOf(e.currentTarget))}>← Back</button>
        <div className="fp-drop">
          <button type="button" className="fp-pill" aria-expanded={list} onClick={() => setList((x) => !x)}>{v.label} <span className={list ? 'up' : ''}>↓</span></button>
          {list && <ul>{VIEWS.map((x) => (
            <li key={x.floor}><button type="button" className={x.floor === floor ? 'on' : ''}
              onPointerEnter={() => warmFloorView(x.floor)} onFocus={() => warmFloorView(x.floor)}
              onClick={() => { setList(false); if (x.floor !== floor) go(`/floor-plans/view-${x.floor}`); }}>{x.label}{x.sub && <small>{x.sub}</small>}</button></li>
          ))}</ul>}
        </div>
      </div>
      <div className="fp-light" role="radiogroup" aria-label="Time of day">
        {LIGHTS.map((l) => <button key={l.id} type="button" role="radio" aria-checked={l.id === light} className={l.id === light ? 'on' : ''} onClick={() => setLight(l.id)}>{l.label}</button>)}
      </div>
      {first && (
        <aside className="fp-look" aria-label="Apt 4 on the floor plan">
          <div className="fp-look-map" style={{ aspectRatio: `${C.w} / ${C.h}` }}>
            <img src={KEY.src} alt="" style={{ width: `${PLAN_FRAME.w / C.w * 100}%`, left: `${-C.x / C.w * 100}%`, top: `${-C.y / C.h * 100}%` }} />
            <svg viewBox={`${C.x} ${C.y} ${C.w} ${C.h}`} aria-hidden="true"><polygon points={KEY.shapes[pick]} className="on" /></svg>
            <span className="fp-look-radar" style={{ left: `${(KEY_AT[pick][0] - C.x) / C.w * 100}%`, top: `${(KEY_AT[pick][1] - C.y) / C.h * 100}%` }}><i ref={cone} /></span>
          </div>
          <button type="button" className="fp-card-btn solid" onClick={lookFrom}>Look at {pickLabel.replace('Apt 0', 'Apt ')}</button>
        </aside>
      )}
    </main>
  );
}
