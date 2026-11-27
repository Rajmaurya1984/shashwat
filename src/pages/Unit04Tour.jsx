import { useEffect, useRef, useState } from 'react';
import PanoViewer from '../components/panorama/PanoViewer.jsx';
import { UNIT_04_MAP_VIEWBOX, UNIT_04_ROOMS, PLANS, PLAN_FRAME, PLAN_CROP, LIGHTS, UNIT_VIEW_YAW, currentFloorLight, ordinal, unitViewOf, viewSrc } from './floorData.js';
import { normalizeBearing, unit04Pointers, unit04Radar } from '../data/unit04Tour.js';
import './unit04-tour.css';

const rooms = UNIT_04_ROOMS;
const [, , mapWidth, mapHeight] = UNIT_04_MAP_VIEWBOX;

/* 
make menu btn just downward of the logo and also
key plan for the outside view: the floor, Unit 04 lit, and a radar showing which way you look */
const KEY = PLANS.typical, C = PLAN_CROP;
const U4 = KEY.shapes.u4.split(' ').map((p) => p.split(',').map(Number));
const U4_AT = U4.reduce((a, [x, y]) => [a[0] + x / U4.length, a[1] + y / U4.length], [0, 0]);
const pct = ([x, y]) => ({ left: (x - C.x) / C.w * 100 + '%', top: (y - C.y) / C.h * 100 + '%' });
// the view opens looking out of Unit 04's windows, which face the bottom of the plan (180° on the map)
const MAP_FACING = 180;
const panoramas = rooms.map(({ src }) => src);
const storageKey = 'shashwat-unit-04-tour';
const emptyDraft = { pointers: {}, radar: {} };
const exteriorPanoramas = new WeakMap();

function exteriorSources(view) {
  if (!exteriorPanoramas.has(view)) exteriorPanoramas.set(view, LIGHTS.map(({ id }) => viewSrc(view, id)));
  return exteriorPanoramas.get(view);
}

function readDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    const radar = Object.fromEntries(Object.entries(saved?.radar ?? {}).flatMap(([src, placement]) => {
      if (!placement) return [];
      // Older drafts stored percentages of the original, uncropped image.
      const left = saved.version === 3 ? placement.left : (placement.x - 12) / .75;
      const top = saved.version === 3 ? placement.top : (placement.y - 16) / .63;
      if (!Number.isFinite(left) || !Number.isFinite(top)) return [];
      const offset = Number.isFinite(placement.offset) ? normalizeBearing(placement.offset) : undefined;
      return [[src, { left, top, offset }]];
    }));
    const pointers = Object.fromEntries(Object.entries(saved?.pointers ?? {}).flatMap(([src, links]) => {
      if (!Array.isArray(links)) return [];
      const validLinks = links.filter((link) => link && Number.isFinite(link.yaw) && Number.isFinite(link.pitch));
      if (saved.version >= 2) return [[src, validLinks]];
      const missingLinks = (unit04Pointers[src] ?? []).filter(({ to }) => !validLinks.some((link) => link.to === to));
      return [[src, [...validLinks, ...missingLinks]]];
    }));
    return { pointers, radar };
  } catch {
    return emptyDraft;
  }
}

export default function Unit04Tour({ plan, floor = 20, startOutside = false, onClose }) {
  const dialog = useRef(null);
  const cone = useRef(null);
  const cameraHeading = useRef(0);
  const [room, setRoom] = useState(rooms[0]);
  const [active, setActive] = useState(null);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(readDraft);
  const [mode, setMode] = useState('');
  const [target, setTarget] = useState('');
  const [alignment, setAlignment] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [outside, setOutside] = useState(startOutside);          // 360view: the view out of Unit 04 at this height
  const [light, setLight] = useState(currentFloorLight);
  const [outReady, setOutReady] = useState(false);
  const out = unitViewOf(floor);
  const outCone = useRef(null);
  function outRadar(heading, fov) {
    if (!outCone.current) return;
    const bearing = MAP_FACING + heading + UNIT_VIEW_YAW.u4;   // heading is -yaw; at the start yaw it reads -UNIT_VIEW_YAW
    outCone.current.style.setProperty('--radar-bearing', bearing + 'deg');
    outCone.current.style.setProperty('--radar-fov', fov + 'deg');
  }

  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);

  const pointers = { ...unit04Pointers, ...draft.pointers };
  const radar = Object.fromEntries(rooms.map(({ src }) => {
    const saved = draft.radar[src];
    const fallback = unit04Radar[src];
    return [src, saved ? { ...saved, offset: saved.offset ?? fallback.offset } : fallback];
  }));
  const currentPointers = pointers[active?.src] ?? [];
  const position = active && radar[active.src];
  const isReady = active === room && !error;
  const hotspots = active === room && !error
    ? currentPointers.flatMap(({ to, yaw, pitch }) => {
        const destination = rooms.find(({ src }) => src === to);
        return destination ? [{ yaw, pitch, label: destination.name, onClick: mode === 'pointer' ? undefined : () => selectRoom(destination) }] : [];
      }) : [];

  function selectRoom(next) {
    if (next === room) return;
    setError('');
    setTarget('');
    setAlignment('');
    setRoom(next);
  }

  function save(next) {
    setDraft(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 3, ...next }));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  function savePointers(pointers) {
    save({ ...draft, pointers: { ...draft.pointers, [room.src]: pointers } });
  }

  function placeRadar(event) {
    if (!isReady) return;
    const rect = event.currentTarget.getBoundingClientRect();
    save({ ...draft, radar: { ...draft.radar, [room.src]: {
      offset: position.offset,
      left: (event.clientX - rect.left) / rect.width * 100,
      top: (event.clientY - rect.top) / rect.height * 100,
    } } });
  }

  function alignRadar() {
    if (!isReady || alignment.trim() === '') return;
    const heading = Number(alignment);
    if (!Number.isFinite(heading) || heading < 0 || heading > 360) return;
    save({ ...draft, radar: { ...draft.radar, [room.src]: {
      left: position.left, top: position.top, offset: normalizeBearing(heading - cameraHeading.current),
    } } });
    setAlignment('');
  }

  function updateRadar(heading, fov) {
    cameraHeading.current = normalizeBearing(heading);
    if (!cone.current) return;
    const bearing = normalizeBearing(cameraHeading.current + (position?.offset ?? 0));
    cone.current.style.setProperty('--radar-bearing', bearing + 'deg');
    cone.current.style.setProperty('--radar-fov', fov + 'deg');
  }

  return (
    <dialog ref={dialog} className="fp-flat-tour" aria-label="Unit 04 flat tour"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => event.stopPropagation()}>
      {outside && <section className="unit-view unit-outside" aria-label={'View from Unit 04, ' + out.label}>
        <PanoViewer src={viewSrc(out, light)} preload={exteriorSources(out)}
          startYaw={UNIT_VIEW_YAW.u4} autoRotate={1.2}
          onView={outRadar} onReady={() => setOutReady(true)} onError={() => setOutReady(true)} />
        <aside className="unit-out-map" aria-label="Where you are looking">
          <div className="unit-out-key">
            <img src={plan} alt="Unit 04 plan" />
            <span className="unit-radar" style={{ left: '49%', top: '53%' }}><i ref={outCone} /></span>
          </div>
          <p>Unit 04</p>
        </aside>
        {!outReady && <p className="unit-status" role="status">Loading the view…</p>}
        <div className="unit-out-head"><span>View from Unit 04</span><b>{ordinal(floor)} floor</b>
          {out.floor !== floor && <em>Shot from the {out.label}, the nearest height</em>}</div>
        <div className="unit-light" role="radiogroup" aria-label="Time of day">
          {LIGHTS.map((l) => <button key={l.id} type="button" role="radio" aria-checked={l.id === light}
            onClick={() => setLight(l.id)}>{l.label}</button>)}
        </div>
      </section>}
      <section className="unit-view" hidden={outside} aria-label={room.name + ' 360° panorama'}>
        <PanoViewer sceneMotion startFov={95} src={room.src} preload={panoramas} autoRotate={0}
          hotspots={hotspots} onView={updateRadar}
          onReady={() => setActive(room)}
          onError={() => setError(room.name + ' could not be loaded.')}
          onPlace={isReady && mode === 'pointer' && target
            ? ({ yaw, pitch }) => savePointers([...currentPointers, { to: target, yaw, pitch }])
            : undefined} />
      </section>
      <div className="unit-controls" hidden={outside}>
        <button className="unit-back" type="button" aria-label="Back to floor plan" onClick={onClose}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3m4-4L3 8l4 4" /></svg>
          Back
        </button>
        <nav className="unit-room-menu" aria-label="Explore rooms">
          <ul className="unit-room-list">
            {rooms.map((item) => (
              <li key={item.src}>
                <button type="button" aria-pressed={item === room} onClick={() => selectRoom(item)}>
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <aside hidden={outside} className="unit-map-panel unit-room-map" aria-label="Unit 04 room map">
        <div className="unit-map" style={{ aspectRatio: mapWidth / mapHeight }}>
          <svg className="unit-map-drawing" viewBox={UNIT_04_MAP_VIEWBOX.join(' ')} role="img" aria-label="Unit 04 floor plan">
            <image href={plan} width="1000" height="707" />
          </svg>
          {position && <span className="unit-radar" aria-hidden="true"
            style={{ left: position.left + '%', top: position.top + '%' }}>
            <i ref={cone} style={{ '--radar-bearing': normalizeBearing(cameraHeading.current + (position.offset ?? 0)) + 'deg' }} />
          </span>}
          {rooms.map((item) => {
            const pin = radar[item.src];
            return <button key={item.src} className="unit-pin" type="button"
              aria-label={'Explore ' + item.name} aria-pressed={item === (active ?? room)}
              style={{ left: pin.left + '%', top: pin.top + '%' }} onClick={() => selectRoom(item)}>
              <span className="unit-pin-label" aria-hidden="true">{item.name}</span>
            </button>;
          })}
          {mode === 'radar' && <div className="unit-map-placement" onClick={placeRadar} aria-hidden="true" />}
        </div>
      </aside>
      <div className="unit-editor" hidden={outside}>
        <button type="button" aria-expanded={!!mode} onClick={() => {
          setMode(mode ? '' : 'pointer');
          setShowExport(false);
        }}>{mode ? 'Done editing' : 'Edit pointers & radar'}</button>
        {mode && <div className="unit-editor-panel">
          <div className="unit-editor-actions">
            <button type="button" aria-pressed={mode === 'pointer'} onClick={() => setMode('pointer')}>Room pointers</button>
            <button type="button" aria-pressed={mode === 'radar'} onClick={() => setMode('radar')}>Map radar</button>
          </div>
          {mode === 'pointer' ? <>
            <label>Destination room
              <select value={target} onChange={(event) => setTarget(event.target.value)}>
                <option value="">Choose a room</option>
                {rooms.filter((item) => item !== room).map((item) =>
                  <option key={item.src} value={item.src}>{item.name}</option>)}
              </select>
            </label>
            <p>Drag to face the doorway, then double-click or tap to place a pointer.</p>
            <button type="button" disabled={!isReady || !currentPointers.length}
              onClick={() => savePointers(currentPointers.slice(0, -1))}>Undo last pointer</button>
          </> : <>
            <p>Click or tap the floor plan to position the radar for this room.</p>
            <label>Map heading (0° up, 90° right)
              <input type="number" min="0" max="360" value={alignment}
                onChange={(event) => setAlignment(event.target.value)} />
            </label>
            <button type="button" disabled={!isReady || alignment.trim() === ''} onClick={alignRadar}>Align current view</button>
          </>}
          <button type="button" aria-expanded={showExport} onClick={() => setShowExport(!showExport)}>Export placement data</button>
          {showExport && <textarea aria-label="Placement data" readOnly
            value={JSON.stringify({ pointers, radar }, null, 2)} onFocus={(event) => event.target.select()} />}
          {storageError && <p role="status">Browser storage is unavailable. Export your placements before closing.</p>}
        </div>}
      </div>
      {!active && !error && <p className="unit-status" role="status">Loading room…</p>}
      {error && <p className="unit-status" role="alert">{error}</p>}
    </dialog>
  );
}
