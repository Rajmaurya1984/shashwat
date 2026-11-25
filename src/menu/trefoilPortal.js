import { flushSync } from 'react-dom';

let busy = false;

export async function trefoilNavigate(navigate, to, origin, preload) {
  if (busy) return;
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    navigate(to);
    return;
  }

  busy = true;
  const rings = document.createElement('div');
  rings.className = 'tp-rings';
  rings.setAttribute('aria-hidden', 'true');

  try {
    await preload?.(to)?.catch(() => {});
    const { x, y } = origin ?? { x: innerWidth / 2, y: innerHeight / 2 };
    const far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement.style;
    root.setProperty('--tp-x', x + 'px');
    root.setProperty('--tp-y', y + 'px');
    root.setProperty('--tp-rmax', far / .45 + 'px');

    const transition = document.startViewTransition(() => {
      flushSync(() => navigate(to));
      document.body.append(rings);
    });
    await transition.finished.catch(() => {});
  } finally {
    rings.remove();
    busy = false;
  }
}
export function centreOf(element) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}