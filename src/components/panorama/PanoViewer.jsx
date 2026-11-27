import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { loadPanorama, preloadPanorama } from '../../lib/panoramaImages.js';
import './pano.css';

/**
 * 360° viewer for 2:1 equirectangular panoramas. Drag to look, wheel/pinch to zoom, hotspots to jump rooms.
 * props: src (pano url), mobileSrc (optional smaller pano), startYaw (deg), hotspots [{ yaw, pitch, label, onClick }],
 *        fallback (flat image url, used if the pano is missing), autoRotate (deg/sec)
 */
const NO_PRELOAD = [];
const easeSine = (progress) => .5 - Math.cos(Math.PI * THREE.MathUtils.clamp(progress, 0, 1)) / 2;

export default function PanoViewer({ src, mobileSrc, startYaw = 0, startFov = 75, hotspots = [], fallback, autoRotate = 2, onReady, onError, onPlace, onView, preload = NO_PRELOAD, sceneMotion = false }) {
  const host = useRef(null);
  const [missing, setMissing] = useState(false);
  const viewer = useRef(null);
  const ready = useRef(onReady); ready.current = onReady;
  const failed = useRef(onError); failed.current = onError;
  const options = useRef({ startYaw, startFov, autoRotate, sceneMotion }); options.current = { startYaw, startFov, autoRotate, sceneMotion };
  const spots = useRef(hotspots); spots.current = hotspots;
  const place = useRef(onPlace); place.current = onPlace;
  const view = useRef(onView); view.current = onView;

  useEffect(() => {
    const el = host.current; if (!el) return;
    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.append(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(options.current.startFov, 1, 0.1, 100);
    const geo = new THREE.SphereGeometry(10, 64, 40); geo.scale(-1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0x2a0d12 });
    scene.add(new THREE.Mesh(geo, mat));
    const fadeMaterial = new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, depthWrite: false });
    const outgoingZoom = { value: 1 };
    fadeMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.outgoingZoom = outgoingZoom;
      shader.vertexShader = 'uniform float outgoingZoom;\n' + shader.vertexShader.replace(
        '#include <project_vertex>',
        '#include <project_vertex>\n gl_Position.xy *= outgoingZoom;'
      );
    };
    const fadeMesh = new THREE.Mesh(geo, fadeMaterial);
    fadeMesh.visible = false;
    scene.add(fadeMesh);
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const preloaded = new Set();
    let request = 0, transition = null, doorway = false;

    function textureFor(image) {
      const texture = new THREE.Texture(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      return texture;
    }

    function finishFade() {
      fadeMesh.visible = false;
      transition = null;
      outgoingZoom.value = 1;
      fadeMaterial.map?.dispose();
      fadeMaterial.map = null;
    }

    viewer.current = async (url, mobileUrl, initialYaw, alternatives) => {
      const pending = ++request;
      const { sceneMotion: animateScene } = options.current;
      const travel = animateScene && doorway && !reducedMotion.matches;
      doorway = false;
      const duration = reducedMotion.matches ? (animateScene ? 180 : 0) : (animateScene ? 350 : 280);
      const preferred = innerWidth < 820 && mobileUrl ? mobileUrl : url;
      let image = await loadPanorama(preferred);
      if (pending !== request) return;
      if (!image && preferred !== url) image = await loadPanorama(url);
      if (pending !== request) return;
      setMissing(!image);
      if (!image) {
        failed.current?.();
        return;
      }

      const texture = mat.map?.image === image ? mat.map : textureFor(image);
      finishFade();
      if (!mat.map && duration) {
        renderer.domElement.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: 'ease-out' });
      }
      if (mat.map && mat.map !== texture && duration) {
        fadeMaterial.map = mat.map;
        fadeMaterial.opacity = 1;
        fadeMaterial.needsUpdate = true;
        fadeMesh.visible = true;
        transition = { start: performance.now(), duration, travel, fov: camera.fov };
      } else {
        if (mat.map !== texture) mat.map?.dispose();
      }
      mat.map = texture;
      mat.color.set(0xffffff);
      mat.needsUpdate = true;
      if (initialYaw !== activeYaw) {
        activeYaw = initialYaw;
        yaw = THREE.MathUtils.degToRad(initialYaw);
        pitch = vy = vp = 0;
      }
      ready.current?.();
      for (const alternative of alternatives) {
        if (alternative === preferred || preloaded.has(alternative)) continue;
        preloaded.add(alternative);
        preloadPanorama(alternative);
      }
    };

    let activeYaw = options.current.startYaw;
    let yaw = THREE.MathUtils.degToRad(activeYaw), pitch = 0, fov = camera.fov, vy = 0, vp = 0, drag = null, idleAt = performance.now() + 2500;
    const dom = renderer.domElement; dom.style.cursor = 'grab'; dom.style.touchAction = 'none';
    const touches = new Map();
    let touchStart;
    const pinchDistance = () => {
      const [first, second] = touches.values();
      return Math.max(1, Math.hypot(first.x - second.x, first.y - second.y));
    };
    const zoom = (value) => { fov = THREE.MathUtils.clamp(value, 35, 95); };
    const down = (e) => {
      const point = { x: e.clientX, y: e.clientY };
      if (e.pointerType === 'touch') touches.set(e.pointerId, point);
      dom.setPointerCapture(e.pointerId);
      dom.style.cursor = 'grabbing';
      if (touches.size > 1) {
        touchStart = undefined;
        drag = null;
        vy = vp = 0;
        return;
      }
      drag = point;
    };
    const move = (e) => {
      const point = { x: e.clientX, y: e.clientY };
      if (touches.size > 1 && touches.has(e.pointerId)) {
        const previous = pinchDistance();
        touches.set(e.pointerId, point);
        zoom(THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov) / 2) * previous / pinchDistance())));
        idleAt = performance.now() + 3000;
        return;
      }
      if (!drag) return;
      if (touches.has(e.pointerId)) touches.set(e.pointerId, point);
      const k = THREE.MathUtils.degToRad(fov) / el.clientHeight;
      vy = (point.x - drag.x) * k;
      vp = (point.y - drag.y) * k;
      yaw += vy;
      pitch += vp;
      drag = point;
      idleAt = performance.now() + 3000;
    };
    const up = (e) => {
      if (e.type === 'pointercancel') touchStart = undefined;
      touches.delete(e.pointerId);
      drag = touches.size === 1 ? touches.values().next().value : null;
      if (!touches.size) dom.style.cursor = 'grab';
    };
    const wheel = (e) => { e.preventDefault(); zoom(fov + e.deltaY * 0.04); };
    dom.addEventListener('pointerdown', down); dom.addEventListener('pointermove', move); dom.addEventListener('pointerup', up); dom.addEventListener('pointercancel', up); dom.addEventListener('wheel', wheel, { passive: false });

    const pickPoint = new THREE.Vector3();
    const placePointer = (event) => {
      if (!place.current || !mat.map) return;
      const rect = dom.getBoundingClientRect();
      pickPoint.set(2 * (event.clientX - rect.left) / rect.width - 1,
        1 - 2 * (event.clientY - rect.top) / rect.height, .5).unproject(camera).normalize();
      place.current({
        yaw: THREE.MathUtils.radToDeg(Math.atan2(-pickPoint.x, -pickPoint.z)),
        pitch: THREE.MathUtils.radToDeg(Math.asin(pickPoint.y)),
      });
    };
    const trackTouch = (event) => {
      if (event.pointerType === 'touch' && event.isPrimary) touchStart = [event.clientX, event.clientY];
    };
    const placeTouch = (event) => {
      if (!touchStart || event.pointerType !== 'touch' || !event.isPrimary) return;
      const [x, y] = touchStart;
      touchStart = undefined;
      if (Math.hypot(event.clientX - x, event.clientY - y) < 8) placePointer(event);
    };
    dom.addEventListener('pointerdown', trackTouch);
    dom.addEventListener('pointerup', placeTouch);
    dom.addEventListener('dblclick', (event) => {
      if (!event.sourceCapabilities?.firesTouchEvents) placePointer(event);
    });

    const labels = document.createElement('div'); labels.className = 'pano-spots'; el.append(labels);
    const v = new THREE.Vector3();
    const forward = new THREE.Vector3();
    let renderedSpots;
    let raf, last = performance.now();
    const frame = (now) => {
      const dt = Math.min(.1, (now - last) / 1000); last = now;
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) {
        raf = requestAnimationFrame(frame);
        return;
      }
      if (renderer.domElement.width !== Math.floor(w * renderer.getPixelRatio()) || renderer.domElement.height !== Math.floor(h * renderer.getPixelRatio())) { renderer.setSize(w, h, false); }
      camera.aspect = w / h;
      if (!drag && !touches.size) { yaw += vy; pitch += vp; vy *= .92; vp *= .92; if (now > idleAt) yaw -= THREE.MathUtils.degToRad(options.current.autoRotate) * dt; }
      pitch = THREE.MathUtils.clamp(pitch, -1.4, 1.4);
      camera.fov += (fov - camera.fov) * .12; camera.updateProjectionMatrix();
      camera.rotation.set(pitch, yaw, 0, 'YXZ');
      camera.getWorldDirection(forward);
      if (mat.map && view.current) {
        const horizontalFov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.getEffectiveFOV()) / 2) * camera.aspect);
        view.current(THREE.MathUtils.radToDeg(Math.atan2(forward.x, -forward.z)), THREE.MathUtils.radToDeg(horizontalFov));
      }
      if (transition) {
        const elapsed = now - transition.start;
        if (transition.travel) {
          const lens = transition.fov * (1 - .2 * easeSine((elapsed - 150) / 900));
          outgoingZoom.value = Math.tan(THREE.MathUtils.degToRad(transition.fov) / 2) / Math.tan(THREE.MathUtils.degToRad(lens) / 2);
          fadeMaterial.opacity = 1 - easeSine((elapsed - 950) / 850);
        } else {
          fadeMaterial.opacity = 1 - easeSine(elapsed / transition.duration);
        }
        if (fadeMaterial.opacity <= 0) finishFade();
      }
      renderer.render(scene, camera);
      // hotspots are HTML buttons placed on the sphere
      if (renderedSpots !== spots.current) {
        renderedSpots = spots.current;
        labels.replaceChildren(...renderedSpots.map((spot) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'pano-spot';
          button.setAttribute('aria-label', 'Go to ' + spot.label);
          button.style.visibility = 'hidden';
          const ring = document.createElement('i');
          ring.setAttribute('aria-hidden', 'true');
          const caption = document.createElement('span');
          caption.textContent = spot.label;
          button.append(ring, caption);
          button.onclick = spot.onClick && ((event) => {
            doorway = true;
            spot.onClick(event);
          });
          button.disabled = !spot.onClick;
          return button;
        }));
      }
      renderedSpots.forEach((spot, i) => {
        const azimuth = THREE.MathUtils.degToRad(spot.yaw);
        const elevation = THREE.MathUtils.degToRad(spot.pitch ?? -8);
        v.set(-Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), -Math.cos(azimuth) * Math.cos(elevation));
        const inFront = v.dot(forward) > 0;
        v.project(camera);
        const button = labels.children[i];
        const visible = mat.map && (!options.current.sceneMotion || !transition) && inFront && Math.abs(v.x) < 1 && Math.abs(v.y) < 1;
        button.style.visibility = visible ? 'visible' : 'hidden';
        button.style.pointerEvents = visible && !button.disabled ? 'auto' : 'none';
        if (visible) button.style.transform = `translate(${(v.x + 1) / 2 * w}px,${(1 - v.y) / 2 * h}px)`;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      ++request;
      viewer.current = null;
      cancelAnimationFrame(raf);
      finishFade();
      mat.map?.dispose();
      fadeMaterial.dispose();
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      dom.remove();
      labels.remove();
    };
  }, []);

  useEffect(() => {
    viewer.current?.(src, mobileSrc, startYaw, preload);
  }, [src, mobileSrc, startYaw, preload]);

  return <div className="pano">
    <div className="pano-stage" ref={host} hidden={missing} />
    {missing && (fallback
      ? <><img className="cover pano-fallback" src={fallback} alt="" /><div className="pano-note">360° view coming soon</div></>
      : <div className="ph"><div><b>360° panorama needed</b><code>public{src}</code></div></div>)}
  </div>;
}
