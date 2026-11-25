import { useState } from 'react';
import { project } from '../data/project.js';
import Img from '../components/ui/Img.jsx';
import { isTodo } from '../lib/projectContent.js';

export default function Contact() {
  const d = project.contact;
  const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT;
  const [sent, setSent] = useState(null);
  async function submit(e) {
    e.preventDefault();
    if (!endpoint) return;
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try { const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); setSent(r.ok ? 'ok' : 'err'); }
    catch { setSent('err'); }
  }
  return (
    <div className="page copper-bg">
      <Img src={d.background} alt="" style={{ opacity: .25 }} />
      <div className="grain" />
      <div className="contact">
        <div className="contact-l">
          <div className="script contact-s rise">{d.script}</div>
          <p className="body rise d1">{d.text}</p>
          <div className="contact-ph rise d2">{d.phone}</div>
          <dl className="contact-dl rise d3">
            {d.offices.map((o) => <div key={o.label}><dt>{o.label}</dt><dd className={isTodo(o.text) ? 'todo' : ''}>{o.text}</dd></div>)}
          </dl>
        </div>
        <form className="contact-f rise d2" onSubmit={submit}>
          <h2 className="eyebrow">Book a site visit</h2>
          <input name="name" placeholder="Your name" required autoComplete="name" />
          <input name="phone" placeholder="Phone" required inputMode="tel" autoComplete="tel" />
          <input name="email" placeholder="Email" type="email" autoComplete="email" />
          <select name="config" defaultValue=""><option value="" disabled>Interested in</option><option>2 BHK</option><option>3 BHK</option></select>
          <button className="cta" type="submit" disabled={!endpoint}>{endpoint ? 'Send' : 'Set VITE_ENQUIRY_ENDPOINT to enable'}</button>
          {sent === 'ok' && <p className="form-msg">Thank you. We’ll call you shortly.</p>}
          {sent === 'err' && <p className="form-msg">That didn’t go through. Please call us instead.</p>}
        </form>
      </div>
      <footer className="contact-foot">
        <div className="consult">{d.consultants.map((c) => <div key={c.role}><b>{c.role}</b><span className={isTodo(c.name) ? 'todo' : ''}>{c.name}</span></div>)}</div>
        <p>{project.legal.disclaimer}</p>
      </footer>
    </div>
  );
}
