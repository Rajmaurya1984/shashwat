import { project } from '../data/project.js';
import Apartment from './Apartment.jsx';

/** Lobby 360 reuses the same viewer with a single room. */
export default function Lobby360() {
  const l = project.lobby;
  return <Apartment backTo="/menu" eyebrow="Grand Entrance Lobby" rooms={[{ id: 'lobby', name: 'The Lobby', pano: l.pano, fallback: l.hero, startYaw: 0, hotspots: [] }]} />;
}
