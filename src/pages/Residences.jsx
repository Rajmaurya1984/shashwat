import { useTransition } from '../lib/transition.jsx';
import { centreOf } from '../menu/trefoilPortal.js';
import { useRef, useState } from 'react';
import { project } from '../data/project.js';
import { GoldenParticles } from '../lib/goldenParticles.js';
import Img from '../components/ui/Img.jsx';

/** Tabs: Living · Bedroom · Kitchen · Bathroom. The photo changes through the gold-dust effect. */
export default function Residences() {
  const { go } = useTransition();
  const d = project.residences;
  const [i, setI] = useState(0);
  const media = useRef(null), busy = useRef(false);
  const room = d.rooms[i];

  const snapshot = () => {                                   // freeze the current photo for the particles
    const el = media.current, c = document.createElement('canvas'); c.width = el.clientWidth; c.height = el.clientHeight;
    const img = el.querySelector('img'), g = c.getContext('2d');
    if (img?.naturalWidth) { const s = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight); g.drawImage(img, (c.width - img.naturalWidth * s) / 2, (c.height - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s); }
    else { g.fillStyle = '#2a0d12'; g.fillRect(0, 0, c.width, c.height); }
    return c;
  };
  async function pick(k) {
    if (k === i || busy.current) return; busy.current = true;
    let fx = null;
    try { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) fx = new GoldenParticles(media.current, { zIndex: 3 }); } catch { fx = null; }
    if (!fx) { setI(k); busy.current = false; return; }
    fx.setSource(snapshot());
    const gathered = fx.gather({ x: media.current.clientWidth / 2, y: media.current.clientHeight / 2 }, 1200);
    setI(k);
    await new Promise((r) => { const im = new Image(); im.onload = im.onerror = r; im.src = d.rooms[k].img; });
    await gathered; await new Promise(requestAnimationFrame);
    fx.setTarget(snapshot()); await fx.assemble(1200); fx.fadeAway(250);
    busy.current = false;
  }

  return (
    <div className="page plum-bg res">
      <div className="res-media" ref={media}><Img key={room.id} src={room.img} alt={room.title} /></div>
      <div className="res-copy">
        <div className="eyebrow rise">{d.eyebrow}</div>
        <div className="tabs rise d1" role="tablist">
          {d.rooms.map((r, k) => <button key={r.id} role="tab" aria-selected={k === i} className={'tab' + (k === i ? ' on' : '')} onClick={() => pick(k)}>{r.name}</button>)}
        </div>
        <div className="res-text" key={room.id}>
          <h1 className="title">{room.title}</h1>
          <div className="script res-tag">{room.tag}</div>
          <ul className="specs">{room.specs.map((s) => <li key={s}>{s}</li>)}</ul>
          <div className="tour-related">
            <button className="cta" onClick={event => go('/floor-plans', centreOf(event.currentTarget))}>Floor plans</button>
            <button className="cta" onClick={event => go('/specifications', centreOf(event.currentTarget))}>Specifications</button>
          </div>
        </div>
      </div>
    </div>
  );
}
