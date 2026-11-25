export const isPanoramaRoute = (path) =>
  /^\/(?:floor-plans\/view-\d+|lobby\/360|apartment|amenities\/[^/]+)\/?$/.test(path);
