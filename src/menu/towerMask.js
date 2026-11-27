/** The tower's traced outline (menuData.floorScan) as a CSS mask, so only the buildings + podium show. */
export function towerOutlineMask(tower, floorScan) {
  const polys = floorScan.map(({ xs, top, bottom }) =>
    `<polygon points="${xs[0] - 2},${bottom[0] + 6} ${xs[0] - 2},${top[0]} ${xs[1]},${top[1] - 3} ${xs[2] + 2},${top[2]} ${xs[2] + 2},${bottom[2] + 6}"/>`).join('');
  const podium = '<rect x="196" y="1040" width="709" height="165"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tower.width} ${tower.height}" preserveAspectRatio="none"><g fill="#000">${polys}${podium}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** The Shashwat mark: four open loops turning like a pinwheel (top, right, bottom, left) in a 100 × 100 box.
 *  [cx, cy, r, rotation] — rotation sets where each loop's cut sits, as in the logo. */
export const TREFOIL = [[50, 32, 18, 60], [68, 50, 18, 150], [50, 68, 18, 240], [32, 50, 18, 330]];
export function trefoilMask() {
  const c = TREFOIL.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="#000">${c}</g></svg>`)}")`;
}
