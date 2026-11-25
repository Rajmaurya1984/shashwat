/**
 * Golden particle transition
 * --------------------------
 * The current picture breaks into gold dust that spirals into one point (the chosen floor),
 * swirls there as a glowing vortex while the next picture loads, then streams back out
 * and settles into the next picture. Plain WebGL1, no dependencies.
 *
 *   const fx = new GoldenParticles(hostElement);
 *   fx.setSource(imgOrCanvas);            // what is on screen now (object-fit: cover)
 *   await fx.gather({ x, y }, 1500);      // dissolve into gold, swirl at x,y (CSS px in host)
 *   fx.setTarget(nextImgOrCanvas);        // when the next picture is ready
 *   await fx.assemble(1400);              // gold dust becomes the next picture
 *   await fx.fadeAway(300);               // reveal the real page underneath, then dispose
 */

const VERT = `
attribute vec2 aGrid; attribute vec4 aRand;
uniform vec2 uFocus, uRes; uniform float uOut, uIn, uTime, uCell, uDpr, uScale;
uniform sampler2D uTexA, uTexB;
varying vec3 vColor; varying float vMid;
const float PI = 3.14159265;
const vec3 GOLD = vec3(0.93, 0.79, 0.53);
float io(float t){ return t < .5 ? 4.*t*t*t : 1. - pow(-2.*t + 2., 3.) / 2.; }
vec2 rot(vec2 v, float a){ float c = cos(a), s = sin(a); return vec2(c*v.x - s*v.y, s*v.x + c*v.y); }
void main(){
  vec2 uv = aGrid / uRes;                // textures are uploaded top row first (no flip)
  float dist = length(aGrid - uFocus) / length(uRes);
  float wave = (dist * 0.8 + aRand.x * 0.2) * 0.62;    // crumbling spreads out from the floor
  // the vortex: particles orbit the focus on a tilted disc, outer ones slower
  float r = (6. + aRand.z * aRand.z * 110.) * uScale;
  float ang = aRand.w * 6.2832 + uTime * (0.9 + (1. - aRand.z) * 2.6);
  vec2 vortex = uFocus + vec2(cos(ang), sin(ang) * 0.38) * r + vec2(0., sin(uTime * 1.7 + aRand.x * 9.) * 4. * uScale);
  vec2 jitter = vec2(sin(uTime * 3.1 + aRand.x * 40.), cos(uTime * 2.6 + aRand.y * 40.)) * 7. * uScale;
  vec3 gold = GOLD * (0.7 + 0.6 * aRand.y);
  vec2 pos; float m; vec3 col;
  if (uIn <= 0.) {                       // picture -> vortex (nearest to the floor leave first)
    float t = clamp((uOut - wave) / 0.55, 0., 1.), e = io(t);
    vec2 rel = mix(aGrid, vortex, e) - uFocus;
    rel = rot(rel, sin(t * PI) * (1.3 + aRand.z * 1.6));
    // blocks first lift off and float up a little, then get pulled into the swirl
    pos = uFocus + rel + jitter * sin(t * PI) - vec2(0., sin(min(t * 1.6, 1.) * PI * .5) * (1. - e) * 60. * aRand.y * uScale);
    m = t;
    col = mix(texture2D(uTexA, uv).rgb, gold, smoothstep(.12, .6, t));
  } else {                               // vortex -> next picture (nearest to the floor land first)
    float t = clamp((uIn - (dist * 0.8 + aRand.y * 0.2) * 0.62) / 0.55, 0., 1.), e = io(t);
    vec2 rel = mix(vortex, aGrid, e) - uFocus;
    rel = rot(rel, -sin(t * PI) * (1.3 + aRand.z * 1.6));
    pos = uFocus + rel + jitter * sin(t * PI) + vec2(0., sin(t * PI) * 28. * aRand.x * uScale);
    m = 1. - t;
    col = mix(gold, texture2D(uTexB, uv).rgb, smoothstep(.45, 1., t));
  }
  float twinkle = 0.75 + 0.5 * sin(uTime * (4. + aRand.w * 6.) + aRand.x * 30.);
  col *= mix(1., twinkle * 1.25, smoothstep(.5, 1., m));
  vMid = m; vColor = col;
  float size = mix(uCell * 1.15, (2. + aRand.z * aRand.z * 5.) * uScale + 1., smoothstep(.08, .45, m));
  gl_PointSize = size * uDpr;
  gl_Position = vec4(pos.x / uRes.x * 2. - 1., 1. - pos.y / uRes.y * 2., 0., 1.);
}`;

const FRAG = `
precision mediump float;
varying vec3 vColor; varying float vMid;
void main(){
  float d = length(gl_PointCoord - .5);
  float soft = smoothstep(.5, 0., d);
  float k = smoothstep(.06, .35, vMid);            // square tiles at rest, glowing dots in flight
  float core = smoothstep(.22, 0., d);
  float a = mix(1., soft * .85 + core * .15, k);
  if (a < .01) discard;
  gl_FragColor = vec4(vColor * (1. + k * (.6 * soft + .9 * core)), a);
}`;

export class GoldenParticles {
  constructor(host, { zIndex = 30, background = 'radial-gradient(ellipse at 50% 55%,#3a1519 0%,#22090d 58%,#120406 100%)' } = {}) {
    this.host = host;
    const w = this.w = host.clientWidth || innerWidth, h = this.h = host.clientHeight || innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.wrap = document.createElement('div');
    this.wrap.style.cssText = `position:absolute;inset:0;z-index:${zIndex};pointer-events:none;` +
      'background:' + background;
    const c = this.canvas = document.createElement('canvas');
    c.width = Math.round(w * this.dpr); c.height = Math.round(h * this.dpr);
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    const R = Math.min(w, h) * 0.42;
    this.halo = document.createElement('div');           // warm light behind the vortex
    this.halo.style.cssText = `position:absolute;left:0;top:0;width:${R * 2}px;height:${R * 2}px;margin:${-R}px 0 0 ${-R}px;` +
      'border-radius:50%;opacity:0;will-change:transform,opacity;pointer-events:none;' +
      'background:radial-gradient(circle,rgba(240,206,140,.55) 0%,rgba(214,170,100,.22) 28%,rgba(180,140,80,0) 62%)';
    this.wrap.append(this.halo, c); host.append(this.wrap);
    const gl = this.gl = c.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) throw new Error('WebGL unavailable');
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const p = this.prog = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    gl.useProgram(p);
    // one particle per cell of the screen
    const cell = this.cell = Math.max(4, Math.round(Math.sqrt((w * h) / 26000)));
    const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell), n = this.count = cols * rows;
    const grid = new Float32Array(n * 2), rand = new Float32Array(n * 4);
    for (let y = 0, i = 0; y < rows; y++) for (let x = 0; x < cols; x++, i++) {
      grid[i * 2] = (x + 0.5) * cell; grid[i * 2 + 1] = (y + 0.5) * cell;
      for (let k = 0; k < 4; k++) rand[i * 4 + k] = Math.random();
    }
    const attr = (name, data, size) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(p, name); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); };
    attr('aGrid', grid, 2); attr('aRand', rand, 4);
    this.u = {};
    ['uFocus', 'uRes', 'uOut', 'uIn', 'uTime', 'uCell', 'uDpr', 'uScale', 'uTexA', 'uTexB'].forEach(k => (this.u[k] = gl.getUniformLocation(p, k)));
    gl.uniform2f(this.u.uRes, w, h); gl.uniform1f(this.u.uCell, cell); gl.uniform1f(this.u.uDpr, this.dpr);
    gl.uniform1f(this.u.uScale, Math.min(w, h) / 800);
    gl.uniform1i(this.u.uTexA, 0); gl.uniform1i(this.u.uTexB, 1);
    this.texA = this._tex(0); this.texB = this._tex(1);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, c.width, c.height);
    this.focus = { x: w / 2, y: h / 2 }; this.out = 0; this.in = 0; this.t0 = performance.now();
    this._raf = requestAnimationFrame(this._frame = this._frame.bind(this));
  }
  /** copy an <img> / <canvas> into a host-sized canvas the same way object-fit: cover shows it */
  cover(source) {
    const c = document.createElement('canvas'); c.width = this.w; c.height = this.h;
    const sw = source.naturalWidth || source.width, sh = source.naturalHeight || source.height;
    const s = Math.max(this.w / sw, this.h / sh), dw = sw * s, dh = sh * s;
    c.getContext('2d').drawImage(source, (this.w - dw) / 2, (this.h - dh) / 2, dw, dh);
    return c;
  }
  setSource(src) { this._upload(0, this.texA, this.cover(src)); this.out = 0; this.in = 0; }
  setTarget(src) { this._upload(1, this.texB, this.cover(src)); }
  gather(focus, ms) { if (focus) this.focus = focus; return this._tween(v => (this.out = v), ms); }
  assemble(ms) { this.out = 1; return this._tween(v => (this.in = v), ms); }
  fadeAway(ms = 300) {
    return new Promise(res => {
      this.wrap.style.transition = `opacity ${ms}ms ease`; this.wrap.style.opacity = '0';
      setTimeout(() => { this.dispose(); res(); }, ms + 30);
    });
  }
  dispose() {
    if (this.disposed) return; this.disposed = true;
    cancelAnimationFrame(this._raf); this.gl.getExtension('WEBGL_lose_context')?.loseContext(); this.wrap.remove();
  }
  _tex(unit) {
    const gl = this.gl, t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return t;
  }
  _upload(unit, tex, canvas) {
    const gl = this.gl; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  }
  _tween(set, ms) {
    return new Promise(res => {
      if (!(ms > 0)) { set(1); res(); return; }
      const t0 = performance.now();
      const step = (now) => { if (this.disposed) return res(); const k = Math.min(1, (now - t0) / ms); set(k); k < 1 ? requestAnimationFrame(step) : res(); };
      requestAnimationFrame(step);
    });
  }
  _frame(now) {
    if (this.disposed) return;
    const gl = this.gl, u = this.u;
    gl.uniform2f(u.uFocus, this.focus.x, this.focus.y);
    const s = (x) => x * x * (3 - 2 * x), glow = s(Math.min(1, this.out * 1.4)) * (1 - s(Math.min(1, this.in * 1.3)));
    const pulse = 1 + 0.06 * Math.sin(now / 260);
    this.halo.style.opacity = glow.toFixed(3);
    this.halo.style.transform = `translate(${this.focus.x}px,${this.focus.y}px) scale(${(0.6 + 0.4 * glow) * pulse})`;
    gl.uniform1f(u.uOut, this.out); gl.uniform1f(u.uIn, this.in); gl.uniform1f(u.uTime, (now - this.t0) / 1000);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, this.count);
    this._raf = requestAnimationFrame(this._frame);
  }
}
