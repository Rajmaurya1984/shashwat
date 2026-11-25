import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { TransitionProvider } from './lib/transition.jsx';
import Chrome from './components/site/Chrome.jsx';
import ContentsMenu from './menu/ContentsMenu.jsx';
import Splash from './pages/Splash.jsx';
import Residences from './pages/Residences.jsx';
import FloorPlans from './pages/FloorPlans.jsx';
import { currentFloorLight, viewOf, viewSrc } from './pages/floorData.js';
import { loadPanorama } from './lib/panoramaImages.js';
import { project } from './data/project.js';
import Amenities from './pages/Amenities.jsx';

import Legacy from './pages/Legacy.jsx';
import Address from './pages/Address.jsx';
import Story from './pages/Story.jsx';
import GoldenHour from './pages/GoldenHour.jsx';
import Specifications from './pages/Specifications.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

// 360° pages pull in three.js, so they load only when opened
function loadable(load) {
  let pending;

  function preload() {
    return pending ??= load().then(module => {

      return module;
    }).catch(error => {
      pending = undefined;
      throw error;
    });
  }
  const Lazy = lazy(preload);
  return { Component: function View() {
    return <Lazy />;
  }, preload };
}

const { Component: Location, preload: loadLocation } = loadable(() => import('./pages/Location.jsx'));
const { Component: Apartment, preload: loadApartment } = loadable(() => import('./pages/Apartment.jsx'));
const { Component: Lobby360, preload: loadLobby } = loadable(() => import('./pages/Lobby360.jsx'));
const { Component: AmenityView, preload: loadAmenity } = loadable(() => import('./pages/AmenityView.jsx'));

function preloadRoute(path) {
  if (path === '/location') return loadLocation();
  const viewPath = /^\/floor-plans\/view-(\d+)\/?$/.exec(path);
  if (viewPath) {
    const view = viewOf(Number(viewPath[1]));
    if (view) loadPanorama(viewSrc(view, currentFloorLight()));
  }
  if (path === '/apartment') return loadApartment();
  if (path === '/lobby/360') {
    loadPanorama(project.lobby.pano);
    return loadLobby();
  }
  if (path.startsWith('/amenities/')) {
    const scene = project.amenities.items.find(({ id }) => path === '/amenities/' + id);
    if (scene?.pano) loadPanorama(scene.pano);
    return loadAmenity();
  }
}

/** Every menu in project.menu has a route here. Add a page: create it in /pages, add a <Route>, add it to project.menu. */
export default function App() {
  return (
    <TransitionProvider preload={preloadRoute}>
      <Chrome />
      <Suspense fallback={<div className="page plum-bg" />}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/home" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<ContentsMenu />} />
          <Route path="/legacy" element={<Legacy />} />
          <Route path="/address" element={<Address />} />
          <Route path="/location" element={<Location />} />
          <Route path="/lobby" element={<Navigate to="/lobby/360" replace />} />
          <Route path="/lobby/360" element={<Lobby360 />} />
          <Route path="/story" element={<Story />} />
          <Route path="/residences" element={<Residences />} />
          <Route path="/floor-plans" element={<FloorPlans />} />
          <Route path="/floor-plans/:planId" element={<FloorPlans />} />
          <Route path="/apartment" element={<Apartment />} />
          <Route path="/amenities" element={<Amenities />} />
          <Route path="/amenities/:id" element={<AmenityView />} />
          <Route path="/golden-hour" element={<GoldenHour />} />
          <Route path="/specifications" element={<Specifications />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

    </TransitionProvider>
  );
}
