import { createContext, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { trefoilNavigate } from '../menu/trefoilPortal.js';
import { isPanoramaRoute } from './panoramaRoutes.js';
import '../menu/menu.css';

const TransitionContext = createContext(null);

export function TransitionProvider({ children, preload }) {
  const navigate = useNavigate();
  const go = useCallback((to, origin) => {
    if (isPanoramaRoute(to.split(/[?#]/, 1)[0])) {
      preload?.(to)?.catch(() => {});
      navigate(to);
      return;
    }
    return trefoilNavigate(navigate, to, origin, preload);
  }, [navigate, preload]);
  return <TransitionContext.Provider value={go}>{children}</TransitionContext.Provider>;
}

export function useTransition() {
  return { go: useContext(TransitionContext) };
}