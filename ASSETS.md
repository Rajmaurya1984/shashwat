# Shree Shashwat 3.0 — Menus & Asset Checklist

Every menu in the tour, what it shows, and exactly what to provide for it.
Drop each file into `public/assets/` using the **file name** shown. The code already points at these names,
so a missing file just shows a gold placeholder until you add it.

**Legend:** ✅ already in the brochure (extracted copy included) · 📥 you need to provide · ⚙️ data/text to fill in `src/data/project.js`

---

## General image rules

| Type | Size (px) | Format | Max weight | Notes |
|---|---|---|---|---|
| Full-screen landscape | 2560 × 1440 | `.jpg` (q 80) or `.webp` | 600 KB | Keep the subject in the centre 60%; edges get cropped on phones |
| Portrait / tall card | 1600 × 2400 | `.jpg` / `.webp` | 450 KB | For E-Deck cards and phone layouts |
| 360° panorama | 8192 × 4096 (2:1) | `.jpg` (q 78) | 4 MB | **Equirectangular** only. Also export a 4096 × 2048 copy named `*-mobile.jpg` |
| Floor plan | 3000 px longest side | `.svg` (best) or transparent `.png` | 800 KB | Light lines on transparent background, north arrow included |
| Logo | vector | `.svg` | — | Outlined text, no embedded fonts |
| Video (optional) | 1920 × 1080, 6–12 s loop | `.mp4` H.264 + `.webm` | 4 MB | Muted, no audio track |

---

## 0 · Global / brand  (`public/assets/brand/`)

| # | What | File name | Status |
|---|---|---|---|
| 0.1 | Shree Shashwat 3.0 logo, gold, horizontal (mark + wordmark) | `logo-shashwat.svg` | 📥 |
| 0.2 | Logo mark only (the three loops) — **used to draw the Living Logo hub** | `logo-mark.svg` | 📥 (current one is a redraw) |
| 0.3 | Raj Realty Group logo, light version for dark backgrounds | `logo-raj-realty.svg` | 📥 |
| 0.4 | Copper texture background (brochure inside pages) | `texture-copper.jpg` | ✅ |
| 0.5 | Small loop pattern tile (brochure cover pattern), 128 × 128 | `pattern-tile.svg` | 📥 (optional) |
| 0.6 | Brand fonts (web licences): serif for headings, script for tagline | `/public/fonts/*.woff2` | 📥 (Google Fonts stand-ins used until then) |
| 0.7 | Favicon 512 × 512 | `favicon.png` | 📥 |
| ⚙️ | Brand colours (plum, copper, gold) — confirm hex values with designer | `src/styles/tokens.css` | ⚙️ |

---

## 1 · Intro gate  (route `/` before Enter)

Shows: copper background, logo draws itself, tagline, **Enter**.

| # | What | File name | Status |
|---|---|---|---|
| 1.1 | (uses 0.2 + 0.4) | — | — |
| 1.2 | Optional ambient loop video behind the gate (towers at dusk) | `intro/gate-loop.mp4` | 📥 optional |
| ⚙️ | Tagline: *Where forever finds its address* · *Luxury Residences, Mira Road* | `project.brand` | ✅ |

## 2 · Living Logo hub  (route `/`)

Shows: three loops = **Arrive · Live · Belong**. Each loop shows its first scene image. Click → zoom in → scenes.

| # | What | File name | Status |
|---|---|---|---|
| 2.1 | One hero image per scene (see chapters below — 12 images total) | listed per scene | mixed |
| ⚙️ | Chapter names, scene titles, scene text, which page each scene opens | `project.chapters` | ✅ from brochure |

## 3 · Contents menu  (opens from **Menu** on every page)

Shows: numbered list of every page; hovering shows a round preview photo.

| # | What | File name | Status |
|---|---|---|---|
| 3.1 | One square preview per menu item, 1200 × 1200, subject centred | `menu/<page-id>.jpg` (e.g. `menu/location.jpg`) | 📥 (falls back to the page hero) |

---

## ARRIVE chapter

### 4 · The Address  (`/address`)
Two towers, the promise, 4 key facts.

| # | What | File name | Status |
|---|---|---|---|
| 4.1 | Aerial of both towers, landscape | `address/aerial.jpg` | ✅ |
| 4.2 | Eye-level front elevation of both towers, portrait | `address/towers.jpg` | ✅ |
| 4.3 | Towers at dusk (lights on), landscape | `address/towers-dusk.jpg` | 📥 |
| ⚙️ | Key facts: number of storeys, total homes, configurations (2/3 BHK?), carpet areas, possession date, **MahaRERA no.** | `project.address.facts` | ⚙️ **needed** |

### 5 · Location  (`/location`)
Interactive map, filters (Connectivity · Education · Health care · Leisure · Entertainment), distances.

| # | What | File name | Status |
|---|---|---|---|
| 5.1 | Kashigaon Metro image | `location/metro.jpg` | ✅ |
| 5.2 | Optional photo per landmark, 800 × 600 | `location/<landmark-id>.jpg` | 📥 optional |
| ⚙️ | **Site latitude/longitude**, and lat/lng for each landmark (to place pins correctly) | `project.location` | ⚙️ **needed** |
| ⚙️ | Drive/walk times (minutes) if you want them beside the km | `project.location.places[].min` | ⚙️ optional |
| ⚙️ | Mapbox / Google Maps key if you want a real map instead of the drawn one | `.env` → `VITE_MAPBOX_TOKEN` | ⚙️ optional |

Distances already filled from the brochure: Kashigaon Metro 0.5 km · GCC Hotel & Club 0.8 · Siddhivinayak Hospital 0.9 · DMart 1.3 · Bhaktivedanta Hospital 1.4 · ISKCON Temple 1.4 · Podar International 1.7 · Rassaz Mall 2.0 · Wockhardt Hospital 2.1 · Mira Road Station 2.8.

### 6 · Grand Entrance Lobby  (`/lobby`)

| # | What | File name | Status |
|---|---|---|---|
| 6.1 | Lobby render, landscape | `lobby/lobby.jpg` | ✅ (low-res: 1457 px — ask for 2560 px) |
| 6.2 | Lobby **360° panorama** | `lobby/lobby-360.jpg` (+ `-mobile.jpg`) | 📥 |
| ⚙️ | 4 lobby highlights (e.g. double height, Italian marble, concierge) | `project.lobby.points` | ⚙️ confirm |

---

## LIVE chapter

### 7 · The Story / Lifestyle  (`/story`)

| # | What | File name | Status |
|---|---|---|---|
| 7.1 | Lifestyle living room (woman, sunset) | `story/living-lux.jpg` | ✅ |
| 7.2 | Family in living room | `story/family.jpg` | ✅ (low-res: 758 px — ask for 2560 px) |

### 8 · Residences  (`/residences`)  — tabs: Living · Bedroom · Kitchen · Bathroom

| # | What | File name | Status |
|---|---|---|---|
| 8.1 | Living & dining | `residences/living.jpg` | ✅ |
| 8.2 | Master bedroom | `residences/bedroom.jpg` | ✅ (low-res: 846 px) |
| 8.3 | Kitchen | `residences/kitchen.jpg` | ✅ |
| 8.4 | Bathroom | `residences/bathroom.jpg` | 📥 **missing from brochure** |
| 8.5 | Optional: 360° of each room | `residences/<room>-360.jpg` | 📥 optional |
| ⚙️ | Spec list per room | `project.residences` | ✅ from brochure |

### 9 · Floor Plans  (`/floor-plans`, `/floor-plans/:planId`)
Pick a tower → pick a floor band → see the typical floor → click a flat → unit plan with RERA carpet.

| # | What | File name | Status |
|---|---|---|---|
| 9.1 | Tower selector image (both towers, eye level) | `plans/towers-front.jpg` | ✅ (reuse 4.2) |
| 9.2 | Typical floor plan **per tower** | `plans/tower-a-typical.svg`, `plans/tower-b-typical.svg` | 📥 |
| 9.3 | Unit plan per flat type (2 BHK, 3 BHK…) | `plans/unit-<type>.svg` e.g. `unit-2bhk-a.svg` | 📥 |
| 9.4 | Key plan thumbnail showing where the flat sits on the floor | `plans/key-<type>.svg` | 📥 optional |
| ⚙️ | Floor ranges per plan, flat numbers, **RERA carpet area**, balcony/deck area, facing | `project.plans` | ⚙️ **needed** |
| ⚙️ | Floor heights (to highlight floors on the tower image): top-y and bottom-y % of each floor band | `project.plans.floorBands` | ⚙️ |

### 10 · Apartment 360° tour  (`/apartment`)
Walk room to room with hotspots.

| # | What | File name | Status |
|---|---|---|---|
| 10.1 | 360° panorama per room: living, kitchen, bedroom 1, bedroom 2, bathroom, balcony | `apartment/<room>.jpg` (+ `-mobile.jpg`) | 📥 |
| ⚙️ | For each room: start direction (yaw °) and hotspots `{ to, yaw, pitch }` | `project.apartment.rooms` | ⚙️ (place them in the viewer's marker mode) |

---

## BELONG chapter

### 11 · The E-Deck amenities  (`/amenities`, `/amenities/:id`)
Tall arch cards; each opens a full-screen view (360° if provided, otherwise a pan of the render).

| # | Amenity | Card (portrait) | Full view / 360° | Status |
|---|---|---|---|---|
| 11.1 | Swimming pool | `amenities/pool-card.jpg` | `amenities/pool.jpg` / `pool-360.jpg` | ✅ render · 📥 card + 360 |
| 11.2 | Pool deck at dusk | `amenities/pool-dusk-card.jpg` | `amenities/pool-dusk.jpg` | ✅ |
| 11.3 | Gym | `amenities/gym-card.jpg` | `amenities/gym.jpg` / `gym-360.jpg` | ✅ render · 📥 card + 360 |
| 11.4 | Yoga room | `amenities/yoga-card.jpg` | `amenities/yoga.jpg` / `yoga-360.jpg` | ✅ (low-res) · 📥 |
| 11.5 | Landscaped E-Deck | `amenities/edeck-card.jpg` | `amenities/edeck.jpg` | ✅ |
| 11.6+ | Any other amenity (kids' play, indoor games, banquet, jogging track…) | `amenities/<id>-card.jpg` | `amenities/<id>.jpg` | 📥 + ⚙️ full amenity list |

### 12 · Golden Hour  (`/golden-hour`)  — Day / Evening / Night switch

| # | What | File name | Status |
|---|---|---|---|
| 12.1 | Same camera angle in **day**, **evening**, **night** (3 matching renders) | `golden/day.jpg`, `golden/evening.jpg`, `golden/night.jpg` | 📥 (only dusk exists today) |
| 12.2 | Aerial "From above Shashwat glows" | `golden/aerial-night.jpg` | 📥 |

### 13 · Specifications / What to expect  (`/specifications`)

| # | What | File name | Status |
|---|---|---|---|
| 13.1 | Background lifestyle image | `specs/background.jpg` | ✅ (reuse family) |
| ⚙️ | Full spec sheet by category (structure, flooring, doors, windows, kitchen, toilets, electrical, lifts, security, fire, parking) | `project.specifications` | ⚙️ partly in brochure |

---

## Other pages

### 14 · Legacy — Raj Realty Group  (`/legacy`)

| # | What | File name | Status |
|---|---|---|---|
| 14.1 | Photo of a completed Raj Realty project | `legacy/hero.jpg` | 📥 |
| 14.2 | Thumbnails of past projects, 1200 × 900 | `legacy/project-<n>.jpg` | 📥 |
| ⚙️ | Years, projects delivered, sq ft delivered, happy families | `project.legacy.stats` | ⚙️ **needed** |

### 15 · Contact / Enquire  (`/contact`)

| # | What | File name | Status |
|---|---|---|---|
| 15.1 | Closing image | `contact/background.jpg` | ✅ (reuse aerial) |
| ⚙️ | Phone (brochure shows **+91 9323 422 XXX**), email, website, site / head / corporate office addresses | `project.contact` | ⚙️ **needed** |
| ⚙️ | Design architect, structural, MEP, geotechnical consultants | `project.contact.consultants` | ⚙️ |
| ⚙️ | Where enquiries go (CRM / email API endpoint) | `.env` → `VITE_ENQUIRY_ENDPOINT` | ⚙️ |
| ⚙️ | MahaRERA registration number + QR code image | `contact/rera-qr.png` | 📥 **legally required** |

### 16 · Disclaimer (footer on every page)
✅ Text from the brochure is already in `project.legal.disclaimer`.

---

## Quick "please send" list for the client

1. Official logo SVGs (Shashwat mark + wordmark, Raj Realty light version)
2. MahaRERA number + QR, phone, email, office addresses
3. Higher-resolution renders (2560 px) of: lobby, family living room, bedroom, yoga room
4. Bathroom render
5. Day / evening / night versions of one tower view
6. Typical floor plans (each tower) + unit plans with RERA carpet areas and floor ranges
7. 360° panoramas: lobby, amenities, sample apartment rooms
8. Site + landmark coordinates (or a pinned Google Maps list)
9. Full amenity list and full specification sheet
10. Raj Realty Group track-record numbers and past project photos
