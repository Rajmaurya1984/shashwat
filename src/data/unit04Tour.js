import { unit04RoomSrc } from '../pages/floorData.js';

export function normalizeBearing(degrees) {
  return ((degrees % 360) + 360) % 360;
}

const roomLinks = {
  'Living Room': [
    ['Living Passage', 11.705120740270667, -11.36847242267912],
  ],
  'Living Passage': [
    ['Living Room', -70.92687544497235, -5.504983655623286],
    ['Kids Bedroom', 103.11961773822053, -5.449228548095574],
    ['M_Bedroom', 90.90936247778924, 2.896401599231405],
    ['Toilet', 71.55183560141356, -3.804882136978153],
    ['Kitchen', 166.4505308548763, -15.970672939588752],
  ],
  'Kids Bedroom': [
    ['Living Passage', -0.8811600077708592, -5.286303883580609],
  ],
  M_Bedroom: [
    ['Living Passage', -90.76717103759971, -5.6839830121469035],
    ['M Toilet', 65.46937188544851, 1.5977154641000726],
  ],
  'M Toilet': [
    ['M_Bedroom', -91.98756119185593, 6.4301558173661],
  ],
  Toilet: [
    ['Living Passage', -82.3709376760849, 17.44471272844392],
  ],
  Kitchen: [
    ['Toilet', -47.459738926895994, -2.6313472994306526],
    ['Living Passage', -124.93799994807671, -14.705597533700592],
  ],
};

export const unit04Pointers = Object.fromEntries(Object.entries(roomLinks).map(([room, links]) => [
  unit04RoomSrc(room),
  links.map(([to, yaw, pitch]) => ({ to: unit04RoomSrc(to), yaw, pitch })),
]));

export const unit04Radar = {
  [unit04RoomSrc('Kitchen')]: { x: 55, y: 54, offset: 265.084089883547 },
  [unit04RoomSrc('Living Room')]: { x: 72, y: 53, offset: 1.8374064196282234 },
};
