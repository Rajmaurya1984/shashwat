/**
 * ONE file drives the whole tour.
 * Every menu, page, image path and line of text lives here. Fill the `TODO`s with the client's data.
 * Image paths are relative to /public. A missing image shows a gold placeholder (see components/ui/Img.jsx).
 * The asset list with sizes is in ASSETS.md.
 */
const A = (p) => `/assets/${p}`;

const AMENITY_IMAGES = {
  pool: A('amenities/swimmingPoolCam01_360.jpg'),
  poolDeck: A('amenities/swimmingPoolCam02_360.jpg'),
  poolside: A('amenities/Swimming%20Pool%20Cam%2003_360.jpg'),
  gym: A('amenities/gym.jpg'),
  lobby: A('amenities/lobby.jpg'),
  yoga: A('amenities/Yoga.jpg'),
  amphitheatre: A('amenities/amphitheatreArea360.jpg'),
  kids: A('amenities/kidsPlayArea360.jpg'),
  lawn: A('amenities/lawnArea360.jpg'),
};

export const project = {
  brand: {
    name: 'Shree Shashwat',
    version: '3.0',
    tagline: 'Where forever finds its address',
    place: 'Luxury Residences · Mira Road',
    developer: 'Raj Realty Group',
    logo: A('home/logo.png'),
    polyLogo: A('polylogo.png'),
    logoMark: A('home/logo%20_01.png'),
    mapSymbol: A('brand/shashwat-map-symbol.png'),
    developerLogo: A('brand/logo-raj-realty.svg'),
    texture: A('brand/texture-copper.jpg'),
  },

  legal: {
    rera: 'MahaRERA: TODO',
    disclaimer:
      "Perspectives are an artist's impression; images are for representational purposes only. Plans are subject to change, modification or amendment without notice, as required by the architects and/or authorities. All amenities are subject to approval. Carpet area may vary up to ±3% on final measurement.",
  },

  /* ---------------- the contents menu: order = menu order ---------------- */
  menu: [
    { id: 'home', path: '/', label: 'Home', preview: A('address/aerial.jpg') },
    { id: 'legacy', path: '/legacy', label: 'Legacy', preview: A('legacy/hero.jpg') },
    { id: 'address', path: '/address', label: 'The Address', preview: A('address/towers.jpg') },
    { id: 'location', path: '/location', label: 'Location', preview: A('location/metro.jpg') },
    { id: 'lobby', path: '/lobby/360', label: 'Grand Entrance Lobby', preview: A('lobby/lobby.jpg') },
    { id: 'story', path: '/story', label: 'The Story', preview: A('story/living-lux.jpg') },
    { id: 'residences', path: '/residences', label: 'Residences', preview: A('residences/living.jpg') },
    { id: 'floor-plans', path: '/floor-plans', label: 'Floor Plans', preview: A('plans/towers-front.jpg') },
    { id: 'apartment', path: '/apartment', label: 'Apartment 360°', preview: A('residences/living.jpg') },
    { id: 'amenities', path: '/amenities', label: 'The E-Deck', preview: A('menu/podium.jpg') },
    { id: 'golden-hour', path: '/golden-hour', label: 'Golden Hour', preview: A('golden/evening.jpg') },
    { id: 'specifications', path: '/specifications', label: 'What to Expect', preview: A('specs/background.jpg') },
    { id: 'contact', path: '/contact', label: 'Contact', preview: A('contact/background.jpg') },
  ],

  /* ---------------- the Living Logo hub: 3 loops = 3 chapters ---------------- */
  chapters: [
    {
      id: 'arrive', name: 'Arrive', sub: 'The address', tint: '#5a2414',
      scenes: [
        { img: A('address/aerial.jpg'), title: 'Homes that stand <em>tall</em>', text: 'Rising above Mira Road, two graceful high-rise towers and a lifestyle designed around togetherness.', link: '/address' },
        { img: A('location/metro.jpg'), title: 'Effortlessly <em>connected</em>', text: 'Kashigaon Metro 0.5 km · DMart 1.3 km · Mira Road Station 2.8 km.', link: '/location' },
        { img: A('lobby/lobby.jpg'), title: 'Arrive. Feel the day <em>fall away</em>', text: 'Your first welcome and your last pause before home.', link: '/lobby/360' },
      ],
    },
    {
      id: 'live', name: 'Live', sub: 'The residences', tint: '#6a4022',
      scenes: [
        { img: A('story/living-lux.jpg'), title: 'Luxury is how <em>you live</em>', text: 'The unhurried morning. The quiet minute after a long day.', link: '/story' },
        { img: A('residences/living.jpg'), title: 'Articulated <em>living</em>', text: 'Large-format windows for ample light and ventilation.', link: '/residences' },
        { img: A('plans/towers-front.jpg'), title: 'Find your <em>floor</em>', text: 'Choose a tower, a floor and a home.', link: '/floor-plans' },
        { img: A('residences/kitchen.jpg'), title: 'Step <em>inside</em>', text: 'Walk through a sample apartment in 360°.', link: '/apartment' },
      ],
    },
    {
      id: 'belong', name: 'Belong', sub: 'The E-Deck', tint: '#6e2a1e',
      scenes: [
        { img: A('menu/podium.jpg'), title: 'A world above <em>the world</em>', text: 'A landscaped podium level where life slows down.', link: '/amenities' },
        { img: AMENITY_IMAGES.pool, title: 'Your daily dive <em>into calm</em>', text: 'Early laps, lazy weekends, laughter in the shallows.', link: '/amenities/pool' },
        { img: A('amenities/gym.jpg'), title: 'Strength for <em>the body</em>', text: 'Wellness minutes from your door.', link: '/amenities/gym' },
        { img: A('golden/evening.jpg'), title: 'When the sky turns <em>gold</em>', text: 'The towers light up and the pool shimmers like liquid amber.', link: '/golden-hour', focusY: 0.85 },
      ],
    },
  ],

  /* ---------------- pages ---------------- */
  legacy: {
    hero: A('legacy/hero.jpg'),
    eyebrow: 'A Raj Realty Group development',
    title: 'Built to <em>last</em>',
    text: 'TODO: a two-line story of Raj Realty Group.',
    stats: [ // TODO real numbers
      { value: 'TODO', unit: 'years', label: 'Of building' },
      { value: 'TODO', unit: '+', label: 'Projects delivered' },
      { value: 'TODO', unit: 'sq.ft.', label: 'Delivered' },
      { value: 'TODO', unit: '+', label: 'Happy families' },
    ],
    projects: [ // TODO past projects
      // { name: 'Project name', place: 'Mira Road', img: A('legacy/project-1.jpg') },
    ],
  },

  address: {
    hero: A('address/towers.jpg'),
    aerial: A('address/aerial.jpg'),
    eyebrow: 'The Address',
    title: 'Homes that stand tall. <em>Families that stand together.</em>',
    text: 'Rising above Mira Road, Shree Shashwat 3.0 brings two graceful high-rise towers and a lifestyle designed around togetherness. Every residence is shaped to bring more light, more air and more of what matters: your people.',
    facts: [
      { value: '2', unit: 'towers', label: 'Graceful high-rises' },
      { value: 'TODO', unit: 'storeys', label: 'Per tower' },
      { value: 'TODO', unit: 'BHK', label: 'Configurations' },
      { value: '0.5', unit: 'km', label: 'To Kashigaon Metro' },
    ],
  },

  location: {
    eyebrow: 'Close Vicinity',
    text: 'At the heart of Mira Road, everything you need is within easy reach.',
    site: {
      name: 'Shree Shashwat 3.0',
      lat: 19.2776274,
      lng: 72.8766093,
      mapsUrl: 'https://www.google.com/maps/place/Shree+Shashwat+Garden/data=!4m2!3m1!1s0x3be7b0679ffaaaab:0x607088e4460d6a5f',
    },
    image: A('location/metro.jpg'),
    categories: ['Connectivity', 'Education', 'Health care', 'Leisure', 'Entertainment'],
    // Keep brochure distances independent of map pin coordinates.
    places: [
      { id: 'kashigaon-metro', name: 'Kashigaon Metro Station', km: 0.5, cat: 'Connectivity', lat: 19.27769, lng: 72.88016 },
      { id: 'gcc', name: 'GCC Hotel & Club', km: 0.8, cat: 'Leisure', lat: 19.282983, lng: 72.8787035 },
      { id: 'siddhivinayak', name: 'Siddhivinayak Multispeciality Hospital', km: 0.9, cat: 'Health care', lat: 19.2842684, lng: 72.8773742 },
      { id: 'dmart', name: 'DMart', km: 1.3, cat: 'Leisure', lat: 19.2690829, lng: 72.8774951 },
      { id: 'bhaktivedanta', name: 'Bhaktivedanta Hospital', km: 1.4, cat: 'Health care', lat: 19.2702023, lng: 72.8704514 },
      { id: 'iskcon', name: 'ISKCON Temple (Radha Giridhari)', km: 1.4, cat: 'Leisure', lat: 19.2691716, lng: 72.8715926 },
      { id: 'podar', name: 'Podar International School (CBSE)', km: 1.7, cat: 'Education', lat: 19.283244, lng: 72.887472 },
      { id: 'rassaz', name: 'Rassaz Multiplex and Mall', km: 2.0, cat: 'Entertainment', lat: 19.2842219, lng: 72.8632998 },
      { id: 'wockhardt', name: 'Wockhardt Hospital', km: 2.1, cat: 'Health care', lat: 19.2842541, lng: 72.8621952 },
      { id: 'mira-road-stn', name: 'Mira Road Railway Station', km: 2.8, cat: 'Connectivity', lat: 19.2817, lng: 72.85607 },
    ],
  },

  lobby: {
    hero: A('lobby/lobby.jpg'),
    pano: AMENITY_IMAGES.lobby,
    eyebrow: 'Grand Entrance Lobby',
    title: 'Arrive. And feel <em>the day fall away.</em>',
    text: "The grand entrance lobby is your first welcome and your last pause before home. Soaring volumes, warm lighting and refined finishes make every arrival feel like an occasion.",
    points: ['Soaring, generous volumes', 'Warm, layered lighting', 'Refined, marble-cool finishes', 'A calm seating lounge'], // TODO confirm
  },

  story: {
    hero: A('story/living-lux.jpg'),
    second: A('story/family.jpg'),
    eyebrow: 'The Story',
    title: 'Luxury is not what you own. <em>It is how you live.</em>',
    text: 'Great cities are not built in a day, and great homes are not built for one. Shree Shashwat 3.0 begins with a simple belief: a home should hold your life as it grows, year after year.',
    quote: 'Welcome to a life with room to breathe.',
    quoteText: 'It is the unhurried morning by the water. The quiet minute in a marble-cool lobby after a long day. The evening when the whole family is home and nowhere else to be.',
  },

  residences: {
    eyebrow: 'The Residences',
    rooms: [
      { id: 'living', name: 'Living', img: A('residences/living.jpg'), title: 'Articulated living space', tag: 'Light, air and room to gather',
        specs: ['Large-format tiles in living and dining area', 'Large-format aluminium windows for ample light and ventilation', 'Modular electrical switches', 'Premium paint finish on walls', 'Teak wood finish door frame', 'Both-side laminated door with premium fittings'] },
      { id: 'bedroom', name: 'Bedroom', img: A('residences/bedroom.jpg'), title: 'Articulated bedroom space', tag: 'Rest, redefined.',
        specs: ['Large-format tiles', 'Large-format aluminium windows for ample light and ventilation', 'Modular electrical switches', 'Premium paint finish on walls', 'Teak wood finish door frame', 'Both-side laminated door with premium fittings'] },
      { id: 'kitchen', name: 'Kitchen', img: A('residences/kitchen.jpg'), title: 'The kitchen', tag: 'Where every meal becomes a memory.',
        specs: ['Superior-finish kitchen granite platform', 'Branded sink with superior plumbing fittings', 'Large-format wall tiles', 'Provision for refrigerator, washer-dryer, microwave oven and water purifier'] },
      { id: 'bathroom', name: 'Bathroom', img: A('residences/bathroom.jpg'), title: 'The bathroom', tag: 'Thoughtful, every day.',   // TODO image
        specs: ['Premium bathroom fittings', 'Electrical modular switches', 'Anti-skid floor tiles', 'High-quality non-corrosive plumbing', 'Geyser and exhaust fan provision', 'Large-format wall tiles', 'Wash basin with counter'] },
    ],
  },

  plans: {
    eyebrow: 'Floor Plans',
    title: 'Choose a <em>home</em>',
    towerImage: A('plans/towers-front.jpg'),
    towers: [
      // TODO: real towers, floor bands and units. `band` = top/bottom of the floor range on the tower image, in % of image height.
      { id: 'a', name: 'Tower A', floors: [
        { id: 'a-typical', label: 'Typical · 2nd to TODO', plan: A('plans/tower-a-typical.svg'), band: [18, 80], x: [18, 46],
          units: [
            { id: 'a-2bhk', type: '2 BHK', carpet: 'TODO sq.ft.', facing: 'TODO', plan: A('plans/unit-2bhk-a.svg') },
            { id: 'a-3bhk', type: '3 BHK', carpet: 'TODO sq.ft.', facing: 'TODO', plan: A('plans/unit-3bhk-a.svg') },
          ] },
      ] },
      { id: 'b', name: 'Tower B', floors: [
        { id: 'b-typical', label: 'Typical · 2nd to TODO', plan: A('plans/tower-b-typical.svg'), band: [18, 80], x: [52, 80],
          units: [
            { id: 'b-2bhk', type: '2 BHK', carpet: 'TODO sq.ft.', facing: 'TODO', plan: A('plans/unit-2bhk-b.svg') },
          ] },
      ] },
    ],
  },

  apartment: {
    eyebrow: 'Apartment 360°',
    // TODO 360° panoramas (2:1 equirectangular). yaw/pitch in degrees. Hotspots link rooms.
    rooms: [
      { id: 'living', name: 'Living', pano: A('apartment/living.jpg'), startYaw: 0, hotspots: [{ to: 'kitchen', yaw: 60, pitch: -8 }, { to: 'bedroom', yaw: -90, pitch: -8 }] },
      { id: 'kitchen', name: 'Kitchen', pano: A('apartment/kitchen.jpg'), startYaw: 0, hotspots: [{ to: 'living', yaw: 180, pitch: -8 }] },
      { id: 'bedroom', name: 'Bedroom', pano: A('apartment/bedroom.jpg'), startYaw: 0, hotspots: [{ to: 'living', yaw: 180, pitch: -8 }] },
    ],
  },

  amenities: {
    eyebrow: 'Podium Level Amenities',
    title: 'A world above <em>the world.</em>',
    text: 'Lift away from the city onto the E-Deck, a landscaped podium level where life slows down. Swim, train, stretch, play or simply sit back, all within the comfort of your own address.',
    items: [
      { id: 'pool', name: 'Infinity Swimming Pool', pano: AMENITY_IMAGES.pool, title: 'Your daily dive into calm.', text: 'Slip into the sparkling pool and let the day dissolve.' },
      { id: 'gym', name: 'Gym', pano: AMENITY_IMAGES.gym, title: 'Strength for the body.', text: 'Begin your day with a power workout, minutes from your door.' },
      { id: 'yoga', name: 'Yoga Room', pano: AMENITY_IMAGES.yoga, title: 'Stillness for the mind.', text: 'End it with a quiet flow.' },
      { id: 'pool-dusk', name: 'Pool Deck', pano: AMENITY_IMAGES.poolDeck },
      { id: 'poolside', name: 'Poolside', pano: AMENITY_IMAGES.poolside },
      { id: 'amphitheatre', name: 'Amphitheatre', pano: AMENITY_IMAGES.amphitheatre },
      { id: 'kids-play-area', name: "Kids' Play Area", pano: AMENITY_IMAGES.kids },
      { id: 'lawn', name: 'Lawn Area', pano: AMENITY_IMAGES.lawn },
      { id: 'edeck', name: 'Landscaped E-Deck', image: A('menu/podium.jpg'), title: 'A world above the world.', text: 'Swim, train, stretch, play or simply sit back.' },
    ],
  },

  golden: {
    eyebrow: 'Golden Hour',
    title: 'When the sky turns gold, <em>home glows brighter.</em>',
    text: 'As evening settles, the towers light up and the pool shimmers like liquid amber. This is the hour when Shashwat is at its most magical.',
    // Same camera angle at three times of day. Missing ones fall back to the next available.
    views: [
      { id: 'day', label: 'Day', img: A('golden/day.jpg') },
      { id: 'evening', label: 'Evening', img: A('golden/evening.jpg'), focusY: 0.8 },
      { id: 'night', label: 'Night', img: A('golden/night.jpg') },
    ],
  },

  specifications: {
    background: A('specs/background.jpg'),
    eyebrow: 'What to Expect',
    groups: [
      { name: 'Living & bedrooms', items: ['Large-format tiles', 'Large-format aluminium windows', 'Modular electrical switches', 'Premium paint finish', 'Teak wood finish door frames', 'Both-side laminated doors'] },
      { name: 'Kitchen', items: ['Granite platform', 'Branded sink', 'Large-format wall tiles', 'Appliance provisions'] },
      { name: 'Bathrooms', items: ['Premium fittings', 'Anti-skid tiles', 'Non-corrosive plumbing', 'Geyser & exhaust provision', 'Wash basin with counter'] },
      { name: 'Building', items: ['TODO lifts', 'TODO security', 'TODO fire safety', 'TODO parking'] },
    ],
  },

  contact: {
    background: A('contact/background.jpg'),
    script: 'Your forever begins here.',
    text: 'Shree Shashwat 3.0 is more than an address. It is a decision to give your family space, light and a future that lasts. We’d be honoured to welcome you home.',
    phone: '+91 9323 422 XXX',            // TODO real number
    email: 'TODO',
    website: 'TODO',
    offices: [
      { label: 'Site address', text: 'TODO' },
      { label: 'Head office', text: 'TODO' },
      { label: 'Corporate office', text: 'TODO' },
    ],
    consultants: [
      { role: 'Design Architect', name: 'TODO' },
      { role: 'Structural Consultant', name: 'TODO' },
      { role: 'MEP Consultant', name: 'TODO' },
      { role: 'Geotechnical Consultant', name: 'TODO' },
    ],
    reraQr: A('contact/rera-qr.png'),
  },
};
