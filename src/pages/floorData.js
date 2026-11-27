/**
 * Floor plans data. All images live in /public/assets/plans.
 *
 * View (the twilight render, coordinates in its own 3000 × 1688 pixels):
 *   towers[].x       left / right edge of each tower
 *   roof, pitch      y of the roof line and the height of one floor (measured from the window rows)
 *   rows, topFloor   window rows above the entrance lobby, and the number of the top floor
 * Nudge these if the gold floor bands drift off the real floors (add ?edit to the page to read coordinates).
* Plans (2000 × 1414 frame for every plan image):
 *   PLANS[].shapes   outline of each unit, traced from the drawing's floor colour, so it lights up exactly on hover
 * PLANS[].units    which units exist on that plan; a jodi flat shows only when both its units exist
 */
// encodeURI (not encodeURIComponent): Vite's static server won't find files whose ',' and '&' are escaped
const P = (f) => '/assets/plans/' + encodeURI(f);

export const VIEW = {
  src: P('Front Twilight View.jpg'), w: 3000, h: 1688,
  // measured on the render: the roof line, the height of one floor, and how many window rows sit above the lobby
  roof: 336, pitch: 33.6, rows: 33, topFloor: 34, ground: 1490,
  towers: [
    { id: 'a', name: 'Tower A', x: [1123, 1459] },
    { id: 'b', name: 'Tower B', x: [1541, 1878] },
  ],
};

const REFUGE = [7, 12, 17, 22, 27, 32];
const FIRST = 4, LAST = 34;

/** What a floor is: 'typical', 'refuge', or null for podium levels without a plan. */
export function floorKind(n) {
  if (n < FIRST || n > LAST) return null;
  return REFUGE.includes(n) ? 'refuge' : 'typical';
}

export const PLANS = {
  typical: { label: 'Typical floor plan', src: P('4th-6th, 8th-11th, 13th-16th, 18th-21st, 23rd-26th, 28th-31st, 33rd & 34th typical floor plan.png'),
             units: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
             shapes: {
      u1: '1066.0,222.0 1032.5,255.5 1077.8,300.7 960.3,418.2 977.5,435.5 993.3,419.8 1217.8,644.3 1399.5,462.5 1316.9,379.9 1344.6,352.1 1260.5,268.0 1232.5,296.0 1136.2,199.7 1089.9,245.9',
      u2: '1399.4,464.9 1219.4,644.8 1477.8,903.2 1528.5,852.5 1545.7,869.7 1676.2,739.2 1579.2,642.2 1607.3,614.2 1522.0,529.0 1492.8,558.3',
      u6: '1064.2,220.8 941.4,98.1 848.2,191.2 823.5,166.5 644.7,345.2 668.7,369.3 577.5,460.5 759.8,642.8 972.3,430.3 958.0,416.0 1075.0,299.0 1030.5,254.5',
      u5: '577.2,465.2 495.7,546.8 466.2,517.3 380.5,603.0 408.7,631.3 311.8,728.2 442.8,859.2 460.3,841.8 510.8,892.3 757.6,645.6',
      u4: '1000.0,932.5 662.0,932.5 662.0,975.3 601.5,975.3 601.5,938.2 468.9,938.2 468.9,1189.0 602.5,1189.0 602.5,1239.1 854.5,1239.1 854.5,1191.0 864.0,1191.0 864.0,1200.5 1000.0,1200.5',
      u3: '1001.0,933.2 1001.0,1200.5 1108.0,1200.5 1108.0,1191.5 1118.1,1191.5 1118.1,1239.6 1369.5,1239.6 1369.5,1185.5 1503.5,1185.5 1503.5,938.5 1371.0,938.5 1371.0,974.9 1309.5,974.9 1309.5,933.2',
    } },
  refuge:  { label: 'Refuge floor plan',  src: P('7th, 12th, 17th, 22nd, 27th & 32nd Refuge Floor Plan.png'),
             units: ['u1', 'u2', 'u3', 'u4', 'u6'],
             shapes: {
      u1: '1066.0,222.0 1032.5,255.5 1077.8,300.7 960.3,418.2 977.5,435.5 993.3,419.8 1217.8,644.3 1399.5,462.5 1316.9,379.9 1344.6,352.1 1260.5,268.0 1232.5,296.0 1136.2,199.7 1089.9,245.9',
      u2: '1399.4,464.9 1219.4,644.8 1477.8,903.2 1528.5,852.5 1545.7,869.7 1676.2,739.2 1579.2,642.2 1607.3,614.2 1522.0,529.0 1492.8,558.3',
      u6: '1064.2,220.8 941.4,98.1 848.2,191.2 823.4,166.4 644.7,345.1 669.1,369.4 574.3,464.2 756.7,646.5 972.6,430.6 958.0,416.0 1075.0,299.0 1030.5,254.5',
      u4: '1000.0,932.5 662.0,932.5 662.0,975.3 601.5,975.3 601.5,938.2 468.9,938.2 468.9,1189.0 602.5,1189.0 602.5,1239.5 854.5,1239.5 854.5,1191.0 864.0,1191.0 864.0,1200.5 1000.0,1200.5',
      u3: '1001.0,933.2 1001.0,1200.5 1108.0,1200.5 1108.0,1191.5 1118.1,1191.5 1118.1,1239.6 1369.5,1239.6 1369.5,1185.5 1503.5,1185.5 1503.5,938.5 1371.0,938.5 1371.0,974.9 1309.5,974.9 1309.5,933.2',
    } },   // unit 05 is the refuge area on these floors
};

export const JODI_TYPICAL_PLAN = {
  ...PLANS.typical,
  label: 'Jodi typical floor plan',
  src: P('4th-6th, 8th-11th, 13th-16th, 18th-21st, 23rd-26th, 28th-31st, 33rd & 34th typical floor plan ( Jodi Floor Plan ).png'),
};

export const PLAN_FRAME = { w: 2000, h: 1414 };
// the part of the plan image that holds the drawing (the rest is empty margin); shown cropped to this box
export const PLAN_CROP = { x: 290, y: 70, w: 1420, h: 1210 };

export const unit04RoomSrc = (file) => '/assets/residences/1bhk/' + encodeURIComponent('WING A_Flat_04_' + file + '.jpg');

export const UNIT_04_MAP_VIEWBOX = [120, 113.12, 750, 445.41];

// Approximate camera positions as percentages of the displayed plan.
export const UNIT_04_ROOMS = [
  ['Living Room', 'Living Room', 80.133333, 37.142857],
  ['Living Passage', 'Living Passage', 57.733333, 32.380952],
  ['Kitchen', 'Kitchen', 57.866667, 44.126984],
  ['Main Bedroom', 'M_Bedroom', 19.866667, 41.904762],
  ["Kids' Bedroom", 'Kids Bedroom', 43.2, 55.714286],
  ['Main Bathroom', 'M Toilet', 16.4, 21.428571],
  ['Bathroom', 'Toilet', 48.533333, 21.111111],
].map(([name, file, left, top]) => ({
  name,
  cameraPosition: { left, top },
  src: unit04RoomSrc(file),
}));

export const UNITS = [
  { id: 'u1', label: 'Unit 01', plan: P('Unit 01.png') },
  { id: 'u2', label: 'Unit 02', plan: P('Unit 02.png') },
  { id: 'u3', label: 'Unit 03', plan: P('Unit 03.png') },
  { id: 'u4', label: 'Unit 04', plan: P('Unit 04.png') },
  { id: 'u5', label: 'Unit 05', plan: P('Unit 05.png') },
  { id: 'u6', label: 'Unit 06', plan: P('Unit 06.png') },
];
// two neighbouring homes joined into one ("jodi")
export const JODI = [
  { id: 'j12', label: 'Units 01 & 02', sub: 'Jodi flat', plan: P('Unit 01 & 02_Jodi Flat.png'), units: ['u1', 'u2'] },
  { id: 'j34', label: 'Units 03 & 04', sub: 'Jodi flat', plan: P('Unit 03 & 04_Jodi Flat.png'), units: ['u3', 'u4'] },
  { id: 'j56', label: 'Units 05 & 06', sub: 'Jodi flat', plan: P('Unit 05 & 06_Jodi Flat.png'), units: ['u5', 'u6'] },
];

export const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : Math.min(n % 10, 4) % 4] || 'th');

/* 360° views from the tower (public/assets/plans/360): which floor each was shot from, in three lights */
const V360 = (f) => '/assets/plans/360/' + encodeURI(f);
export const VIEWS = [
  { floor: 3,  label: '3rd floor',  sub: 'Amenity podium', file: '3rd AMENITY PODIUM' },
  { floor: 5,  label: '5th floor',  file: '5th RESI. FLR', eve: '5th RESI. FLR_Eve copy' },
  { floor: 10, label: '10th floor', file: '10th RESI. FLR' },
  { floor: 15, label: '15th floor', file: '15th RESI. FLR' },
  { floor: 20, label: '20th floor', file: '20th RESI. FLR' },
  { floor: 25, label: '25th floor', file: '25th RESI. FLR' },
  { floor: 30, label: '30th floor', file: '30th RESI. FLR' },
  { floor: 34, label: 'Terrace',    sub: 'Top of the tower', file: 'TERRACE FLR' },
];
export const LIGHTS = [{ id: 'Day', label: 'Day' }, { id: 'Eve', label: 'Evening' }, { id: 'Night', label: 'Night' }];
export const viewOf = (floor) => VIEWS.find((v) => v.floor === floor);
export function currentFloorLight() {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6 ? 'Night' : hour >= 17 ? 'Eve' : 'Day';
}
export const viewSrc = (v, light) => V360((light === 'Eve' && v.eve ? v.eve : `${v.file}_${light}`) + '.webp');

/* The view out of a home: the 360 shot nearest to its floor (residential shots only), turned to face the unit's windows.
   UNIT_VIEW_YAW is the pano heading in degrees for each unit; open the view, look the way the unit faces, and update it. */
// map bearing on the plan (0 = up, 90 = right) the windows face: u3/u4 bottom, u1 up-right, u2 down-right, u5 down-left, u6 up-left
export const UNIT_FACING = { u1: 45, u2: 135, u3: 180, u4: 180, u5: 225, u6: 315 };
// pano yaw = VIEW_NORTH - bearing; VIEW_NORTH was found by matching Unit 04's view to the 20th-floor photo (yaw 77 faces bearing 180)
export const VIEW_NORTH = 257;
export const UNIT_VIEW_YAW = Object.fromEntries(Object.entries(UNIT_FACING).map(([id, b]) => [id, VIEW_NORTH - b]));
export function unitViewOf(floor) {
  const homes = VIEWS.filter((v) => v.floor >= 5 && v.floor <= 30);
  return homes.reduce((a, b) => (Math.abs(b.floor - floor) < Math.abs(a.floor - floor) ? b : a));
}
