import { useState } from 'react';
import { Link } from 'react-router-dom';
import { project } from '../data/project.js';
import PanoViewer from '../components/panorama/PanoViewer.jsx';

/**
 * Sample apartment walk-through: one 360° per room, hotspots link rooms, room bar at the bottom. */
export default function Apartment({ rooms = project.apartment.rooms, eyebrow = project.apartment.eyebrow, backTo = '/residences' }) {
  const [id, setId] = useState(rooms[0].id);
  const room = rooms.find((r) => r.id === id);
  const spots = room.hotspots.map((h) => ({ ...h, label: rooms.find((r) => r.id === h.to)?.name ?? h.to, onClick: () => setId(h.to) }));
  return (
    <div className="page" style={{ background: '#12040a' }}>
      <PanoViewer src={room.pano} mobileSrc={room.pano.replace('.jpg', '-mobile.jpg')} startYaw={room.startYaw} hotspots={spots} fallback={room.fallback} />
      <div className="view-shade" />
      <Link className="pano-back" to={backTo}>← Back</Link>
      <div className="view-copy">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="title">{room.name}</h1>
        <p className="body">Drag to look around · click a gold marker to walk to the next room.</p>
      </div>
      <nav className="room-bar" aria-label="Rooms">
        {rooms.map((r) => <button key={r.id} className={r.id === id ? 'on' : ''} onClick={() => setId(r.id)}>{r.name}</button>)}
      </nav>
    </div>
  );
}
