import { LngLatBounds } from 'maplibre-gl';

const sourceId = 'shashwat-driving-route';
const lineId = sourceId + '-line';
const gold = '#f3d394';
const highwayColor = '#ed9662';
const highwayName = 'Western Express Highway';
const highwayNearProject = [72.88378, 19.27301];
export const locationCamera = { pitch: 55, bearing: -20 };
const emptyRoute = { type: 'FeatureCollection', features: [] };
const easeOut = t => 1 - (1 - t) ** 3;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function fitPoints(map, panel, points, maxZoom, duration) {
  const bounds = new LngLatBounds(points[0], points[0]);
  points.forEach(point => bounds.extend(point));
  bounds.extend(highwayNearProject);
  const viewport = map.getContainer().getBoundingClientRect();
  const overlay = panel.getBoundingClientRect();
  const bottomPanel = overlay.width >= viewport.width * .8;
  const padding = bottomPanel
    ? { top: 104, right: 50, bottom: Math.ceil(viewport.bottom - overlay.top) + 26, left: 30 }
    : { top: Math.min(104, Math.round(viewport.height * .22)), right: 58, bottom: 50, left: Math.ceil(overlay.right - viewport.left) + 34 };
  map.fitBounds(bounds, {
    padding,
    ...locationCamera,
    retainPadding: false,
    maxZoom,
    duration: reducedMotion() ? 0 : duration,
    easing: easeOut,
  });
}

export function installHighwayLayers(map) {
  const highway = {
    source: 'openmaptiles',
    'source-layer': 'transportation_name',
    filter: ['==', ['get', 'name'], highwayName],
  };
  const widths = (overview, neighborhood, street) =>
    ['interpolate', ['linear'], ['zoom'], 10, overview, 14, neighborhood, 17, street];

  for (const [id, paint] of [
    ['highway-glow', { 'line-color': highwayColor, 'line-opacity': .38, 'line-width': widths(6, 13, 22), 'line-blur': 7 }],
    ['highway-casing', { 'line-color': '#42251c', 'line-width': widths(3, 7, 12) }],
    ['highway-highlight', { 'line-color': highwayColor, 'line-width': widths(1.5, 4, 7), 'line-opacity': .9 }],
  ]) {
    map.addLayer({
      ...highway, id, type: 'line',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint,
    }, 'highway_name_other');
  }

  map.addLayer({
    ...highway, id: 'highway-highlight-label', type: 'symbol', minzoom: 12,
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': 280,
      'text-field': highwayName,
      'text-font': ['Noto Sans Regular'],
      'text-size': 12,
      'text-offset': [0, -1.15],
      'text-keep-upright': true,
    },
    paint: { 'text-color': '#ffd0a8', 'text-halo-color': '#241a21', 'text-halo-width': 2 },
  }, 'highway_name_other');
}

export function animateHighway(map) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame;
  let started;
  let lastUpdate;
  function animate(now) {
    started ??= now;
    if (lastUpdate === undefined || now - lastUpdate >= 30) {
      const phase = (now - started) / 3200 * 2 * Math.PI;
      const glow = (1 - Math.cos(phase)) / 2;
      map.setPaintProperty('highway-glow', 'line-opacity', .28 + glow * .42);
      lastUpdate = now;
    }
    frame = requestAnimationFrame(animate);
  }

  function syncMotion() {
    cancelAnimationFrame(frame);
    started = lastUpdate = undefined;
    map.setPaintProperty('highway-glow', 'line-opacity', .38);
    if (!motion.matches) frame = requestAnimationFrame(animate);
  }

  syncMotion();
  motion.addEventListener('change', syncMotion);
  return () => {
    cancelAnimationFrame(frame);
    motion.removeEventListener('change', syncMotion);
  };
}

export function installRouteLayers(map) {
  map.addSource(sourceId, { type: 'geojson', data: emptyRoute, lineMetrics: true });
  for (const [id, paint] of [
    [sourceId + '-glow', { 'line-width': 20, 'line-blur': 9, 'line-color': '#d39a61', 'line-opacity': .48 }],
    [sourceId + '-edge', { 'line-width': 8, 'line-color': '#30161b', 'line-opacity': .9 }],
    [lineId, { 'line-width': 4, 'line-color': gold }],
  ]) {
    map.addLayer({ id, type: 'line', source: sourceId, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint });
  }
}

export function drawRoute(map, coordinates) {
  const source = map.getSource(sourceId);
  if (!source) return;
  if (!coordinates) {
    source.setData(emptyRoute);
    return;
  }
  source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } });
  let frame;
  const start = performance.now();
  function reveal(now) {
    const progress = reducedMotion() ? 1 : Math.min(1, (now - start) / 950);
    const stop = easeOut(progress) * .99;
    map.setPaintProperty(lineId, 'line-gradient', [
      'interpolate', ['linear'], ['line-progress'],
      0, gold, Math.max(.0001, stop), gold,
      Math.min(1, stop + .01), progress === 1 ? gold : 'rgba(243, 211, 148, 0)',
    ]);
    if (progress < 1) frame = requestAnimationFrame(reveal);
  }
  reveal(start);
  return () => cancelAnimationFrame(frame);
}