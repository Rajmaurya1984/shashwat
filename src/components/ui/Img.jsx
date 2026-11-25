import { useState } from 'react';

/** <img> that shows a labelled gold placeholder when the file isn't there yet (see ASSETS.md). */
export default function Img({ src, alt = '', className = 'cover', style, ...rest }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="ph" style={style} role="img" aria-label={alt || 'Image coming soon'}>
        <div><b>Image needed</b><code>public{src || ''}</code></div>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} style={style} onError={() => setFailed(true)} {...rest} />;
}
