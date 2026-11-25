// Share decoded images between the route that preloads them and the viewer.
const standardImages = new Map();
const floorImages = new Map();

const isFloorPanorama = (url) => url.startsWith('/assets/plans/360/');

export function preloadPanorama(url) {
  if (!isFloorPanorama(url)) return loadPanorama(url, 'low');
  // Warm the browser cache without decoding multiple full-resolution floor images.
  return fetch(url, { cache: 'force-cache', priority: 'low' }).then((response) => response.blob()).catch(() => {});
}

export function loadPanorama(url, priority = 'high') {
  const fullResolution = isFloorPanorama(url);
  const images = fullResolution ? floorImages : standardImages;
  const limit = fullResolution ? 1 : 8;
  const cached = images.get(url);
  if (cached) {
    if (priority === 'high') cached.image.fetchPriority = 'high';
    images.delete(url);
    images.set(url, cached);
    return cached.ready;
  }

  const image = new Image();
  image.fetchPriority = priority;
  image.src = url;
  const entry = { image, ready: image.decode().then(() => image, () => {
    if (images.get(url) === entry) images.delete(url);
    return null;
  }) };
  images.set(url, entry);
  if (images.size > limit) images.delete(images.keys().next().value);
  return entry.ready;
}
