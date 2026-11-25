import { centreOf } from '../menu/trefoilPortal.js';
import { useTransition } from '../lib/transition.jsx';

export default function NotFound() {
  const { go } = useTransition();
  return <div className="page plum-bg" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><div className="script" style={{ fontSize: 48 }}>This page wandered off.</div><button className="cta" style={{ marginTop: 24 }} onClick={event => go('/', centreOf(event.currentTarget))}>Back home</button></div></div>;
}
