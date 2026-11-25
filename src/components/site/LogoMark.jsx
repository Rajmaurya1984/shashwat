import { project } from '../../data/project.js';

export default function LogoMark({ size = 34, className = '' }) {
  return (
    <img className={'logo-mark ' + className} src={project.brand.logoMark}
      width={size} height={size} style={{ objectFit: 'contain' }} alt="" />
  );
}
