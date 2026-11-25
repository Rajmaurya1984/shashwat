import { useState } from 'react';
import { project } from '../data/project.js';
import { locationRoutes } from '../data/locationRoutes.js';
import './location.css';

const { location } = project;
const { places } = location;
const walkMinutes = {
  'kashigaon-metro': 6,
  gcc: 10,
  siddhivinayak: 12,
  dmart: 16,
  bhaktivedanta: 18,
  iskcon: 18,
};

export default function Location() {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const visible = places.filter(place => category === 'All' || place.cat === category);
  const activePlace = places.find(place => place.id === selected);
  const activeRoute = locationRoutes[selected];

  return (
    <main className="page location-page">
      <section className="location-panel" aria-label="Nearby landmarks">
        <header className="location-heading">
          <p className="eyebrow">{location.eyebrow}</p>
          <h1>Perfectly placed. <span>Effortlessly<br />connected.</span></h1>
          <p className="location-intro">{location.text}</p>
        </header>
        <nav className="location-filters" aria-label="Landmark categories">
          {['All', ...location.categories].map(label => (
            <button key={label} type="button" aria-pressed={label === category} onClick={() => {
              setCategory(label);

              setSelected(null);
            }}>{label}</button>
          ))}
        </nav>
        <div className="location-timeline">
          <ol className="location-places">
            {visible.map(place => (
              <li key={place.id}>
                <button type="button" aria-pressed={selected === place.id}

                  onClick={() => setSelected(current => current === place.id ? null : place.id)}>
                  <span>{place.name}</span>
                  <span className="location-distance">{place.km.toFixed(1)} km</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        {activePlace && (
          <aside className="location-detail" aria-live="polite">
            <button type="button" aria-label="Close landmark" onClick={() => setSelected(null)}>×</button>
            <div className="location-detail-heading">
              <strong>{activePlace.name}</strong>
              <span>{activePlace.km.toFixed(1)} km</span>
            </div>
            <dl className="location-travel" aria-label="Estimated travel times">
              <div>
                <dt>Drive</dt>
                <dd>{activeRoute ? Math.max(1, Math.round(activeRoute.duration / 60)) + ' min' : '—'}</dd>
              </div>
              <div>
                <dt>Metro</dt>
                <dd>{activePlace.id === 'kashigaon-metro' ? '1 min' : '—'}</dd>
              </div>
              <div>
                <dt>Walk</dt>
                <dd>{walkMinutes[activePlace.id] ? walkMinutes[activePlace.id] + ' min' : '—'}</dd>
              </div>
            </dl>
          </aside>
        )}
      </section>
    </main>
  );
}
