import { useState } from 'react';
import { project } from '../data/project.js';
import Img from '../components/ui/Img.jsx';
import Html from '../components/ui/Html.jsx';

export default function GoldenHour() {
  const d = project.golden;
  const [i, setI] = useState(Math.max(0, d.views.findIndex((v) => v.id === 'evening')));
  return (
    <div className="page plum-bg">
      {d.views.map((v, k) => (
        <div key={v.id} className="xfade" style={{ opacity: k === i ? 1 : 0 }}><Img src={v.img} alt={v.label + ' view'} style={{ objectPosition: `50% ${(v.focusY ?? .5) * 100}%` }} /></div>
      ))}
      <div className="shade-left" />
      <div className="mid">
        <div className="eyebrow rise">{d.eyebrow}</div>
        <Html as="h1" className="title rise d1" html={d.title} />
        <p className="body rise d2">{d.text}</p>
        <div className="seg rise d3" role="group" aria-label="Time of day">
          {d.views.map((v, k) => <button key={v.id} className={k === i ? 'on' : ''} onClick={() => setI(k)}>{v.label}</button>)}
        </div>
      </div>
    </div>
  );
}
