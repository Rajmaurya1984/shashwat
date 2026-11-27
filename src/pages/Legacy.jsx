import { useEffect, useState } from 'react';
import { project } from '../data/project.js';
import './legacy.css';

const L = (f) => '/assets/legacy/' + encodeURI(f);
const HOLD = 5000;   // ms each project stays before the next

const STATS = [
  { value: '20', unit: '+', label: 'Years of brilliance' },
  { value: '30', unit: '+', label: 'Projects completed' },
  { value: '27.86', unit: '+', label: 'Min sq.ft delivered' },
  { value: '10,000', unit: '+', label: 'Happy families' },
];

// past projects: names for 2.jpg and 3.jpg still need confirming with the client
const PROJECTS = [
  { img: L('1.jpg'), name: 'Shree Shashwat 2.0', place: 'Mira Road East' },
  { img: L('2.jpg'), name: 'Raj Realty Project', place: 'Mira Road East' },
  { img: L('3.jpg'), name: 'Raj Realty Project', place: 'Mira Road East' },
];

export default function Legacy() {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const n = PROJECTS.length, p = PROJECTS[i];
  const go = (d) => setI((k) => (k + d + n) % n);

  useEffect(() => {
    document.body.classList.add('legacy');
    return () => document.body.classList.remove('legacy');
  }, []);
  useEffect(() => {
    if (hold) return;
    const t = setTimeout(() => go(1), HOLD);
    return () => clearTimeout(t);
  }, [i, hold]);
  useEffect(() => {
    const k = (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, []);

  return (
    <main className="lg-page" aria-label="Legacy">
      <div className="lg-bg" style={{ backgroundImage: `url(${L('Legacy_background.jpg')})` }} />
      <div className="lg-veil" />

      {/* the story and the numbers */}
      <section className="lg-copy">
        <img className="lg-dev" src={encodeURI('/assets/home/Raj Realty logo.png')} alt="Raj Realty Group" />
        <div className="lg-eb"><i />Our legacy</div>
        <h1>Two decades of building <em>homes that last</em></h1>
        <p>Our journey is driven by a passion for excellence. We take pride in creating spaces that combine modern architecture,
          thoughtful design and unparalleled convenience. Every project is a reflection of our commitment to quality,
          transparency and customer satisfaction.</p>
        <dl className="lg-stats">
          {STATS.map((s, k) => (
            <div key={s.label} style={{ '--k': k }}><dt>{s.label}</dt><dd>{s.value}<sup>{s.unit}</sup></dd></div>
          ))}
        </dl>
      </section>

      {/* the projects, one arch at a time */}
      <section className="lg-gallery" aria-label="Completed projects" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)}>
        <div className="lg-arch">
          {PROJECTS.map((x, k) => <img key={k} src={x.img} alt={k === i ? x.name : ''} className={k === i ? 'on' : ''} />)}
          <span className="lg-arch-line" aria-hidden="true" />
          <div className="lg-cap" key={i}>
            <span>{String(i + 1).padStart(2, '0')} <small>/ {String(n).padStart(2, '0')}</small></span>
            <h2>{p.name}</h2>
            <em>{p.place}</em>
          </div>
        </div>

        <div className="lg-nav">
          <button type="button" aria-label="Previous project" onClick={() => go(-1)}>←</button>
          <div className="lg-bars" role="tablist" aria-label="Projects">
            {PROJECTS.map((x, k) => (
              <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={x.name} onClick={() => setI(k)}
                className={(k === i ? 'on' : '') + (hold ? ' held' : '')} style={{ '--hold': HOLD + 'ms' }}><i /></button>
            ))}
          </div>
          <button type="button" aria-label="Next project" onClick={() => go(1)}>→</button>
        </div>
      </section>

      <div className="lg-powered"><img className="poly-credit-logo" src={project.brand.polyLogo} alt="Powered by Polycrayons" /></div>
    </main>
  );
}
