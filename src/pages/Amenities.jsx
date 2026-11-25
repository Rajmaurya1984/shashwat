import { useEffect, useState } from 'react';
import { centreOf } from '../menu/trefoilPortal.js';
import { useTransition } from '../lib/transition.jsx';
import { project } from '../data/project.js';
import './amenities.css';

const PODIUM = project.amenities.items.find((item) => item.id === 'edeck').image;
const EDECK = project.amenities.items.filter((item) => item.id !== 'edeck');

export default function Amenities() {
  const { go } = useTransition();
  const [on, setOn] = useState('pool');
  const [big, setBig] = useState(false);       // the whole-deck popup
  const open = (a, e) => go('/amenities/' + a.id, centreOf(e.currentTarget));
  // the full-bleed slices take the whole right side, so the site's corner labels step aside here
  useEffect(() => { document.body.classList.add('edeck'); return () => document.body.classList.remove('edeck'); }, []);

  return (
    <main className="ed-page" aria-label="The E-Deck">
      <nav className="ed-list" aria-label="E-Deck amenities">
        <div className="ed-eb">The E-Deck</div>
        {EDECK.map((a, i) => (
          <button key={a.id} type="button" className={'ed-option' + (a.id === on ? ' on' : '')} style={{ '--i': i }}
            onPointerEnter={() => setOn(a.id)} onFocus={() => setOn(a.id)} onClick={(e) => open(a, e)}>
            <svg viewBox="-12 -12 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.3">
              <circle cx="0" cy="-3.6" r="5" /><circle cx="3.1" cy="1.8" r="5" /><circle cx="-3.1" cy="1.8" r="5" /></g></svg>
            {a.name}
          </button>
        ))}
      </nav>

      {/* E-Deck overview */}
      <figure className="ed-mini" tabIndex={0} role="button" aria-label="See the whole E-Deck"
        onPointerEnter={() => setBig(true)} onPointerLeave={() => setBig(false)}
        onFocus={() => setBig(true)} onBlur={() => setBig(false)} onClick={() => setBig((b) => !b)}>
        <span className="ed-rings" />
        <img src={PODIUM} alt="" className="on" />
        <figcaption>Podium level<em>Hover to see it whole</em></figcaption>
      </figure>

      {/* the whole E-Deck, grown out of the small view while it is pointed at */}
      <div className={'ed-pop' + (big ? ' on' : '')} aria-hidden={!big}>
        <img src={PODIUM} alt="The E-Deck podium level" />
        <div className="ed-pop-cap">
          <span>The E-Deck · Podium level</span>
          <b>A world above the world</b>
          <ul>{EDECK.map((a) => <li key={a.id} className={a.id === on ? 'on' : ''}>{a.name}</li>)}</ul>
        </div>
      </div>

      {/* the chosen amenity opens wide; the rest stand beside it as slices */}
      <section className="ed-slices">
        {EDECK.map((a, i) => (
          <button key={a.id} type="button" className={'ed-slice' + (a.id === on ? ' on' : '')} style={{ '--i': i }}
            aria-label={`${a.name}, open`} onPointerEnter={() => setOn(a.id)} onFocus={() => setOn(a.id)} onClick={(e) => open(a, e)}>
            <img src={a.image ?? a.pano} alt="" loading={i === 0 ? undefined : 'lazy'} />
            <span className="ed-lbl"><b>{a.name}</b><i>Step inside →</i></span>
          </button>
        ))}
      </section>
    </main>
  );
}
