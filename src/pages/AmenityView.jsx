import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { amenityHotspots } from '../data/amenityHotspots.js';
import { project } from '../data/project.js';
import { centreOf } from '../menu/trefoilPortal.js';
import { useTransition } from '../lib/transition.jsx';
import Img from '../components/ui/Img.jsx';
import PanoViewer from '../components/panorama/PanoViewer.jsx';

const STORAGE_KEY = 'shashwat-amenity-pointer-drafts';
const items = project.amenities.items;
const scenes = items.filter((item) => item.pano);

function readPointers() {
  try {
    return { ...amenityHotspots, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') };
  } catch {
    return amenityHotspots;
  }
}

export default function AmenityView() {
  const { id } = useParams();
  if (id === 'lobby') return <Navigate to="/lobby/360" replace />;
  const amenity = items.find((item) => item.id === id) ?? items[0];
  return <AmenityScene key={amenity.id} amenity={amenity} />;
}

function AmenityScene({ amenity }) {
  const { go } = useTransition();
  const [pointers, setPointers] = useState(readPointers);
  const [placing, setPlacing] = useState(false);
  const [target, setTarget] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const scenePointers = (pointers[amenity.id] ?? []).filter(({ to }) => scenes.some((scene) => scene.id === to));
  const hotspots = scenePointers.map(({ to, yaw, pitch }) => ({
    label: scenes.find((scene) => scene.id === to).name,
    yaw,
    pitch,
    onClick: placing ? undefined : (event) => go('/amenities/' + to, centreOf(event.currentTarget)),
  }));

  function saveScene(next) {
    const updated = { ...pointers, [amenity.id]: next };
    setPointers(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  return (
    <div className="page" aria-label={amenity.name} style={{ background: '#12040a' }}>
      {amenity.pano
        ? <PanoViewer src={amenity.pano} fallback={amenity.image ?? amenity.pano} hotspots={hotspots}
            autoRotate={0} onPlace={placing && target ? (position) => saveScene([...scenePointers, { to: target, ...position }]) : undefined} />
        : <div className="pan-still"><Img src={amenity.image} alt={amenity.name} /></div>}
      <div className="view-shade" />
      <div className="amenity-tour-menu">
        <Link className="amenity-tour-menu__back" to="/amenities">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
          Back to The E-Deck
        </Link>
        <nav aria-label="E-Deck amenities">
          <ul>
            {scenes.map((scene) => (
              <li key={scene.id}>
                <Link to={'/amenities/' + scene.id}
                  aria-current={scene.id === amenity.id ? 'page' : undefined}>
                  {scene.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {amenity.pano && <aside className="pano-authoring" aria-label="Amenity pointer placement">
        <button type="button" aria-expanded={placing} onClick={() => setPlacing(!placing)}>
          {placing ? 'Done placing' : 'Place amenity pointers'}
        </button>
        {placing && <>
          <label>Destination
            <select value={target} onChange={(event) => setTarget(event.target.value)}>
              <option value="">Choose an amenity</option>
              {scenes.filter((scene) => scene.id !== amenity.id).map((scene) => (
                <option key={scene.id} value={scene.id}>{scene.name}</option>
              ))}
            </select>
          </label>
          <p>Drag to look around, then double-click where the pointer should appear.</p>
          <p role="status">{storageError ? 'Browser storage is unavailable. Export your pointers before leaving.' : scenePointers.length + ' saved in this scene'}</p>
          <div>
            <button type="button" disabled={!scenePointers.length} onClick={() => saveScene(scenePointers.slice(0, -1))}>Undo last</button>
            <button type="button" aria-expanded={showExport} onClick={() => setShowExport(!showExport)}>Export pointers</button>
          </div>
          {showExport && <textarea aria-label="Exported amenity pointers" readOnly
            value={JSON.stringify(pointers, null, 2)} onFocus={(event) => event.target.select()} />}
        </>}
      </aside>}
    </div>
  );
}