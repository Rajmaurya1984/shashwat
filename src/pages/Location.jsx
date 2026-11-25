import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Map as MapLibreMap, Marker, NavigationControl, Popup, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { animateHighway, drawRoute, fitPoints, installHighwayLayers, installRouteLayers, locationCamera } from './locationRoute.js';
import { project } from '../data/project.js';
import { locationRoutes } from '../data/locationRoutes.js';
import 'maplibre-gl/dist/maplibre-gl.css';
import './location.css';

setWorkerUrl(workerUrl);

const { location } = project;
const { site, places } = location;
const sitePosition = [site.lng, site.lat];

function createPin(label, type) {
  const pin = document.createElement('button');
  pin.type = 'button';
  pin.className = 'location-pin location-pin--' + type;
  pin.setAttribute('aria-label', label);
  return pin;
}

const walkMinutes = {
  'kashigaon-metro': 6,
  gcc: 10,
  siddhivinayak: 12,
  dmart: 16,
  bhaktivedanta: 18,
  iskcon: 18,
};

export default function Location() {
  const container = useRef(null);
  const panel = useRef(null);
  const mapRef = useRef(null);
  const markers = useRef(new Map());
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [previewContent] = useState(() => document.createElement('div'));
  const [ready, setReady] = useState(false);
  const [styleReady, setStyleReady] = useState(false);
  const [mapSize, setMapSize] = useState('');
  const [status, setStatus] = useState('Loading neighborhood map…');
  const visible = places.filter(place => category === 'All' || place.cat === category);
  const activePlace = places.find(place => place.id === selected);
  const activeRoute = locationRoutes[selected];
  const preview = visible.find(place => place.id === previewId && place.id !== selected);

  function pick(id) {
    setPreviewId(null);
    setSelected(current => current === id ? null : id);
  }

  useEffect(() => {
    let map;
    try {
      map = new MapLibreMap({
        container: container.current,
        style: 'https://tiles.openfreemap.org/styles/dark',
        center: sitePosition,
        zoom: 14,
        ...locationCamera,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        maxZoom: 18,
        minZoom: 10,
        attributionControl: false,
        cooperativeGestures: true,
      });
    } catch {
      setStatus('The interactive map is unavailable on this device.');
      return;
    }

    mapRef.current = map;
    const landmarkMarkers = markers.current;
    map.touchZoomRotate.disableRotation();
    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right');
    const sitePin = createPin(site.name, 'site');
    const logo = document.createElement('img');
    logo.src = project.brand.mapSymbol;
    logo.alt = '';
    sitePin.append(logo);
    sitePin.addEventListener('click', () => {
      setCategory('All');
      setSelected(null);
      setPreviewId(null);
    });
    new Marker({ element: sitePin }).setLngLat(sitePosition).addTo(map);
    for (const place of places) {
      const pin = createPin(place.name, 'landmark');
      pin.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') setPreviewId(place.id);
      });
      pin.addEventListener('focus', () => setPreviewId(place.id));
      pin.addEventListener('click', () => pick(place.id));
      landmarkMarkers.set(place.id, new Marker({ element: pin }).setLngLat([place.lng, place.lat]));
    }
    const resize = new ResizeObserver(([entry]) => {
      map.resize();
      const { width, height } = entry.contentRect;
      setMapSize(width + 'x' + height);
    });
    resize.observe(container.current);
    setReady(true);

    let stopHighwayAnimation;
    map.on('load', () => {
      installRouteLayers(map);
      if (map.getSource('openmaptiles')) {
        installHighwayLayers(map);
        stopHighwayAnimation = animateHighway(map);
      }
      setStyleReady(true);
      setStatus('');
    });
    map.on('error', () => {
      if (!map.isStyleLoaded()) setStatus('The neighborhood map could not load.');
    });
    return () => {
      resize.disconnect();
      stopHighwayAnimation?.();
      landmarkMarkers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const shown = places.filter(place => category === 'All' || place.cat === category);
    for (const place of places) {
      const marker = markers.current.get(place.id);
      const pin = marker.getElement();
      pin.setAttribute('aria-pressed', String(place.id === selected));
      pin.style.zIndex = place.id === selected ? '3' : '';
      pin.classList.toggle('location-pin--muted', Boolean(selected) && place.id !== selected);
      if (shown.includes(place)) {
        if (!pin.isConnected) marker.addTo(map);
      } else {
        marker.remove();
      }
    }
    const points = activePlace
      ? [sitePosition, ...(activeRoute?.coordinates ?? []), [activePlace.lng, activePlace.lat]]
      : [sitePosition, ...shown.map(place => [place.lng, place.lat])];
    fitPoints(map, panel.current, points, activePlace ? 16 : 14.5, 1400);
  }, [category, selected, activePlace, activeRoute, ready, mapSize]);

  useEffect(() => {
    if (styleReady && mapRef.current) return drawRoute(mapRef.current, activeRoute?.coordinates);
  }, [styleReady, activeRoute]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !preview) return;
    const popup = new Popup({
      className: 'location-pin-popup',
      closeButton: false,
      closeOnClick: false,
      focusAfterOpen: false,
      maxWidth: '210px',
      offset: 10,
    }).setLngLat([preview.lng, preview.lat]).setDOMContent(previewContent).addTo(map);
    return () => popup.remove();
  }, [preview, previewContent]);

  return (
    <main className="page location-page">
      <section ref={panel} className="location-panel" aria-label="Nearby landmarks">
        <header className="location-heading">
          <p className="eyebrow">{location.eyebrow}</p>
          <h1>Perfectly placed. <span>Effortlessly<br />connected.</span></h1>
          <p className="location-intro">{location.text}</p>
        </header>
        <nav className="location-filters" aria-label="Landmark categories">
          {['All', ...location.categories].map(label => (
            <button key={label} type="button" aria-pressed={label === category} onClick={() => {
              setCategory(label);
              setPreviewId(null);
              setSelected(null);
            }}>{label}</button>
          ))}
        </nav>
        <div className="location-timeline">
          <ol className="location-places">
            {visible.map(place => (
              <li key={place.id}>
                <button type="button" aria-pressed={selected === place.id}
                  onPointerEnter={event => { if (event.pointerType === 'mouse') setPreviewId(place.id); }}
                  onFocus={() => setPreviewId(place.id)}
                  onClick={() => pick(place.id)}>
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
      <section className="location-map" aria-label="Neighborhood map">
        <div ref={container} className="location-map-canvas" />
        {status && <p className="location-map-status" role="status">{status}</p>}
        {preview && createPortal(
          <aside className="location-preview" aria-label="Landmark preview"
            onKeyDown={event => { if (event.key === 'Escape') setPreviewId(null); }}>
            <button type="button" className="location-preview-close" aria-label="Close landmark preview"
              onClick={() => setPreviewId(null)}>×</button>
            <p>{preview.cat} · {preview.km.toFixed(1)} km from Shashwat</p>
            <h2>{preview.name}</h2>
            <button type="button" className="location-preview-action" onClick={() => pick(preview.id)}>Show route →</button>
          </aside>,
          previewContent
        )}
      </section>
    </main>
  );
}
