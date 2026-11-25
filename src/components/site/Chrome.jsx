import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { project } from '../../data/project.js';
import { useTransition } from '../../lib/transition.jsx';
import { centreOf } from '../../menu/trefoilPortal.js';
import { isPanoramaRoute } from '../../lib/panoramaRoutes.js';
import './chrome.css';

export default function Chrome() {
  const { go } = useTransition();
  const { pathname, search } = useLocation();
  const toggle = useRef(null);
  const menuOpen = pathname === '/menu';
  const showChrome = pathname !== '/' && !isPanoramaRoute(pathname);
  const from = new URLSearchParams(search).get('from');
  const returnPath = /^\/(?!\/)[\w/-]*$/.test(from ?? '') && from !== '/menu' ? from : '/';
  const menuPath = menuOpen ? returnPath : '/menu?from=' + encodeURIComponent(pathname);

  useEffect(() => {
    if (!showChrome) return;
    function handleKey(event) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey
        || document.querySelector('dialog[open]')
        || document.activeElement?.closest('input, textarea, select, [contenteditable]')) return;
      if (event.key.toLowerCase() === 'm' || (menuOpen && event.key === 'Escape')) {
        event.preventDefault();
        go(menuPath, centreOf(toggle.current));
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [go, menuOpen, menuPath, showChrome]);

  if (!showChrome) return null;

  return (
    <header className="chrome">
      <button className="brand" onClick={event => go('/', centreOf(event.currentTarget))}
        aria-label={project.brand.name + ' ' + project.brand.version + ' home'}>
        <img className="brand-logo" src={project.brand.logo} alt="" />
      </button>
      <button ref={toggle} className="pill" aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen} onClick={event => go(menuPath, centreOf(event.currentTarget))}>
        {menuOpen ? 'Close' : 'Menu'}
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d={menuOpen ? 'M2 2l8 8m0-8-8 8' : 'M1 3h10M1 6h10M4 9h7'} />
        </svg>
      </button>
    </header>
  );
}
