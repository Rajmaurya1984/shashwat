import { project } from '../data/project.js';
import Img from '../components/ui/Img.jsx';
import Html from '../components/ui/Html.jsx';
import { isTodo } from '../lib/projectContent.js';

export default function Address() {
  const d = project.address;
  return (
    <div className="page plum-bg">
      <div className="split split-narrow">
        <div className="media"><Img src={d.hero} alt="The two towers of Shree Shashwat 3.0" style={{ objectPosition: '50% 30%' }} /></div>
        <div className="copy">
          <div className="eyebrow rise">{d.eyebrow}</div>
          <Html as="h1" className="title rise d1" html={d.title} />
          <p className="body rise d2">{d.text}</p>
          <div className="facts rise d3">
            {d.facts.map((f) => <div className="fact" key={f.label}><b className={isTodo(f.value) ? 'todo' : ''}>{f.value}<small>{f.unit}</small></b><span>{f.label}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
