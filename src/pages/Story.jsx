import { useTransition } from '../lib/transition.jsx';
import { centreOf } from '../menu/trefoilPortal.js';
import { project } from '../data/project.js';
import Img from '../components/ui/Img.jsx';
import Html from '../components/ui/Html.jsx';

export default function Story() {
  const { go } = useTransition();
  const d = project.story;
  return (
    <div className="page plum-bg">
      <div className="split">
        <div className="media"><Img src={d.hero} alt="A sunlit living room above Mira Road" /></div>
        <div className="copy">
          <div className="eyebrow rise">{d.eyebrow}</div>
          <Html as="h1" className="title rise d1" html={d.title} />
          <p className="body rise d2">{d.text}</p>
          <div className="quote rise d3"><div className="script">{d.quote}</div><p>{d.quoteText}</p></div>
          <div className="tour-related rise d4">
            <button className="cta" onClick={event => go('/legacy', centreOf(event.currentTarget))}>Raj Realty legacy</button>
          </div>
        </div>
      </div>
    </div>
  );
}
