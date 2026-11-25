import { useEffect, useState } from 'react';
import { project } from '../data/project.js';
import './legacy.css';

const L = (f) => '/assets/legacy/' + encodeURI(f);

const STATS = [
  { value: '20+', label: 'Years of Brilliance' },
  { value: '30+', label: 'Project Completed' },
  { value: '27.86+', label: 'Min Sq.Ft Delivered' },
  { value: '10,000+', label: 'Happy Families' },
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
  useEffect(() => {
    document.body.classList.add('legacy');
    return () => document.body.classList.remove('legacy');
  }, []);
  useEffect(() => {
    if (hold) return;
    const t = setTimeout(() => setI((n) => (n + 1) % PROJECTS.length), 4500);
    return () => clearTimeout(t);
  }, [i, hold]);
  const p = PROJECTS[i];

  return (
    <main className="lg-page" style={{ backgroundImage: `url(${L('Legacy_background.jpg')})` }} aria-label="Legacy">
      <section className="lg-left">
        <img className="lg-dev" src={encodeURI('/assets/home/Raj Realty logo.png')} alt="Raj Realty Group" />
        <div className="lg-stats">
          {STATS.map((s, k) => (
            <div key={s.label} style={{ '--k': k }}><b>{s.value}</b><span>{s.label}</span></div>
          ))}
        </div>
        <p className="lg-text">Our journey is driven by a passion for excellence, and we take pride in creating spaces that combine
          modern architecture, thoughtful design, and unparalleled convenience. Every project we undertake is a reflection of our
          commitment to quality, transparency, and customer satisfaction.</p>
      </section>

      <section className="lg-card" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)} aria-label="Our projects">
        <div className="lg-frame">
          {PROJECTS.map((x, k) => <img key={k} src={x.img} alt={x.name} className={k === i ? 'on' : ''} />)}
        </div>
        <div className="lg-dots" role="tablist">
          {PROJECTS.map((x, k) => (
            <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={x.name}
              className={k === i ? 'on' : ''} onClick={() => setI(k)} />
          ))}
        </div>
        <div className="lg-name" key={i}><h2>{p.name}</h2><span>{p.place}</span></div>
        <img className="lg-mark" src={L('mark-beige.png')} alt="" />
      </section>

      <div className="lg-powered">
        <img className="poly-credit-logo" src={project.brand.polyLogo} alt="Polycrayons" />
      </div>
    </main>
  );
}
