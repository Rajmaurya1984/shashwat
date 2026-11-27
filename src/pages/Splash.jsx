import { useEffect, useState } from 'react';
import { useTransition } from '../lib/transition.jsx';
import { centreOf } from '../menu/trefoilPortal.js';
import { project } from '../data/project.js';
import './splash.css';

const A = '/assets/home/';

/** First page: wine backdrop, copper rings behind the towers, tagline, Enter. */
export default function Splash() {
  const { go } = useTransition();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.body.classList.add('landing');
    const f = requestAnimationFrame(() => setReady(true));
    const k = (e) => { if (e.key === 'Enter' && e.target === document.body) go('/menu'); };
    addEventListener('keydown', k);
    return () => { cancelAnimationFrame(f); removeEventListener('keydown', k); document.body.classList.remove('landing'); };
  }, []);

  return (
    <main className={'sp-page' + (ready ? ' in' : '')} style={{ backgroundImage: `url("${A}Home_background.jpg")` }}>
      <header className="sp-top">
        <img className="sp-logo" src={project.brand.logo} alt={`${project.brand.name} ${project.brand.version}`} />
        <img className="sp-dev" src={encodeURI(A + 'Raj Realty logo.png')} alt="Raj Realty Group" />
      </header>

      <div className="sp-stage">
        <img className="sp-rings" src={project.brand.logoMark} alt="" />
        <img className="sp-bldg" src={24 + 'Home_bldg.png'} alt="Shree Shashwat 3.0 towers, Mira Road" />
        <p className="sp-tag">Where forever finds its address</p>
        <p className="sp-sub">Luxury Residences Mira Road</p>
      </div>

      <div className="sp-line" aria-hidden="true" />
      <button type="button" className="sp-enter" onClick={(e) => go('/menu', centreOf(e.currentTarget))}>ENTER</button>
      <div className="sp-powered"><img className="poly-credit-logo" src={project.brand.polyLogo} alt="Polycrayons" /></div>
    </main>
  );
}
