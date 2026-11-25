import { project } from '../data/project.js';

/**
 * Menu page content. Edit here; MenuPage.jsx reads only this file.
 *
 * rects: the part of the tower whose windows switch on for each section, in PIXELS ON THE TOWER IMAGE
 *        ([x0, x1, y0, y1], image is tower.width × tower.height). Several rects = several lit areas.
 */
const A = (p) => `/assets/menu/${p}`;
const TA = [251, 526], TB = [587, 861], PODIUM = [196, 905];        // tower A, tower B, podium (x range)

export const menuData = {
  eyebrow: 'Explore Shashwat',
  tower: { src: A('towers.jpg'), width: 1067, height: 1333, alt: 'Shree Shashwat 3.0 at dusk, Tower A and Tower B' },

  // window grid the lights are drawn on (image px). row = floor height, bay = window width.
  windows: [
    { x: TA, y: [200, 1062], row: 27, bay: 25 },                    // Tower A facade
    { x: TB, y: [194, 1062], row: 27, bay: 25 },                    // Tower B facade
    { x: PODIUM, y: [1062, 1198], row: 34, bay: 30 },               // podium
    { x: [0, 1067], y: [1200, 1330], row: 44, bay: 48, street: true }, // street (soft glow, no window frames)
  ],
  // Floor Scan outlines (image px). Each tower: left edge, front corner, right edge; the roof line and the
  // line under the lowest floor at those three x positions. Nudge these if the gold lines drift off the slabs.
  floorScan: [
    { xs: [252, 357, 524], top: [243, 184, 240], bottom: [1066, 1058, 1064], floors: 31, perspective: 1.08 },
    { xs: [590, 718, 861], top: [239, 163, 244], bottom: [1060, 1052, 1062], floors: 31, perspective: 1.08 },
  ],

  caption: { where: 'Explore', line: 'Point at a section to switch on its lights.' },

  sections: [
    { id: 'home',     path: '/',          label: 'Home',           where: 'The whole address',        line: 'Two towers above Mira Road, made to last.',            preview: A('aerial.jpg'),      rects: [[...TA, 205, 1075], [...TB, 198, 1075], [...PODIUM, 1070, 1200]] },
    { id: 'legacy',    path: '/legacy',     label: 'The Legacy',     where: 'Life at height',           line: 'Luxury is not what you own. It is how you live.',      preview: A('family.jpg'),      rects: [[...TA, 330, 560], [...TB, 325, 560]] },
    { id: 'location', path: '/location',    label: 'Location',       where: 'Street level · Mira Road', line: 'Kashigaon Metro 0.5 km. DMart 1.3 km. Station 2.8 km.', preview: A('metro.jpg'),     rects: [[0, 1067, 1200, 1333]] },
    // { id: 'address',  path: '/address',     label: 'The Address',    where: 'Tower A · Tower B',        line: 'Homes that stand tall. Families that stand together.', preview: A('towers.jpg'),     rects: [[...TA, 205, 1075], [...TB, 198, 1075]] },
    { id: 'lobby',    path: '/lobby/360',       label: 'Entrance Lobby',              line: 'Arrive, and feel the day fall away.',                  preview: A('lobby.jpg'),       rects: [[...PODIUM, 1112, 1198]] },
    { id: 'edeck',    path: '/amenities',   label: 'The E-Deck',     where: 'Podium level',             line: 'Pool, gym, yoga: a world above the world.',            preview: A('podium.jpg'),      rects: [[...PODIUM, 1060, 1112]] },
    { id: 'homes',    path: '/residences',  label: 'Residences',     where: 'Every floor',              line: 'Light, air and room to gather, in every home.',        preview: A('living.jpg'),      rects: [[...TA, 560, 1060], [...TB, 560, 1060]] },
    { id: 'plans',    path: '/floor-plans', label: 'Floor Plans',    where: 'Find your floor',          line: 'Choose a tower, a floor, then a home.',                preview: A('towers.jpg'),      rects: [[...TA, 380, 900], [...TB, 375, 900]] },
    // { id: 'glow',     path: '/golden-hour', label: 'Golden Hour',    where: 'The crown',                line: 'When the sky turns gold, home glows brighter.',        preview: A('towers-pool.jpg'), rects: [[...TA, 198, 330], [...TB, 192, 325]] },
    // { id: 'contact',  path: '/contact',     label: 'Your Forever',   where: 'Your home',                line: 'Your forever begins here.',                            preview: A('brochure.jpg'),    rects: [[...TA, 205, 1075], [...TB, 198, 1075]] },
  ],

  // bottom-left links. `path` = in-app route (trefoil transition), `href` = external link
  links: [
    { label: 'Walk through a flat →', path: '/apartment' },
    { label: 'Book a site visit', path: '/contact' },
  ],
  phone: project.contact.phone,

  // bottom-right facts
  facts: [
    { value: '2', label: 'Towers' },
    { value: 'E-Deck', label: 'Podium living' },
    { value: '0.5 km', label: 'To the Metro' },
  ],
};
