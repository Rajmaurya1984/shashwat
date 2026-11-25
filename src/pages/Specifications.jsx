import { project } from '../data/project.js';
import Img from '../components/ui/Img.jsx';
import LogoMark from '../components/site/LogoMark.jsx';
import { isTodo } from '../lib/projectContent.js';

export default function Specifications() {
  const d = project.specifications;
  return (
    <div className="page plum-bg">
      <Img src={d.background} alt="" />
      <div className="shade-left" />
      <aside className="spec-card rise">
        <LogoMark size={40} stroke={3} />
        <h1 className="eyebrow" style={{ margin: '12px 0 22px' }}>{d.eyebrow}</h1>
        {d.groups.map((g) => (
          <div className="spec-group" key={g.name}>
            <b>{g.name}</b>
            <ul>{g.items.map((it) => <li key={it} className={isTodo(it) ? 'todo' : ''}>{it}</li>)}</ul>
          </div>
        ))}
      </aside>
    </div>
  );
}
