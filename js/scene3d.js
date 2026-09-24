/* CANDLE ICE — painted 3D scenes.
 * Each location is modelled in Three.js (r128) from simple solids, lit with
 * lanterns and fog, then passed through an oil-paint filter (a Kuwahara
 * filter with brush wobble, stroke texture and colour grading) so it reads
 * like one of Rostov's sketches while staying recognisable.
 */
(function () {
  'use strict';
  var C = (window.CANDLE = window.CANDLE || {});
  var T = window.THREE;
  var api = { ok: false, scenes: [] };
  C.scene3d = api;

  // ---------------------------------------------------------------- post shader
  var POST_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  // Pass: a four-sector Kuwahara filter melts detail into brush-sized patches;
  // the image gradient then orients bristle streaks along forms, dark ink
  // gathers on strong edges like an underdrawing, and the colour is graded
  // warm-in-the-lights, cool-in-the-shadows over a canvas weave.
  var POST_FS = [
    'precision highp float;',
    'uniform sampler2D tDiffuse; uniform vec2 res; uniform float time; uniform float strength;',
    'varying vec2 vUv;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);',
    '  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y); }',
    'float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }',
    'void main(){',
    '  vec2 px = 1.0 / res;',
    '  vec2 q = vUv * res;',
    '  vec2 wob = vec2(noise(q / 23.0), noise(q / 23.0 + 31.7)) - 0.5;',
    '  vec2 uv = vUv + wob * px * 5.0 * strength;',
    // gradient of the source (Sobel), for stroke direction and ink
    '  float tl = lum(texture2D(tDiffuse, uv + px * vec2(-1.5, -1.5)).rgb);',
    '  float tc = lum(texture2D(tDiffuse, uv + px * vec2( 0.0, -1.5)).rgb);',
    '  float tr = lum(texture2D(tDiffuse, uv + px * vec2( 1.5, -1.5)).rgb);',
    '  float ml = lum(texture2D(tDiffuse, uv + px * vec2(-1.5,  0.0)).rgb);',
    '  float mr = lum(texture2D(tDiffuse, uv + px * vec2( 1.5,  0.0)).rgb);',
    '  float bl = lum(texture2D(tDiffuse, uv + px * vec2(-1.5,  1.5)).rgb);',
    '  float bc = lum(texture2D(tDiffuse, uv + px * vec2( 0.0,  1.5)).rgb);',
    '  float br = lum(texture2D(tDiffuse, uv + px * vec2( 1.5,  1.5)).rgb);',
    '  float gx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);',
    '  float gy = (bl + 2.0 * bc + br) - (tl + 2.0 * tc + tr);',
    '  float edge = sqrt(gx * gx + gy * gy);',
    // Kuwahara
    '  vec3 m0 = vec3(0.0); vec3 m1 = vec3(0.0); vec3 m2 = vec3(0.0); vec3 m3 = vec3(0.0);',
    '  vec3 s0 = vec3(0.0); vec3 s1 = vec3(0.0); vec3 s2 = vec3(0.0); vec3 s3 = vec3(0.0);',
    '  float sp = 1.0 * strength + 0.35;',
    '  for (int j = 0; j <= 4; j++) { for (int i = 0; i <= 4; i++) {',
    '    vec2 o = vec2(float(i), float(j)) * px * sp;',
    '    vec3 c;',
    '    c = texture2D(tDiffuse, uv + vec2(-o.x, -o.y)).rgb; m0 += c; s0 += c * c;',
    '    c = texture2D(tDiffuse, uv + vec2( o.x, -o.y)).rgb; m1 += c; s1 += c * c;',
    '    c = texture2D(tDiffuse, uv + vec2( o.x,  o.y)).rgb; m2 += c; s2 += c * c;',
    '    c = texture2D(tDiffuse, uv + vec2(-o.x,  o.y)).rgb; m3 += c; s3 += c * c;',
    '  } }',
    '  m0 /= 25.0; m1 /= 25.0; m2 /= 25.0; m3 /= 25.0;',
    '  float v0 = dot(s0 / 25.0 - m0 * m0, vec3(1.0));',
    '  float v1 = dot(s1 / 25.0 - m1 * m1, vec3(1.0));',
    '  float v2 = dot(s2 / 25.0 - m2 * m2, vec3(1.0));',
    '  float v3 = dot(s3 / 25.0 - m3 * m3, vec3(1.0));',
    '  vec3 col = m0; float mv = v0;',
    '  if (v1 < mv) { mv = v1; col = m1; }',
    '  if (v2 < mv) { mv = v2; col = m2; }',
    '  if (v3 < mv) { mv = v3; col = m3; }',
    // keep a little of the crisp source where the patch is flat, for detail
    '  vec3 src = texture2D(tDiffuse, uv).rgb;',
    '  col = mix(col, src, 0.18 * (1.0 - smoothstep(0.0, 0.02, mv)));',
    // bristle streaks: along the edge where there is one, along a slow field elsewhere
    '  float fa = noise(vUv * 3.0 + 7.3) * 6.2831;',
    '  vec2 fd = vec2(cos(fa), sin(fa));',
    '  vec2 gd = edge > 0.04 ? normalize(vec2(-gy, gx)) : fd;',
    '  vec2 dir = normalize(mix(fd, gd, smoothstep(0.02, 0.2, edge)));',
    '  vec2 nrm = vec2(-dir.y, dir.x);',
    '  float along = dot(q, dir), across = dot(q, nrm);',
    '  float bristle = noise(vec2(along * 0.045, across * 0.9)) * 0.6 + noise(vec2(along * 0.02, across * 0.35)) * 0.4;',
    '  float dab = noise(q * 0.07 + 11.0);',
    '  col *= 0.88 + 0.24 * bristle * strength + 0.12 * (1.0 - strength);',
    '  col += (dab - 0.5) * 0.035 * strength;',
    // ink on strong edges, broken like a dry brush
    '  float ink = smoothstep(0.18, 0.55, edge) * (0.55 + 0.45 * noise(vec2(along * 0.08, across * 0.5)));',
    '  col = mix(col, col * vec3(0.3, 0.26, 0.32), ink * 0.5 * strength);',
    // canvas weave and paper tooth
    '  float weave = abs(sin(q.x * 1.6)) * abs(sin(q.y * 1.6));',
    '  col *= 0.97 + 0.05 * weave + 0.04 * (noise(q * 0.9) - 0.5);',
    // grade: saturation, cool shadows, warm lights, lifted blacks
    '  float l = lum(col);',
    '  col = mix(vec3(l), col, 1.22);',
    '  col = mix(col, col * vec3(0.78, 0.88, 1.22), (1.0 - smoothstep(0.0, 0.5, l)) * 0.5);',
    '  col = mix(col, col * vec3(1.08, 1.0, 0.86), smoothstep(0.5, 1.0, l) * 0.35);',
    '  col = col * 1.1 + vec3(0.014, 0.011, 0.026);',
    '  vec2 cc = vUv - 0.5; col *= 1.0 - dot(cc, cc) * 1.1;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  // ---------------------------------------------------------------- state
  var renderer, rt, post, postScene, postCam, canvas;
  var cur = null, raf = 0, last = 0, lastRender = 0, W = 2, H = 2;
  var scale = 1, slowCount = 0, staticMode = false, pending = null, showTimer = 0;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var R = Math.random;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rr(a, b) { return a + R() * (b - a); }
  function pick(a) { return a[(R() * a.length) | 0]; }

  // ---------------------------------------------------------------- textures
  var texCache = {};
  function canvasTex(key, w, h, draw, repeat) {
    if (texCache[key]) return texCache[key];
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new T.CanvasTexture(c);
    if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; }
    t.userData = { cached: true };
    texCache[key] = t;
    return t;
  }
  function glowTex() {
    return canvasTex('glow', 64, 64, function (g) {
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.2, 'rgba(255,255,255,0.6)');
      gr.addColorStop(0.5, 'rgba(255,255,255,0.18)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    });
  }
  function puffTex() {
    return canvasTex('puff', 64, 64, function (g) {
      for (var i = 0; i < 14; i++) {
        var x = 20 + Math.random() * 24, y = 20 + Math.random() * 24, r = 8 + Math.random() * 14;
        var gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, 'rgba(255,255,255,0.35)');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      }
    });
  }
  function speckTex(key, base, spread, n, size) {
    return canvasTex(key, 256, 256, function (g, w, h) {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      for (var i = 0; i < n; i++) {
        var v = (Math.random() - 0.5) * spread;
        g.fillStyle = 'rgba(' + (v > 0 ? '255,255,255,' : '0,0,0,') + Math.abs(v) + ')';
        var s = 1 + Math.random() * size;
        g.fillRect(Math.random() * w, Math.random() * h, s * (1 + Math.random() * 3), s);
      }
    }, true);
  }
  function planksTex(key, base, vertical) {
    return canvasTex(key, 256, 256, function (g, w, h) {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      var n = 8;
      for (var i = 0; i < n; i++) {
        var p = (i / n) * (vertical ? w : h);
        g.fillStyle = 'rgba(0,0,0,' + (0.05 + Math.random() * 0.12) + ')';
        if (vertical) g.fillRect(p, 0, w / n, h); else g.fillRect(0, p, w, h / n);
        g.fillStyle = 'rgba(0,0,0,0.45)';
        if (vertical) g.fillRect(p, 0, 2, h); else g.fillRect(0, p, w, 2);
      }
      for (var k = 0; k < 400; k++) {
        g.fillStyle = 'rgba(0,0,0,' + Math.random() * 0.12 + ')';
        if (vertical) g.fillRect(Math.random() * w, Math.random() * h, 1, 10 + Math.random() * 30);
        else g.fillRect(Math.random() * w, Math.random() * h, 10 + Math.random() * 30, 1);
      }
    }, true);
  }
  function brickTex() {
    return canvasTex('brick', 256, 256, function (g, w, h) {
      g.fillStyle = '#3a1f1a'; g.fillRect(0, 0, w, h);
      var bh = 16, bw = 40;
      for (var y = 0; y < h; y += bh) {
        var off = ((y / bh) % 2) * bw / 2;
        for (var x = -bw; x < w + bw; x += bw) {
          var r = 90 + Math.random() * 40, gg = 40 + Math.random() * 20, b = 32 + Math.random() * 16;
          g.fillStyle = 'rgb(' + (r | 0) + ',' + (gg | 0) + ',' + (b | 0) + ')';
          g.fillRect(x + off + 1, y + 1, bw - 2, bh - 2);
        }
      }
    }, true);
  }
  function logTex() {
    return canvasTex('logs', 256, 256, function (g, w, h) {
      for (var y = 0; y < h; y += 32) {
        var gr = g.createLinearGradient(0, y, 0, y + 32);
        gr.addColorStop(0, '#2a1c14'); gr.addColorStop(0.5, '#5a3e2a'); gr.addColorStop(1, '#1e140e');
        g.fillStyle = gr; g.fillRect(0, y, w, 32);
      }
      for (var k = 0; k < 300; k++) { g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(Math.random() * w, Math.random() * h, 20 + Math.random() * 40, 1); }
    }, true);
  }
  function plushTex() {
    return canvasTex('plush', 128, 128, function (g, w, h) {
      g.fillStyle = '#3a1016'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(210,150,80,0.22)'; g.lineWidth = 2;
      for (var y = 0; y < h; y += 32) for (var x = 0; x < w; x += 32) {
        g.beginPath(); g.ellipse(x + 16, y + 16, 9, 13, 0, 0, Math.PI * 2); g.stroke();
      }
    }, true);
  }
  function textTex(text, o) {
    o = o || {};
    var key = 'txt:' + text + (o.color || '') + (o.bg || '');
    return canvasTex(key, o.w || 1024, o.h || 128, function (g, w, h) {
      if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, w, h); } else g.clearRect(0, 0, w, h);
      g.fillStyle = o.color || '#2a2016';
      g.font = (o.weight || '') + ' ' + (o.size || 64) + 'px ' + (o.font || '"IM Fell English SC", Georgia, serif');
      g.textAlign = 'center'; g.textBaseline = 'middle';
      var lines = text.split('\n');
      lines.forEach(function (ln, i) { g.fillText(ln, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (o.size || 64) * 1.15); });
    });
  }
  function skyTex(key, stops, o) {
    o = o || {};
    return canvasTex('sky:' + key, 256, 512, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h);
      stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      var r = rng(hashStr(key));
      for (var i = 0; i < (o.stars || 0); i++) {
        g.fillStyle = 'rgba(255,255,255,' + (0.3 + r() * 0.6) + ')';
        g.fillRect(r() * w, r() * h * 0.55, 1, 1);
      }
      (o.clouds || []).forEach(function (cl) {
        for (var k = 0; k < cl.n; k++) {
          var x = cl.x * w + (r() - 0.5) * cl.w * w, y = cl.y * h + (r() - 0.5) * cl.h * h, rad = cl.r * w * (0.5 + r());
          var gg = g.createRadialGradient(x, y, 0, x, y, rad);
          gg.addColorStop(0, cl.c); gg.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = gg; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
      });
    });
  }

  // ---------------------------------------------------------------- materials
  var matCache = {};
  function M(color, o) {
    var key = 'p' + color + JSON.stringify(o || {});
    if (matCache[key]) return matCache[key];
    var m = new T.MeshPhongMaterial(Object.assign({ color: color, shininess: 8, flatShading: true }, o || {}));
    m.userData.cached = true;
    return (matCache[key] = m);
  }
  function E(color, o) {
    var key = 'b' + color + JSON.stringify(o || {});
    if (matCache[key]) return matCache[key];
    var m = new T.MeshBasicMaterial(Object.assign({ color: color }, o || {}));
    m.userData.cached = true;
    return (matCache[key] = m);
  }
  function TM(tex, o) { return new T.MeshPhongMaterial(Object.assign({ map: tex, shininess: 6 }, o || {})); }

  // ---------------------------------------------------------------- primitives
  function mesh(geo, mat) { var m = new T.Mesh(geo, mat); return m; }
  function box(w, h, d, mat) { return mesh(new T.BoxGeometry(w, h, d), mat); }
  function cyl(rt, rb, h, mat, seg) { return mesh(new T.CylinderGeometry(rt, rb, h, seg || 10), mat); }
  function sph(r, mat, seg) { return mesh(new T.SphereGeometry(r, seg || 10, Math.max(6, ((seg || 10) * 0.7) | 0)), mat); }
  function put(parent, o, x, y, z, ry) { o.position.set(x || 0, y || 0, z || 0); if (ry) o.rotation.y = ry; parent.add(o); return o; }
  function plane(w, h, mat) { return mesh(new T.PlaneGeometry(w, h), mat); }

  function glow(parent, x, y, z, size, color, opacity) {
    var m = new T.SpriteMaterial({ map: glowTex(), color: color, transparent: true, opacity: opacity == null ? 0.8 : opacity, blending: T.AdditiveBlending, depthWrite: false });
    var s = new T.Sprite(m);
    s.scale.set(size, size, 1);
    s.position.set(x, y, z);
    parent.add(s);
    return s;
  }

  function lamp(X, x, y, z, color, intensity, dist, o) {
    o = o || {};
    var g = new T.Group();
    if (o.light !== false) {
      var L = new T.PointLight(color, intensity, dist, 1.4);
      g.add(L);
      g.userData.light = L;
      var base = intensity, ph = R() * 10, sp = 5 + R() * 6;
      X.upd.push(function (t) { L.intensity = base * (0.86 + 0.14 * Math.sin(t * sp + ph) * Math.sin(t * 2.3 + ph * 1.7)); });
    }
    if (o.body !== false) put(g, box(0.16, 0.22, 0.16, E(o.bodyColor || 0xffd89a)), 0, 0, 0);
    glow(g, 0, 0, 0, o.glow || 1.6, color, o.glowOpacity == null ? 0.75 : o.glowOpacity);
    put(X.s, g, x, y, z);
    return g;
  }

  function lanternPole(X, x, z, h, light) {
    put(X.s, cyl(0.04, 0.05, h, M(0x2a2420), 5), x, h / 2, z);
    lamp(X, x, h + 0.05, z, 0xffb35c, light ? 1.6 : 0, light ? 9 : 0, { light: !!light, glow: 0.8, glowOpacity: 0.6 });
  }

  function lanternString(X, a, b, sag, n, colors) {
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      var p = new T.Vector3().lerpVectors(a, b, t);
      p.y -= Math.sin(t * Math.PI) * sag;
      pts.push(p);
      if (i > 0 && i < n) {
        var c = pick(colors);
        put(X.s, sph(0.12, E(c), 6), p.x, p.y - 0.12, p.z);
        glow(X.s, p.x, p.y - 0.12, p.z, 0.9, c, 0.55);
      }
    }
    var g = new T.BufferGeometry().setFromPoints(pts);
    X.s.add(new T.Line(g, new T.LineBasicMaterial({ color: 0x1c1618 })));
  }

  function skyBg(X, key, stops, o) {
    var t = skyTex(key, stops, o);
    X.s.background = t;
  }

  function ground(X, size, color, o) {
    o = o || {};
    var geo = new T.PlaneGeometry(size, size, 48, 48);
    var cols = [];
    var base = new T.Color(color);
    for (var i = 0; i < geo.attributes.position.count; i++) {
      var k = 0.85 + R() * 0.3;
      cols.push(base.r * k, base.g * k, base.b * (k + (R() - 0.5) * 0.08));
      if (o.bumps) geo.attributes.position.setZ(i, (R() - 0.5) * o.bumps);
    }
    geo.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    var m = new T.MeshPhongMaterial({ vertexColors: true, shininess: o.shine || 10, specular: o.specular || 0x222233, flatShading: !!o.bumps, map: o.map || null });
    var g = mesh(geo, m);
    g.rotation.x = -Math.PI / 2;
    g.position.y = o.y || 0;
    X.s.add(g);
    return g;
  }

  function snow(X, n, box3, o) {
    o = o || {};
    var pos = new Float32Array(n * 3), sp = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      pos[i * 3] = rr(box3[0], box3[1]); pos[i * 3 + 1] = rr(box3[2], box3[3]); pos[i * 3 + 2] = rr(box3[4], box3[5]);
      sp[i] = rr(0.4, 1);
    }
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    var m = new T.PointsMaterial({ size: o.size || 0.08, map: glowTex(), color: o.color || 0xeef3ff, transparent: true, opacity: o.opacity || 0.85, depthWrite: false, blending: o.additive ? T.AdditiveBlending : T.NormalBlending });
    var p = new T.Points(g, m);
    X.s.add(p);
    var up = o.up ? 1 : -1, speed = o.speed || 1;
    X.upd.push(function (t) {
      var a = g.attributes.position.array;
      for (var i = 0; i < n; i++) {
        a[i * 3 + 1] += up * sp[i] * 0.02 * speed;
        a[i * 3] += Math.sin(t * 0.7 + i) * 0.004 * (o.sway == null ? 1 : o.sway);
        if (up < 0 && a[i * 3 + 1] < box3[2]) a[i * 3 + 1] = box3[3];
        if (up > 0 && a[i * 3 + 1] > box3[3]) a[i * 3 + 1] = box3[2];
      }
      g.attributes.position.needsUpdate = true;
    });
    return p;
  }

  function smoke(X, x, y, z, o) {
    o = o || {};
    var n = o.n || 6, puffs = [];
    for (var i = 0; i < n; i++) {
      var m = new T.SpriteMaterial({ map: puffTex(), color: o.color || 0x8a8a98, transparent: true, opacity: 0, depthWrite: false });
      var s = new T.Sprite(m);
      X.s.add(s);
      puffs.push({ s: s, off: i / n });
    }
    var rise = o.rise || 3, size = o.size || 1.2, drift = o.drift || 0.8;
    X.upd.push(function (t) {
      puffs.forEach(function (p) {
        var k = ((t * (o.speed || 0.12)) + p.off) % 1;
        p.s.position.set(x + k * drift + Math.sin(k * 6 + p.off * 9) * 0.15, y + k * rise, z);
        var sc = size * (0.4 + k * 1.3);
        p.s.scale.set(sc, sc, 1);
        p.s.material.opacity = (o.opacity || 0.35) * Math.sin(k * Math.PI);
      });
    });
  }

  // ---------------------------------------------------------------- people
  function limb2(l1, l2, r, mat) {
    var a = new T.Group();
    var m1 = cyl(r, r * 0.88, l1, mat, 6); m1.position.y = -l1 / 2; a.add(m1);
    var b = new T.Group(); b.position.y = -l1; a.add(b);
    var m2 = cyl(r * 0.88, r * 0.72, l2, mat, 6); m2.position.y = -l2 / 2; b.add(m2);
    a.userData.lower = b;
    return a;
  }

  // pose: stand | walk | sit | lie | kneel | armup | wave | dance | hold
  function person(o) {
    o = Object.assign({ h: 1.75, coat: 0x2b2a31, skin: 0xc9a28a, legs: 0x1a181c, hair: 0x3a2c24, pose: 'stand', hat: null, skirt: null, long: true, wide: 1, scarf: null }, o || {});
    var s = o.h / 1.75, w = o.wide;
    var g = new T.Group();
    var coatM = M(o.coat), skinM = M(o.skin), legM = M(o.legs), hairM = M(o.hair);
    var hip = 0.92 * s;
    var body = new T.Group(); body.position.y = hip; g.add(body);
    // legs
    var legL = limb2(0.46 * s, 0.46 * s, 0.075 * s * w, legM), legR = limb2(0.46 * s, 0.46 * s, 0.075 * s * w, legM);
    legL.position.set(-0.1 * s * w, 0, 0); legR.position.set(0.1 * s * w, 0, 0);
    body.add(legL); body.add(legR);
    var bootM = M(o.boots || 0x141114, { shininess: 30 });
    [legL, legR].forEach(function (lg) { var bt = box(0.13 * s * w, 0.1 * s, 0.24 * s, bootM); put(lg.userData.lower, bt, 0, -0.45 * s, 0.04 * s); });
    // torso
    var torso = cyl(0.2 * s * w, 0.25 * s * w, 0.62 * s, coatM, 10);
    torso.position.y = 0.31 * s; body.add(torso);
    if (o.long && o.pose !== 'sit') {
      var skirt = cyl(0.25 * s * w, 0.33 * s * w, 0.5 * s, coatM, 10);
      skirt.position.y = -0.2 * s; body.add(skirt);
    }
    if (o.skirt) {
      var dr = cyl(0.2 * s, 0.5 * s, 0.85 * s, M(o.skirt), 12);
      dr.position.y = -0.42 * s; body.add(dr);
    }
    if (o.apron) { var ap = box(0.36 * s, 0.7 * s, 0.02, M(o.apron)); ap.position.set(0, -0.05 * s, 0.25 * s * w); body.add(ap); }
    if (o.scarf) {
      var sc = cyl(0.13 * s, 0.17 * s, 0.1 * s, M(o.scarf), 8); sc.position.y = 0.64 * s; body.add(sc);
      var tail = box(0.07 * s, 0.3 * s, 0.03 * s, M(o.scarf)); tail.position.set(0.07 * s, 0.48 * s, 0.2 * s * w); tail.rotation.z = 0.15; body.add(tail);
    } else {
      var col2 = cyl(0.12 * s, 0.2 * s * w, 0.09 * s, M(o.coat), 8); col2.position.y = 0.62 * s; body.add(col2);
    }
    if (o.long && o.pose !== 'lie') { for (var bi = 0; bi < 3; bi++) put(body, sph(0.014 * s, M(0x8a7a5a, { shininess: 60 }), 4), 0, 0.45 * s - bi * 0.14 * s, 0.215 * s * w); }
    if (o.belt) put(body, cyl(0.235 * s * w, 0.235 * s * w, 0.05 * s, M(o.belt), 10), 0, 0.05 * s, 0);
    // head
    var head = new T.Group(); head.position.y = 0.8 * s; body.add(head);
    put(head, cyl(0.055 * s, 0.065 * s, 0.1 * s, skinM, 6), 0, -0.07 * s, 0);
    put(head, sph(0.105 * s, skinM, 10), 0, 0.04 * s, 0);
    if (o.hair !== null && !o.hat) { var hr = sph(0.11 * s, hairM, 10); hr.scale.set(1, 0.7, 1); put(head, hr, 0, 0.09 * s, -0.015 * s); }
    if (o.bun) put(head, sph(0.06 * s, hairM, 8), 0, 0.1 * s, -0.1 * s);
    if (o.face) {
      var eyeM = M(0x1a1412);
      put(head, sph(0.014 * s, eyeM, 5), -0.036 * s, 0.05 * s, 0.093 * s);
      put(head, sph(0.014 * s, eyeM, 5), 0.036 * s, 0.05 * s, 0.093 * s);
      put(head, box(0.02 * s, 0.04 * s, 0.03 * s, skinM), 0, 0.02 * s, 0.105 * s);
    }
    put(head, box(0.025 * s, 0.035 * s, 0.03 * s, skinM), 0, 0.02 * s, 0.108 * s);
    put(head, sph(0.022 * s, skinM, 5), -0.1 * s, 0.03 * s, 0); put(head, sph(0.022 * s, skinM, 5), 0.1 * s, 0.03 * s, 0);
    if (!o.face && o.pose !== 'lie') { var shade = M(0x2a1a18); put(head, box(0.075 * s, 0.012 * s, 0.01 * s, shade), 0, 0.05 * s, 0.1 * s); }
    if (o.beard) { var bd = sph(0.08 * s, M(o.beard), 8); bd.scale.set(1, 1.1, 0.7); put(head, bd, 0, -0.03 * s, 0.05 * s); }
    if (o.hat === 'cap') { put(head, cyl(0.11 * s, 0.11 * s, 0.07 * s, M(o.hatColor || 0x1c1c24), 10), 0, 0.12 * s, 0); put(head, box(0.2 * s, 0.015 * s, 0.1 * s, M(o.hatColor || 0x1c1c24)), 0, 0.09 * s, 0.1 * s); }
    if (o.hat === 'hat') { put(head, cyl(0.2 * s, 0.2 * s, 0.015 * s, M(o.hatColor || 0x141418), 14), 0, 0.1 * s, 0); put(head, cyl(0.1 * s, 0.11 * s, 0.14 * s, M(o.hatColor || 0x141418), 12), 0, 0.17 * s, 0); }
    if (o.hat === 'fur') { var fh = cyl(0.125 * s, 0.12 * s, 0.13 * s, M(o.hatColor || 0x4a3a2a), 10); put(head, fh, 0, 0.12 * s, 0); put(head, cyl(0.13 * s, 0.13 * s, 0.04 * s, M(0x6a5a44), 10), 0, 0.07 * s, 0); }
    if (o.hat === 'hood') { var hd = sph(0.14 * s, M(o.hatColor || o.coat), 10); hd.scale.set(1, 1.05, 1.1); put(head, hd, 0, 0.05 * s, -0.02 * s); }
    // arms
    var armL = limb2(0.3 * s, 0.28 * s, 0.06 * s * w, coatM), armR = limb2(0.3 * s, 0.28 * s, 0.06 * s * w, coatM);
    armL.position.set(-0.24 * s * w, 0.58 * s, 0); armR.position.set(0.24 * s * w, 0.58 * s, 0);
    body.add(armL); body.add(armR);
    var handM = o.gloves ? M(o.gloves) : skinM;
    [armL, armR].forEach(function (ar) {
      var hd = sph(0.05 * s, handM, 6); hd.scale.set(0.85, 1.2, 0.6); put(ar.userData.lower, hd, 0, -0.31 * s, 0);
      put(ar.userData.lower, cyl(0.066 * s * w, 0.06 * s * w, 0.05 * s, M(o.cuff || 0x1a1614), 6), 0, -0.26 * s, 0);
    });
    armL.rotation.z = -0.12; armR.rotation.z = 0.12;
    var p = o.pose;
    if (p === 'walk') { legL.rotation.x = 0.35; legR.rotation.x = -0.3; legR.userData.lower.rotation.x = 0.3; armL.rotation.x = -0.3; armR.rotation.x = 0.3; }
    if (p === 'sit') {
      legL.rotation.x = legR.rotation.x = -Math.PI / 2;
      legL.userData.lower.rotation.x = legR.userData.lower.rotation.x = Math.PI / 2;
      body.position.y = 0.46 * s + (o.seat || 0);
      armL.rotation.x = armR.rotation.x = -0.6; armL.userData.lower.rotation.x = armR.userData.lower.rotation.x = -0.6;
    }
    if (p === 'kneel') { legL.rotation.x = -Math.PI / 2; legL.userData.lower.rotation.x = Math.PI / 2; legR.rotation.x = 0.1; legR.userData.lower.rotation.x = Math.PI / 2 - 0.1; body.position.y = 0.48 * s; }
    if (p === 'armup' || p === 'wave') { armL.rotation.z = -2.7; armL.userData.lower.rotation.z = p === 'wave' ? -0.4 : 0; }
    if (p === 'hold') { armL.rotation.x = armR.rotation.x = -1.1; armL.userData.lower.rotation.x = armR.userData.lower.rotation.x = -0.5; }
    if (p === 'dance') { armL.rotation.x = -1.2; armL.rotation.z = -0.5; armR.rotation.x = -1.3; armR.rotation.z = 0.2; armR.userData.lower.rotation.x = -0.6; }
    if (p === 'lie') { g.rotation.x = -Math.PI / 2; }
    if (p === 'hands') { armL.rotation.x = armR.rotation.x = -0.5; armL.userData.lower.rotation.x = armR.userData.lower.rotation.x = -1.2; armL.rotation.z = -0.35; armR.rotation.z = 0.35; }
    g.userData.parts = { body: body, head: head, armL: armL, armR: armR, legL: legL, legR: legR };
    return g;
  }
  function people(X, list) { list.forEach(function (d) { var p = person(d); put(X.s, p, d.x, d.y || 0, d.z, d.ry || 0); }); }

  // ---------------------------------------------------------------- buildings & objects
  var HUT_COLS = [0x2b2326, 0x3c2622, 0x28303c, 0x33302a, 0x402a2e, 0x2c3530, 0x4a3a2a, 0x3a2c38, 0x2a3a3a];
  function hex(c) { return '#' + ('000000' + c.toString(16)).slice(-6); }
  function hutWallMat(col) {
    var key = 'hw' + col;
    if (matCache[key]) return matCache[key];
    var t = planksTex('hutwall' + col, hex(col), true);
    t.repeat.set(1.5, 1);
    var m = new T.MeshPhongMaterial({ map: t, shininess: 5, flatShading: true });
    m.userData.cached = true;
    return (matCache[key] = m);
  }
  function icicles(g, x0, x1, y, z, n) {
    var im = M(0xcfe6f2, { shininess: 90, specular: 0xffffff, emissive: 0x1a2a34 });
    for (var i = 0; i < n; i++) {
      var ic = mesh(new T.ConeGeometry(0.03, rr(0.1, 0.35), 4), im);
      ic.rotation.x = Math.PI;
      put(g, ic, rr(x0, x1), y - 0.08, z);
    }
  }
  function hut(X, x, z, ry, o) {
    o = o || {};
    var w = o.w || rr(2.4, 3.6), h = o.h || rr(1.8, 2.3), d = o.d || rr(2.2, 3.2);
    var g = new T.Group();
    var col = o.color || pick(HUT_COLS);
    put(g, box(w, h, d, o.plain ? M(col) : hutWallMat(col)), 0, h / 2 + 0.15, 0);
    // corner posts and a sill
    var trim = M(0x1e1814);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { put(g, box(0.1, h, 0.1, trim), c[0] * w / 2, h / 2 + 0.15, c[1] * d / 2); });
    var roofH = o.roofH || 0.85, top = h + 0.15, hw = (w * 1.12) / 2;
    var roof = mesh(new T.CylinderGeometry(1, 1, 1, 3), M(o.roof || 0x1c1a1e));
    roof.rotation.x = -Math.PI / 2;
    roof.scale.set(hw / 0.866, d * 1.08, roofH / 1.5);
    roof.position.y = top + 0.5 * roofH / 1.5;
    g.add(roof);
    var slope = Math.atan2(roofH, hw), L = Math.sqrt(hw * hw + roofH * roofH), snowM = M(0xd8dde8);
    var sR = box(L * 1.02, 0.09, d * 1.1, snowM); sR.position.set(hw / 2, top + roofH / 2 + 0.05, 0); sR.rotation.z = -slope; g.add(sR);
    var sL = box(L * 1.02, 0.09, d * 1.1, snowM); sL.position.set(-hw / 2, top + roofH / 2 + 0.05, 0); sL.rotation.z = slope; g.add(sL);
    if (o.icicles !== false) icicles(g, -w / 2, w / 2, top, d / 2 + 0.08, 5 + ((R() * 6) | 0));
    var wx = rr(-w / 4, w / 4) + w / 8;
    if (o.lit !== false && R() < (o.litChance || 0.8)) {
      var wc = o.lightColor || 0xffc46e;
      put(g, plane(0.5, 0.45, E(wc)), wx, h * 0.6, d / 2 + 0.01);
      // frame and mullions
      put(g, box(0.6, 0.05, 0.05, trim), wx, h * 0.6 + 0.25, d / 2 + 0.03);
      put(g, box(0.6, 0.05, 0.05, trim), wx, h * 0.6 - 0.25, d / 2 + 0.03);
      put(g, box(0.04, 0.5, 0.04, trim), wx, h * 0.6, d / 2 + 0.03);
      put(g, box(0.5, 0.03, 0.04, trim), wx, h * 0.6, d / 2 + 0.03);
      if (R() < 0.5) put(g, plane(0.2, 0.45, M(pick([0x8a2a2a, 0x2a4a6a, 0x6a5a2a]))), wx - 0.16, h * 0.6, d / 2 + 0.02);
      glow(g, wx, h * 0.6, d / 2 + 0.3, 2.2, wc, 0.35);
    } else {
      put(g, plane(0.5, 0.45, M(0x0c0c12)), wx, h * 0.6, d / 2 + 0.01);
    }
    // door with frame and a handle
    put(g, plane(0.6, 1.2, M(0x151215)), -w / 3, 0.75, d / 2 + 0.012);
    put(g, box(0.72, 0.06, 0.05, trim), -w / 3, 1.36, d / 2 + 0.03);
    put(g, sph(0.03, M(0x8a7a50, { shininess: 60 }), 5), -w / 3 + 0.2, 0.75, d / 2 + 0.05);
    if (o.pipe !== false && R() < 0.75) {
      var px = w / 4, pz = -d / 4;
      put(g, cyl(0.07, 0.07, 0.9, M(0x1c1c1c), 6), px, h + 0.7, pz);
      put(g, cyl(0.13, 0.07, 0.08, M(0x1c1c1c), 6), px, h + 1.18, pz);
      if (o.smoke !== false) smoke(X, x + px, h + 1.2, z + pz, { n: 5, size: 1, rise: 3.5, opacity: 0.25 });
    }
    // runners and a drift against the wall
    put(g, box(0.08, 0.1, d * 1.1, M(0x3a3028)), -w / 2 + 0.2, 0.05, 0);
    put(g, box(0.08, 0.1, d * 1.1, M(0x3a3028)), w / 2 - 0.2, 0.05, 0);
    var dr = sph(1, snowM, 8); dr.scale.set(w * 0.35, 0.28, 0.5); put(g, dr, rr(-w / 4, w / 4), 0, -d / 2 - 0.1);
    put(X.s, g, x, 0, z, ry || 0);
    if (o.props !== false && R() < 0.7) {
      var ca = Math.cos(ry || 0), sa = Math.sin(ry || 0);
      var lx = w / 2 + 0.45, lz = rr(-d / 3, d / 3);
      var px2 = x + lx * ca + lz * sa, pz2 = z - lx * sa + lz * ca;
      pick([barrel, crates, woodpile, sledge, skis])(X, px2, pz2, rr(0, 6));
    }
    return g;
  }

  function stripesTex(a, b) {
    return canvasTex('stripe' + a + b, 128, 64, function (g, w, h) {
      for (var i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 16, 0, 16, h); }
      g.fillStyle = 'rgba(0,0,0,0.18)'; for (var k = 0; k < 200; k++) g.fillRect(Math.random() * w, Math.random() * h, 1, 1 + Math.random() * 3);
    }, true);
  }
  // A market stall: striped awning, counter, goods, a vendor and a lamp.
  function stall(X, x, z, ry, o) {
    o = o || {};
    var g = new T.Group(), wood = M(0x4a3424);
    var cols = pick([['#8a2a2a', '#e0d4bc'], ['#2a4a6a', '#e0d4bc'], ['#2a5a3a', '#d8c898'], ['#6a3a1a', '#e8c878']]);
    put(g, box(2, 0.9, 0.7, wood), 0, 0.45, 0);
    put(g, box(2.1, 0.05, 0.8, M(0x6a4a30)), 0, 0.92, 0);
    [[-0.95, -0.3], [0.95, -0.3], [-0.95, 0.35], [0.95, 0.35]].forEach(function (c) { put(g, box(0.06, 2.2, 0.06, wood), c[0], 1.1, c[1]); });
    var aw = plane(2.3, 1.1, new T.MeshPhongMaterial({ map: stripesTex(cols[0], cols[1]), side: T.DoubleSide, shininess: 4 }));
    aw.rotation.x = -Math.PI / 2 + 0.35; put(g, aw, 0, 2.15, 0.25);
    put(g, box(2.3, 0.08, 1.1, M(0xd8dde8)), 0, 2.3, 0.1).rotation.x = 0.35;
    var goods = o.goods || pick(['jars', 'fish', 'bread', 'lamps']);
    for (var i = 0; i < 7; i++) {
      var gx = -0.8 + i * 0.27, it;
      if (goods === 'jars') it = cyl(0.07, 0.07, 0.18, M(pick([0xc8802a, 0x8a2a2a, 0xd0b060]), { shininess: 70 }), 8);
      else if (goods === 'fish') { it = box(0.24, 0.05, 0.08, M(0x9a9aa0, { shininess: 60 })); }
      else if (goods === 'bread') { it = sph(0.1, M(0xb07a3a), 7); it.scale.set(1.3, 0.7, 1); }
      else it = box(0.1, 0.16, 0.1, E(pick([0xffc870, 0xff9a5a, 0xf0e0a0])));
      put(g, it, gx, 1.02, rr(-0.15, 0.15));
    }
    lamp(X, x, 1.95, z, 0xffc070, 0.8, 6, { glow: 1.4, light: o.light !== false });
    var v = person({ h: rr(1.55, 1.75), coat: pick(COAT_COLS), pose: 'hands', apron: 0xd8d0c0, scarf: pick(SCARF_COLS), hat: pick(['hood', 'fur', 'cap']), long: false, face: true });
    put(g, v, 0, 0, -0.75, 0);
    put(X.s, g, x, 0, z, ry || 0);
    // the lamp was placed in world space: move it with the stall's facing
    return g;
  }

  // ---------------------------------------------------------------- props
  function barrel(X, x, z, ry) {
    var g = new T.Group();
    put(g, cyl(0.28, 0.25, 0.75, M(0x4a3222), 10), 0, 0.38, 0);
    [0.12, 0.64].forEach(function (y) { put(g, cyl(0.285, 0.285, 0.04, M(0x2a2420, { shininess: 30 }), 10), 0, y, 0); });
    put(g, cyl(0.26, 0.26, 0.04, M(0xdde2ec), 10), 0, 0.77, 0);
    put(X.s, g, x, 0, z, ry);
    return g;
  }
  function crates(X, x, z, ry) {
    var g = new T.Group(), n = 1 + ((R() * 3) | 0);
    var t = planksTex('crate', '#6a5034', false);
    for (var i = 0; i < n; i++) {
      var s = rr(0.4, 0.6);
      var c = box(s, s, s, new T.MeshPhongMaterial({ map: t, shininess: 4 }));
      put(g, c, rr(-0.2, 0.2), s / 2 + (i === 2 ? 0.5 : 0), i === 1 ? 0.55 : 0, rr(-0.3, 0.3));
    }
    put(X.s, g, x, 0, z, ry);
    return g;
  }
  function woodpile(X, x, z, ry) {
    var g = new T.Group(), m = M(0x5a3e28);
    for (var r = 0; r < 4; r++) for (var i = 0; i < 5 - r; i++) {
      var l = cyl(0.08, 0.08, 0.9, m, 6); l.rotation.x = Math.PI / 2;
      put(g, l, (i - (4 - r) / 2) * 0.17, 0.08 + r * 0.15, 0);
    }
    var cap = box(0.95, 0.06, 1, M(0xdde2ec)); put(g, cap, 0, 0.66, 0);
    put(X.s, g, x, 0, z, ry);
    return g;
  }
  function sledge(X, x, z, ry, o) {
    o = o || {};
    var g = new T.Group(), w = M(o.color || 0x6a4a2a);
    put(g, box(0.7, 0.06, 1.5, w), 0, 0.32, 0);
    [-0.3, 0.3].forEach(function (sx) {
      put(g, box(0.05, 0.05, 1.7, M(0x3a3a40, { shininess: 60 })), sx, 0.04, 0.05);
      var tip = mesh(new T.TorusGeometry(0.16, 0.025, 4, 8, Math.PI / 2), M(0x3a3a40)); tip.rotation.y = Math.PI / 2; put(g, tip, sx, 0.2, 0.9);
      [-0.5, 0, 0.5].forEach(function (zz) { put(g, box(0.04, 0.28, 0.04, w), sx, 0.18, zz); });
    });
    if (o.load !== false && R() < 0.6) put(g, box(0.55, 0.3, 0.8, M(pick([0x5a5a4a, 0x4a3a2a, 0x3a4a5a]))), 0, 0.5, -0.2);
    put(X.s, g, x, 0, z, ry);
    return g;
  }
  function skis(X, x, z, ry) {
    var g = new T.Group();
    [-0.08, 0.08].forEach(function (sx, i) { var k = box(0.07, 1.8, 0.02, M(i ? 0x7a5a3a : 0x6a4a2a)); put(g, k, sx, 0.9, 0).rotation.x = -0.12; });
    put(X.s, g, x, 0, z, ry);
    return g;
  }
  function snowbank(X, x, z, r, o) {
    var m = sph(1, M(0xd6dce8), 9); m.scale.set(r, (o && o.h) || r * 0.3, r * 0.7); put(X.s, m, x, 0, z, rr(0, 6));
    return m;
  }
  function fishHole(X, x, z, o) {
    o = o || {};
    var h = cyl(0.3, 0.3, 0.02, new T.MeshPhongMaterial({ color: 0x04080c, shininess: 120, specular: 0x6a8aa0 }), 12); put(X.s, h, x, 0.01, z);
    put(X.s, mesh(new T.TorusGeometry(0.34, 0.06, 5, 14), M(0xc8d4e2)), x, 0.03, z).rotation.x = Math.PI / 2;
    if (o.flag !== false) {
      put(X.s, cyl(0.012, 0.012, 1, M(0x5a4030), 4), x + 0.4, 0.5, z);
      put(X.s, plane(0.25, 0.16, M(o.color || 0xc03030, { side: T.DoubleSide })), x + 0.53, 0.9, z);
    }
  }
  function dryingRack(X, x, z, ry) {
    var g = new T.Group(), w = M(0x4a3a2a);
    put(g, box(0.05, 1.6, 0.05, w), -0.8, 0.8, 0); put(g, box(0.05, 1.6, 0.05, w), 0.8, 0.8, 0);
    put(g, box(1.7, 0.04, 0.04, w), 0, 1.55, 0);
    for (var i = 0; i < 7; i++) { var f = box(0.08, 0.36, 0.02, M(pick([0x8a8a90, 0xa09a88, 0x6a6a72]), { shininess: 50 })); put(g, f, -0.7 + i * 0.23, 1.3, 0); }
    put(X.s, g, x, 0, z, ry);
  }
  // a trampled path through the snow
  function path(X, pts, w, color) {
    var m = new T.MeshPhongMaterial({ color: color || 0x6a7088, shininess: 20, map: speckTex('trodden', '#8a90a8', 0.4, 2000, 4), transparent: true, opacity: 0.7, depthWrite: false });
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      var p = plane(w, len + w * 0.5, m); p.rotation.x = -Math.PI / 2; p.rotation.z = -Math.atan2(b[0] - a[0], b[1] - a[1]);
      p.position.set((a[0] + b[0]) / 2, 0.015, (a[1] + b[1]) / 2); X.s.add(p);
    }
  }
  var COAT_COLS = [0x2b2a31, 0x3a2a2a, 0x262e3a, 0x3a3226, 0x4a2a24, 0x2a3a34, 0x5a4a3a, 0x1e1e26, 0x6a3a2a, 0x3a3a4a];
  var SCARF_COLS = [0x8a1a1a, 0xc8a040, 0x2a4a8a, 0xe0d8c8, 0x6a2a5a, 0x2a6a4a, null, null];
  // A crowd of the Glass: walkers, talkers, children, someone with a lantern.
  function crowd(X, n, x0, x1, z0, z1, o) {
    o = o || {};
    for (var i = 0; i < n; i++) {
      var child = R() < 0.15;
      var d = { x: rr(x0, x1), z: rr(z0, z1), h: child ? rr(1.05, 1.35) : rr(1.55, 1.9), coat: pick(o.coats || COAT_COLS), pose: pick(['walk', 'walk', 'stand', 'stand', 'hands']), ry: rr(0, 6.28),
        hat: pick([null, 'cap', 'hat', 'hood', 'fur', null]), scarf: pick(SCARF_COLS), hair: pick([0x3a2c24, 0x1a1410, 0x8a6a4a, 0x9a9a9a, 0x5a3a20]), long: R() < 0.7, face: true };
      if (R() < 0.3) d.skirt = pick([0x4a2a3a, 0x2a2a3a, 0x5a3a2a]);
      var p = person(d); put(X.s, p, d.x, 0, d.z, d.ry);
      if (!child && R() < (o.lanterns || 0.12)) { var hand = new T.Vector3(); p.updateMatrixWorld(true); p.userData.parts.armR.userData.lower.getWorldPosition(hand); lamp(X, hand.x, hand.y - 0.35, hand.z, 0xffb45a, 0.5, 4, { glow: 0.9 }); }
      if (!child && R() < 0.25) {
        // a companion, facing them
        var e = Object.assign({}, d, { x: d.x + Math.sin(d.ry) * 0.7, z: d.z + Math.cos(d.ry) * 0.7, ry: d.ry + Math.PI, coat: pick(COAT_COLS), hat: pick([null, 'cap', 'hood', 'fur']), pose: 'stand', h: rr(1.55, 1.85) });
        put(X.s, person(e), e.x, 0, e.z, e.ry);
      }
    }
  }

  function pavilion(X, x, z, o) {
    o = o || {};
    var g = new T.Group();
    var W_ = 18, H_ = 5.5, D_ = 11;
    put(g, box(W_, H_, D_, M(0x3a2226)), 0, H_ / 2, 0);
    put(g, box(W_ + 0.4, 0.4, D_ + 0.4, M(0x6a4a2a)), 0, H_, 0);
    for (var i = 0; i < 9; i++) {
      var wx = -W_ / 2 + 1.2 + i * ((W_ - 2.4) / 8);
      put(g, plane(0.9, 2.6, E(0xffd08a)), wx, 2.6, D_ / 2 + 0.02);
      glow(g, wx, 2.6, D_ / 2 + 0.5, 3.2, 0xffb55a, 0.35);
    }
    put(g, plane(2.4, 3.2, E(0xffe0a8)), 0, 1.6, D_ / 2 + 0.03);
    // dome
    var dome = mesh(new T.SphereGeometry(5, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), E(0xffd9a0));
    dome.scale.set(1.3, 0.8, 0.9);
    put(g, dome, 0, H_ + 0.2, 0);
    var ribs = M(0x5a3c20);
    for (var r = 0; r < 10; r++) {
      var rib = mesh(new T.TorusGeometry(5.02, 0.06, 4, 18, Math.PI), ribs);
      rib.rotation.y = (r / 10) * Math.PI; rib.scale.set(1.3, 0.8, 0.9);
      put(g, rib, 0, H_ + 0.2, 0).rotation.y = (r / 10) * Math.PI;
    }
    glow(g, 0, H_ + 2.2, 0, o.big ? 26 : 18, 0xffc070, 0.55);
    put(g, cyl(0.06, 0.06, 2, M(0x2a2020), 5), 0, H_ + 5, 0);
    glow(g, 0, H_ + 6.1, 0, 1.5, 0xffe0a0, 0.9);
    // steps
    for (var s = 0; s < 4; s++) put(g, box(4 - s * 0.3, 0.2, 0.6, M(0x5a4030)), 0, 0.1 + s * 0.2, D_ / 2 + 2.2 - s * 0.55);
    if (o.light !== false) { var L = new T.PointLight(0xffb866, 2.2, 40, 1.2); L.position.set(0, 3, D_ / 2 + 4); g.add(L); }
    put(X.s, g, x, 0, z, o.ry || 0);
    if (o.tilt) { g.rotation.z = o.tilt; g.rotation.x = o.tiltX || 0; g.position.y = o.sink || 0; }
    return g;
  }

  function chandelierModel(X, x, y, z, s, o) {
    o = o || {};
    var g = new T.Group();
    put(g, cyl(0.05 * s, 0.05 * s, 3 * s, M(0x6a5030), 6), 0, 1.6 * s, 0);
    var crystal = M(0xeef4ff, { shininess: 90, specular: 0xffffff, emissive: 0x33302a });
    var ice = new T.MeshPhongMaterial({ color: 0xcfeaf2, transparent: true, opacity: 0.75, shininess: 100, specular: 0xffffff, emissive: 0x223038 });
    var flames = [];
    [[1.6, 0], [1.1, -0.35], [0.6, -0.7]].forEach(function (ring, k) {
      var rad = ring[0] * s, yy = ring[1] * s;
      put(g, mesh(new T.TorusGeometry(rad, 0.035 * s, 5, 24), M(0x8a6a30, { shininess: 40 })), 0, yy, 0).rotation.x = Math.PI / 2;
      var n = 14 - k * 3;
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2;
        var cx = Math.cos(a) * rad, cz = Math.sin(a) * rad;
        var cr = mesh(new T.OctahedronGeometry(0.09 * s), crystal); cr.scale.y = 1.8;
        put(g, cr, cx, yy - 0.25 * s, cz);
        var ic = mesh(new T.ConeGeometry(0.05 * s, rr(0.6, 1.3) * s, 5), ice); ic.rotation.x = Math.PI;
        put(g, ic, Math.cos(a + 0.2) * rad, yy - 0.7 * s, Math.sin(a + 0.2) * rad);
        flames.push(new T.Vector3(cx, yy + 0.12 * s, cz));
      }
    });
    var fg = new T.BufferGeometry().setFromPoints(flames);
    g.add(new T.Points(fg, new T.PointsMaterial({ size: 0.45 * s, map: glowTex(), color: 0xffd28a, transparent: true, depthWrite: false, blending: T.AdditiveBlending })));
    glow(g, 0, -0.2 * s, 0, 7 * s, 0xffcf80, 0.55);
    glow(g, 0, -0.2 * s, 0, 2.5 * s, 0xfff2d0, 0.8);
    var L = new T.PointLight(0xffc878, o.intensity || 2.4, 30 * s, 1.1); L.position.set(0, -0.6 * s, 0); g.add(L);
    X.upd.push(function (t) { g.rotation.y = Math.sin(t * 0.25) * 0.05; L.intensity = (o.intensity || 2.4) * (0.93 + 0.07 * Math.sin(t * 7.1)); });
    put(X.s, g, x, y, z);
    return g;
  }

  function stove(X, x, z, o) {
    o = o || {};
    var g = new T.Group();
    put(g, box(0.6, 0.8, 0.55, M(0x1a1818, { shininess: 30 })), 0, 0.4, 0);
    put(g, plane(0.3, 0.18, E(0xff7a2a)), 0, 0.35, 0.28);
    put(g, cyl(0.07, 0.07, 1.6, M(0x1a1818), 8), 0.1, 1.6, -0.1);
    glow(g, 0, 0.35, 0.4, 1.4, 0xff7a30, 0.8);
    var L = new T.PointLight(0xff8a3c, o.intensity || 1.6, o.dist || 6, 1.3); L.position.set(0, 0.5, 0.6); g.add(L);
    X.upd.push(function (t) { L.intensity = (o.intensity || 1.6) * (0.8 + 0.2 * Math.abs(Math.sin(t * 9) * Math.sin(t * 3.7))); });
    put(X.s, g, x, 0, z, o.ry || 0);
    return g;
  }

  function roomBox(X, w, h, d, o) {
    o = o || {};
    var wallM = o.wallMat || M(o.wall || 0x3a2a24, { side: T.BackSide });
    var walls = box(w, h, d, wallM);
    walls.position.y = h / 2;
    X.s.add(walls);
    var floor = plane(w, d, o.floorMat || M(o.floor || 0x4a3426, { shininess: o.floorShine || 12 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01;
    X.s.add(floor);
    return walls;
  }

  function table(X, x, z, w, d, o) {
    o = o || {};
    var g = new T.Group();
    var topM = M(o.color || 0x5a3e28);
    put(g, box(w, 0.06, d, o.cloth ? M(0xe8e2d4) : topM), 0, o.h || 0.76, 0);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { put(g, box(0.06, o.h || 0.76, 0.06, topM), c[0] * (w / 2 - 0.08), (o.h || 0.76) / 2, c[1] * (d / 2 - 0.08)); });
    put(X.s, g, x, 0, z, o.ry || 0);
    return g;
  }

  function bench(X, x, z, w, o) {
    o = o || {};
    var g = new T.Group(), m = M(o.color || 0x4a3424);
    put(g, box(w, 0.06, 0.4, m), 0, 0.45, 0);
    put(g, box(0.06, 0.45, 0.35, m), -w / 2 + 0.1, 0.22, 0);
    put(g, box(0.06, 0.45, 0.35, m), w / 2 - 0.1, 0.22, 0);
    if (o.back) put(g, box(w, 0.6, 0.06, m), 0, 0.8, -0.2);
    put(X.s, g, x, 0, z, o.ry || 0);
    return g;
  }

  function handModel(mat, s) {
    var g = new T.Group();
    put(g, box(0.09 * s, 0.1 * s, 0.03 * s, mat), 0, 0, 0);
    [-0.033, -0.011, 0.011, 0.033].forEach(function (fx, i) {
      var f = cyl(0.009 * s, 0.008 * s, [0.075, 0.09, 0.085, 0.07][i] * s, mat, 5);
      put(g, f, fx * s, 0.05 * s + [0.075, 0.09, 0.085, 0.07][i] * s / 2, 0).rotation.z = fx * 1.5;
    });
    var th = cyl(0.01 * s, 0.009 * s, 0.06 * s, mat, 5);
    put(g, th, 0.055 * s, 0.01 * s, 0).rotation.z = -0.9;
    return g;
  }

  // A better hand: a rounded palm, jointed fingers that can curl, a thumb.
  function hand2(mat, s, curl, spread) {
    curl = curl || 0; spread = spread == null ? 0.12 : spread;
    var g = new T.Group();
    var palm = sph(0.05 * s, mat, 12); palm.scale.set(1.0, 1.1, 0.42); put(g, palm, 0, 0, 0);
    var lens = [0.078, 0.09, 0.085, 0.068];
    [-0.033, -0.011, 0.011, 0.032].forEach(function (fx, i) {
      var root = new T.Group(); root.position.set(fx * s, 0.05 * s, 0); root.rotation.z = -fx * spread * 30; g.add(root);
      var segs = [lens[i] * 0.5, lens[i] * 0.3, lens[i] * 0.25], r = 0.0105 * s * (i === 3 ? 0.85 : 1), parent = root;
      segs.forEach(function (L, k) {
        var j = new T.Group(); parent.add(j); j.rotation.x = curl * (k === 0 ? 0.9 : 1.1);
        put(j, sph(r * 1.05, mat, 6), 0, 0, 0);
        put(j, cyl(r, r * 0.92, L * s, mat, 6), 0, L * s / 2, 0);
        var nxt = new T.Group(); nxt.position.y = L * s; j.add(nxt); parent = nxt;
        if (k === 2) put(nxt, sph(r * 0.95, mat, 6), 0, 0, 0);
      });
    });
    var th = new T.Group(); th.position.set(0.045 * s, -0.01 * s, 0.01 * s); th.rotation.z = -0.9 + curl * 0.5; th.rotation.x = curl * 0.6; g.add(th);
    put(th, sph(0.014 * s, mat, 6), 0, 0, 0); put(th, cyl(0.013 * s, 0.011 * s, 0.055 * s, mat, 6), 0, 0.028 * s, 0); put(th, sph(0.011 * s, mat, 6), 0, 0.055 * s, 0);
    put(g, cyl(0.03 * s, 0.035 * s, 0.06 * s, mat, 8), 0, -0.07 * s, 0);
    return g;
  }

  function book(X, x, y, z, o) {
    o = o || {};
    var g = new T.Group();
    put(g, box(0.5, 0.05, 0.36, M(o.color || 0x3a2418)), 0, 0, 0);
    var pl = box(0.24, 0.02, 0.33, M(0xe8e0cc)); put(g, pl, -0.12, 0.035, 0).rotation.z = 0.06;
    var pr = box(0.24, 0.02, 0.33, M(0xe8e0cc)); put(g, pr, 0.12, 0.035, 0).rotation.z = -0.06;
    put(X.s, g, x, y, z, o.ry || 0);
    return g;
  }

  function city(X, cx, cz, o) {
    o = o || {};
    var n = o.n || 140, spread = o.spread || 40, hill = o.hill || 18;
    var hillM = mesh(new T.ConeGeometry(spread * 1.1, hill, 12, 1), M(0x16141e));
    hillM.scale.z = 0.5;
    put(X.s, hillM, cx, hill / 2 - 1, cz);
    var geo = new T.BoxGeometry(1, 1, 1);
    var im = new T.InstancedMesh(geo, M(0xffffff), n);
    var dummy = new T.Object3D(), col = new T.Color();
    var winPts = [];
    for (var i = 0; i < n; i++) {
      var dx = (R() - 0.5) * 2 * spread, dz = (R() - 0.5) * spread * 0.6;
      var dist = Math.sqrt((dx * dx) / (spread * spread) + (dz * dz) / (spread * spread * 0.25));
      var baseY = Math.max(0, hill * (1 - dist) - 1.5);
      var bw = rr(1.4, 3.5), bh = rr(2, 6) + (dist < 0.3 ? rr(2, 6) : 0), bd = rr(1.4, 3);
      dummy.position.set(cx + dx, baseY + bh / 2, cz + dz);
      dummy.scale.set(bw, bh, bd);
      dummy.rotation.y = rr(-0.2, 0.2);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
      col.setHSL(rr(0.6, 0.75), rr(0.1, 0.25), rr(0.07, 0.14));
      im.setColorAt(i, col);
      var wn = (bh * bw) / 2 | 0;
      for (var k = 0; k < wn; k++) if (R() < (o.lit || 0.5)) winPts.push(new T.Vector3(cx + dx + rr(-bw / 2, bw / 2), baseY + rr(0.5, bh - 0.3), cz + dz + bd / 2 + 0.05));
    }
    X.s.add(im);
    var wg = new T.BufferGeometry().setFromPoints(winPts);
    X.s.add(new T.Points(wg, new T.PointsMaterial({ size: o.winSize || 1.1, map: glowTex(), color: 0xffc670, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })));
    for (var gk = 0; gk < 5; gk++) glow(X.s, cx + rr(-spread, spread) * 0.6, hill * rr(0.2, 0.6), cz + spread * 0.2, spread * 0.5, 0xffa860, 0.12).material.fog = false;
    // spire and dome
    put(X.s, mesh(new T.ConeGeometry(1.2, 9, 6), M(0x18161f)), cx - spread * 0.15, hill + 3.5, cz);
    put(X.s, cyl(1.4, 1.4, 6, M(0x18161f)), cx - spread * 0.15, hill - 1.5, cz);
    var dome = mesh(new T.SphereGeometry(3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x22202a));
    put(X.s, dome, cx + spread * 0.35, hill * 0.35 + 4, cz + spread * 0.1);
    put(X.s, box(9, 5, 6, M(0x1d1b25)), cx + spread * 0.35, hill * 0.35 + 1.5, cz + spread * 0.1);
  }

  function streakTex() {
    return canvasTex('streak', 32, 256, function (g) {
      var gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 32, 256);
      g.globalCompositeOperation = 'destination-in';
      var h = g.createLinearGradient(0, 0, 32, 0);
      h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(0.5, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = h; g.fillRect(0, 0, 32, 256);
    });
  }
  // A column of reflected light lying on ice or water, from a light toward the camera.
  function reflect(X, x, z, w, len, color, o) {
    o = o || {};
    var m = new T.MeshBasicMaterial({ map: streakTex(), color: color, transparent: true, opacity: o.opacity || 0.5, blending: T.AdditiveBlending, depthWrite: false, fog: false });
    var p = plane(w, len, m);
    p.rotation.x = -Math.PI / 2;
    p.rotation.z = o.rz || 0;
    p.position.set(x, (o.y || 0) + 0.03, z + len / 2);
    X.s.add(p);
    return p;
  }

  function floe(X, x, z, r, o) {
    o = o || {};
    var geo = new T.CylinderGeometry(r, r * 0.95, 0.4, 7);
    var p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) { var k = 0.75 + R() * 0.5; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * (0.75 + R() * 0.5)); }
    geo.computeVertexNormals();
    var m = mesh(geo, M(o.color || 0xb8c6d2, { shininess: 30 }));
    put(X.s, m, x, o.y || 0.05, z, rr(0, 6));
    return m;
  }

  function water(X, size, color, o) {
    o = o || {};
    var geo = new T.PlaneGeometry(size, size, 60, 60);
    var m = new T.MeshPhongMaterial({ color: color, shininess: o.shine || 90, specular: o.specular || 0x6a7a90, flatShading: true, transparent: !!o.opacity, opacity: o.opacity || 1 });
    var w = mesh(geo, m);
    w.rotation.x = -Math.PI / 2;
    w.position.y = o.y || 0;
    X.s.add(w);
    var base = geo.attributes.position.array.slice();
    X.upd.push(function (t) {
      var a = geo.attributes.position.array;
      for (var i = 0; i < a.length; i += 3) a[i + 2] = Math.sin(base[i] * 0.3 + t * 0.9) * 0.08 + Math.cos(base[i + 1] * 0.25 + t * 0.7) * 0.08;
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
    });
    return w;
  }

  function fire(X, x, z, s) {
    s = s || 1;
    put(X.s, cyl(0.5 * s, 0.6 * s, 0.25 * s, M(0x2a2420)), x, 0.12 * s, z);
    var fl = mesh(new T.ConeGeometry(0.35 * s, 0.9 * s, 7), E(0xff8a2a));
    put(X.s, fl, x, 0.6 * s, z);
    var fl2 = mesh(new T.ConeGeometry(0.2 * s, 0.6 * s, 6), E(0xffd070));
    put(X.s, fl2, x, 0.55 * s, z);
    glow(X.s, x, 0.7 * s, z, 4 * s, 0xff7a2a, 0.7);
    var L = new T.PointLight(0xff8030, 2.2 * s, 12 * s, 1.3); L.position.set(x, 1 * s, z); X.s.add(L);
    smoke(X, x, 1.3 * s, z, { n: 6, size: 1.4 * s, rise: 5, opacity: 0.2, color: 0x6a6070 });
    X.upd.push(function (t) {
      var k = 0.85 + 0.15 * Math.sin(t * 11 + x) * Math.sin(t * 5.3);
      fl.scale.set(1, k, 1); fl2.scale.set(1, 2 - k, 1); L.intensity = 2.2 * s * k;
    });
  }

  function signBoard(X, text, x, y, z, w, h, o) {
    o = o || {};
    var t = textTex(text, { color: o.color || '#2a1a10', bg: o.bg || '#d9ccb0', size: o.size || 54, w: 1024, h: Math.round(1024 * h / w) });
    var m = plane(w, h, new T.MeshPhongMaterial({ map: t, side: T.DoubleSide }));
    put(X.s, m, x, y, z, o.ry || 0);
    return m;
  }

  function cam(X, px, py, pz, tx, ty, tz, fov, sway) {
    X.cam.fov = fov || 50;
    X.cam.position.set(px, py, pz);
    X.cam.lookAt(tx, ty, tz);
    X.cam.updateProjectionMatrix();
    var base = new T.Vector3(px, py, pz), tgt = new T.Vector3(tx, ty, tz);
    var amt = sway == null ? 0.12 : sway;
    X.upd.push(function (t) {
      X.cam.position.set(base.x + Math.sin(t * 0.13) * amt, base.y + Math.sin(t * 0.21) * amt * 0.4, base.z + Math.cos(t * 0.11) * amt * 0.5);
      X.cam.lookAt(tgt);
    });
  }

  function lights(X, o) {
    X.s.add(new T.HemisphereLight(o.sky || 0x5a6a9a, o.ground || 0x1a1420, o.hemi == null ? 0.55 : o.hemi));
    if (o.dir !== false) {
      var d = new T.DirectionalLight(o.dirColor || 0x9aaad8, o.dirI == null ? 0.35 : o.dirI);
      d.position.set(o.dx || -30, o.dy || 40, o.dz || 20);
      X.s.add(d);
    }
    if (o.fog) X.s.fog = new T.FogExp2(o.fog, o.fogD || 0.02);
  }

  // ---------------------------------------------------------------- scenes
  var NIGHT_SKY = [[0, '#0b0d22'], [0.22, '#1c1c4a'], [0.36, '#3a2a62'], [0.44, '#7a4266'], [0.5, '#d27e62'], [0.54, '#eea46a'], [0.6, '#5a3450'], [1, '#141024']];

  function harbourView(X, o) {
    skyBg(X, o.key || 'night', NIGHT_SKY, { stars: 220, clouds: [
      { x: 0.65, y: 0.72, w: 0.6, h: 0.08, r: 0.18, n: 26, c: 'rgba(230,140,90,0.28)' },
      { x: 0.3, y: 0.55, w: 0.5, h: 0.1, r: 0.2, n: 18, c: 'rgba(90,70,130,0.35)' }
    ] });
    lights(X, { sky: 0x4a5a8a, ground: 0x141018, hemi: 0.6, dirI: 0.3, fog: 0x2a2440, fogD: 0.0065 });
    ground(X, 600, 0x5a6684, { shine: 50, specular: 0x6a7090, map: speckTex('icegrain', '#9aa6c0', 0.3, 1400, 3) });
    city(X, -70, -150, { n: 170, spread: 55, hill: 26 });
    // the Glass on the ice, far away
    for (var i = 0; i < 26; i++) hut(X, 40 + rr(-22, 22), -120 + rr(-10, 10), rr(0, 3), { smoke: false });
    pavilion(X, 44, -126, { light: false });
    var L = new T.PointLight(0xffb060, 3, 90, 1.1); L.position.set(44, 8, -112); X.s.add(L);
    glow(X.s, 44, 6, -118, 40, 0xffa050, 0.35).material.fog = false;
    reflect(X, 44, -118, 8, 118, 0xffb060, { opacity: 0.45 });
    reflect(X, -60, -140, 30, 120, 0xffa860, { opacity: 0.18 });
    X.s.add(new T.HemisphereLight(0x8a7aa8, 0x2a2438, 0.25));
    snow(X, 700, [-30, 30, 0, 18, -40, 25], { size: 0.1 });
  }

  var SCENES = {};

  SCENES.title = function (X) {
    harbourView(X, { key: 'title' });
    people(X, [{ x: 1.5, z: 12, h: 1.9, coat: 0x2a2a30, pose: 'stand', ry: Math.PI, long: true, hair: 0x6a6a6a }]);
    cam(X, 0.5, 2.4, 20, 18, 5, -100, 45, 0.2);
  };

  SCENES.crossing = function (X) {
    harbourView(X, { key: 'crossing' });
    // sleigh and horse
    var g = new T.Group();
    var wood = M(0x2a2018);
    put(g, box(1.4, 0.5, 2.4, wood), 0, 0.55, 0);
    put(g, box(1.4, 0.7, 0.12, wood), 0, 0.95, 1.15);
    put(g, box(0.08, 0.08, 3, M(0x3a3a40)), -0.6, 0.12, -0.2);
    put(g, box(0.08, 0.08, 3, M(0x3a3a40)), 0.6, 0.12, -0.2);
    var horse = new T.Group(), hm = M(0x1c1612);
    put(horse, box(0.6, 0.7, 1.6, hm), 0, 1.3, 0);
    var neck = box(0.35, 0.9, 0.4, hm); put(horse, neck, 0, 1.8, -0.8).rotation.x = -0.6;
    put(horse, box(0.3, 0.3, 0.6, hm), 0, 2.15, -1.2);
    [[-0.2, -0.6], [0.2, -0.6], [-0.2, 0.6], [0.2, 0.6]].forEach(function (l) { put(horse, cyl(0.07, 0.06, 1, hm, 5), l[0], 0.5, l[1]); });
    put(g, horse, 0, 0, -3);
    lamp(X, 0.8, 1.6, 12 - 1.2, 0xffc070, 1.2, 8, {});
    put(X.s, g, 0.8, 0, 12);
    var a = person({ h: 1.9, coat: 0x2a2a30, pose: 'sit', hair: 0x6a6a6a, seat: 0.3 }); put(X.s, a, 0.45, 0.3, 12.6);
    var b = person({ h: 1.65, coat: 0x2c2c3a, pose: 'sit', hair: 0x1a1410, bun: true, seat: 0.3 }); put(X.s, b, 1.15, 0.3, 12.6);
    cam(X, 6.5, 3.6, 17.5, 8, 1, -60, 48, 0.15);
  };

  SCENES.dream = function (X) {
    X.s.background = new T.Color(0x0a0716);
    lights(X, { sky: 0x6a4aa8, ground: 0x07040e, hemi: 0.55, dir: false, fog: 0x0c0818, fogD: 0.12 });
    // a slab of black ice, seen edge-on from just beneath
    var slab = box(12, 0.35, 12, new T.MeshPhongMaterial({ color: 0x2a3a6a, transparent: true, opacity: 0.55, shininess: 100, specular: 0xb0c0ff, emissive: 0x0a1030 }));
    put(X.s, slab, 0, 0, -1.5);
    var above = plane(20, 20, E(0x3a2a6a)); above.rotation.x = -Math.PI / 2; above.position.y = 1.6; X.s.add(above);
    // your gloved hand pressing down from above, and a small pale hand rising to meet it
    var big = hand2(M(0x1c1a22), 7, 0.05, 0.2); big.rotation.x = -Math.PI / 2; big.rotation.z = Math.PI; put(X.s, big, 0, 0.25, -1.2);
    var small = hand2(M(0xd0d6ea, { emissive: 0x2a2a44 }), 3.6, 0.08, 0.22); small.rotation.x = -0.25; put(X.s, small, 0.05, -0.78, -1.15);
    glow(X.s, 0, -0.3, -1.1, 2.4, 0xc8d0ff, 0.45);
    glow(X.s, 0, 1.2, -2, 8, 0x8a6ad0, 0.35);
    var L = new T.PointLight(0xa890ff, 1.2, 6, 1.2); L.position.set(0, -1, 0.5); X.s.add(L);
    snow(X, 260, [-3, 3, -3, -0.2, -3, 1.5], { up: true, size: 0.05, color: 0xb0c0ff, opacity: 0.55, speed: 0.3 });
    X.upd.push(function (t) { small.position.y = -0.78 + Math.sin(t * 0.8) * 0.01; });
    cam(X, 0.2, -0.75, 1.6, 0, -0.1, -1.3, 55, 0.04);
  };

  SCENES.gate = function (X) {
    skyBg(X, 'gate', [[0, '#090b1c'], [0.5, '#1c1a3c'], [0.85, '#3a2848'], [1, '#4a3050']], { stars: 150 });
    lights(X, { sky: 0x4a5a8a, ground: 0x1a1420, hemi: 0.45, dirI: 0.25, fog: 0x1a1830, fogD: 0.03 });
    ground(X, 200, 0x9aa6c0, { shine: 12, map: speckTex('snowgrain', '#c8d0e0', 0.2, 1200, 2) });
    // the arch of ice blocks
    var iceM = new T.MeshPhongMaterial({ color: 0xa8e0f0, emissive: 0x3a6070, transparent: true, opacity: 0.85, shininess: 90, specular: 0xffffff });
    for (var i = 0; i < 17; i++) {
      var a = (i / 16) * Math.PI;
      var bx = -Math.cos(a) * 4.2, by = Math.sin(a) * 5.2 + 0.2;
      var b = box(1.1, 0.8, 0.9, iceM);
      put(X.s, b, bx, by, 0).rotation.z = a - Math.PI / 2;
      if (i % 2 === 0) glow(X.s, bx, by, 0.2, 1.6, i % 4 ? 0x9fe2f2 : 0xffd890, 0.5);
    }
    for (var j = 0; j < 2; j++) put(X.s, box(1.2, 0.8, 1, iceM), j ? 4.2 : -4.2, 0.4, 0);
    var L1 = new T.PointLight(0x9fdcf0, 1.4, 12, 1.2); L1.position.set(0, 4, 1); X.s.add(L1);
    var bt = textTex('THAW BALL  ·  TONIGHT\nALL WELCOME  ·  NO KNIVES', { color: '#3a1410', bg: '#efe2c4', size: 92, w: 1024, h: 256, font: 'Georgia, serif', weight: 'bold' });
    put(X.s, plane(5.2, 1.3, new T.MeshBasicMaterial({ map: bt, side: T.DoubleSide })), 0, 3.7, 0.6);
    for (var k = 0; k < 18; k++) hut(X, rr(-16, 16), rr(-30, -8), rr(0, 6), {});
    lanternString(X, new T.Vector3(-8, 5, -6), new T.Vector3(8, 5, -6), 1.2, 14, [0xffcf7a, 0xff9a6a, 0xf4e0a0]);
    lanternString(X, new T.Vector3(-10, 4.5, -14), new T.Vector3(10, 4.8, -12), 1, 16, [0xffcf7a, 0xff9a6a, 0xf4e0a0]);
    lamp(X, 0, 2.2, -10, 0xffb060, 1.2, 20, { glow: 3 });
    // Pim, waving, running up
    people(X, [{ x: 0.8, z: 4, h: 1.8, coat: 0x26303e, pose: 'wave', hat: 'cap', hatColor: 0x1a2230, long: true, ry: -0.2, scarf: 0x7a7a80 }]);
    path(X, [[0, 14], [0, 0], [0.5, -12]], 3.2);
    crowd(X, 14, -4, 4, -8, -1, { lanterns: 0.2 });
    crowd(X, 5, -7, -3, 2, 6, {});
    stall(X, -5.5, -3, 0.5, { goods: 'bread' }); stall(X, 5.8, -2, -0.6, { goods: 'lamps' });
    sledge(X, 3.2, 6, 0.3, {}); barrel(X, -3.4, 5, 0); snowbank(X, -6, 8, 2); snowbank(X, 6.5, 9, 2.4);
    snow(X, 400, [-10, 10, 0, 10, -6, 12], { size: 0.07 });
    cam(X, 0.6, 1.7, 12, 0, 3.2, 0, 52, 0.12);
  };

  SCENES.body = function (X) {
    X.s.background = new T.Color(0x05080c);
    lights(X, { sky: 0x4a5a7a, ground: 0x05080c, hemi: 0.5, dir: false });
    var top = new T.PointLight(0xffe0b0, 1.6, 7, 1.2); top.position.set(0, 2.4, 0.6); X.s.add(top);
    var cold = new T.PointLight(0x6aa0c0, 0.8, 4, 1.2); cold.position.set(0, -0.2, 0.2); X.s.add(cold);
    // under-ice void and the man
    put(X.s, plane(30, 30, M(0x04070a)), 0, -1.6, 0).rotation.x = -Math.PI / 2;
    var man = person({ h: 1.78, coat: 0x2e2a26, skin: 0xc8b2a2, hair: 0x9a9ea4, legs: 0x1c1a18, pose: 'lie', beard: 0x8a8a88, long: true, face: true });
    put(X.s, man, 0, -0.62, 0.3, 0.15);
    man.userData.parts.armL.visible = false;
    man.updateMatrixWorld(true);
    var sh = new T.Vector3(); man.userData.parts.armL.getWorldPosition(sh);
    var armLen = -0.04 - sh.y;
    var arm = cyl(0.055, 0.05, armLen, M(0x2e2a26), 6); arm.position.set(sh.x, sh.y + armLen / 2, sh.z); X.s.add(arm);
    var palm = handModel(M(0xc8b8ac), 1.6); palm.rotation.x = -Math.PI / 2; palm.position.set(sh.x, -0.05, sh.z - 0.08); X.s.add(palm);
    // floating hair crown
    for (var i = 0; i < 26; i++) {
      var h = cyl(0.008, 0.004, rr(0.15, 0.3), M(0xa8acb0), 3);
      var a = rr(0, Math.PI * 2);
      h.position.set(-0.1 + Math.cos(a) * 0.12, -0.35, -0.55 + Math.sin(a) * 0.12);
      h.rotation.z = a; h.rotation.x = Math.PI / 2;
      X.s.add(h);
    }
    // rope trailing
    var curve = new T.CatmullRomCurve3([new T.Vector3(0.1, -0.45, 0.8), new T.Vector3(0.8, -0.5, 1.4), new T.Vector3(1.8, -0.6, 1.6), new T.Vector3(2.6, -0.62, 2.4)]);
    X.s.add(mesh(new T.TubeGeometry(curve, 24, 0.025, 5), M(0x8a6a3a)));
    // the ice sheet
    var scratch = canvasTex('icecracks', 512, 512, function (g, w, h) {
      g.fillStyle = '#35505e'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(220,240,250,0.35)'; g.lineWidth = 1;
      for (var i = 0; i < 40; i++) { g.beginPath(); var x0 = Math.random() * w, y0 = Math.random() * h; g.moveTo(x0, y0); for (var k = 0; k < 5; k++) { x0 += (Math.random() - 0.5) * 80; y0 += (Math.random() - 0.5) * 80; g.lineTo(x0, y0); } g.stroke(); }
      for (var j = 0; j < 300; j++) { g.fillStyle = 'rgba(230,245,255,' + Math.random() * 0.5 + ')'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, Math.random() * 2.5, 0, 7); g.fill(); }
    }, true);
    scratch.repeat.set(3, 3);
    var iceM = new T.MeshPhongMaterial({ color: 0x3a5664, transparent: true, opacity: 0.38, shininess: 30, specular: 0x2a2620, map: scratch });
    var ice = plane(30, 30, iceM); ice.rotation.x = -Math.PI / 2; X.s.add(ice);
    // bubbles in the ice
    var bp = [];
    for (var b = 0; b < 120; b++) bp.push(new T.Vector3(rr(-4, 4), rr(-0.3, -0.05), rr(-3, 3)));
    X.s.add(new T.Points(new T.BufferGeometry().setFromPoints(bp), new T.PointsMaterial({ size: 0.05, color: 0xd8f0f8, transparent: true, opacity: 0.6 })));
    // lanterns ring
    [[-3.2, -2.4], [3.2, -2.4], [-3.6, 1.4], [3.6, 1.4], [0, -3.6]].forEach(function (p, i) { lanternPole(X, p[0], p[1], 1.6, i < 4); });
    // crowd legs at the edge, the Chandelier steps at the top
    for (var c = 0; c < 10; c++) {
      var a2 = (c / 10) * Math.PI * 2;
      people(X, [{ x: Math.cos(a2) * 4.6, z: Math.sin(a2) * 4.2, h: rr(1.6, 1.85), coat: pick(HUT_COLS), ry: -a2 - Math.PI / 2, hat: pick([null, 'cap', 'hat']), long: true }]);
    }
    for (var s = 0; s < 3; s++) put(X.s, box(4, 0.2, 0.6, M(0x5a4030)), 0, 0.1 + s * 0.2, -4.6 - s * 0.5);
    lamp(X, 0, 1.4, -5.4, 0xffc070, 1.4, 10, { glow: 3 });
    // the watching boots
    cam(X, 0.4, 3.3, 2.6, 0, -0.5, -0.3, 52, 0.05);
  };

  SCENES.glass = function (X) {
    var act3 = X.v.act3;
    skyBg(X, act3 ? 'glassMild' : 'glass', act3 ? [[0, '#141a2a'], [0.6, '#3a3a50'], [1, '#6a5060']] : [[0, '#090b1c'], [0.45, '#1e1a42'], [0.8, '#48304e'], [1, '#6a3a4e']], { stars: act3 ? 0 : 180, clouds: [{ x: 0.5, y: 0.35, w: 0.9, h: 0.15, r: 0.2, n: 20, c: 'rgba(70,50,100,0.35)' }] });
    lights(X, { sky: 0x4a5a8a, ground: 0x1a1420, hemi: 0.5, dirI: 0.25, fog: act3 ? 0x2a2a3a : 0x1c1a32, fogD: 0.018 });
    ground(X, 300, act3 ? 0x5a6478 : 0x8a96b4, { shine: act3 ? 80 : 14, specular: act3 ? 0x8a9ab0 : 0x222233, map: speckTex('snowgrain', '#c8d0e0', 0.2, 1200, 2) });
    pavilion(X, 0, -18, { big: true });
    city(X, -40, -230, { n: 120, spread: 70, hill: 30, lit: 0.4 });
    for (var i = 0; i < 52; i++) {
      var x = rr(-40, 40), z = rr(-45, 8);
      if (Math.abs(x) < 12 && z < -8 && z > -30) continue;
      if (Math.abs(x) < 4.5 && z > -9) continue;
      hut(X, x, z, rr(-0.4, 0.4) + (R() < 0.5 ? Math.PI / 2 : 0), {});
    }
    // the main lane up to the Chandelier's steps
    path(X, [[0, 16], [0.8, 6], [-0.5, -4], [0, -10.5]], 4.2);
    path(X, [[-3, 2], [-14, 0], [-24, 3]], 2.2);
    path(X, [[3, -1], [13, -4], [26, -2]], 2.2);
    stall(X, -3.4, 4.5, 0.25, { goods: 'fish' });
    stall(X, 3.6, 1.5, -0.3, { goods: 'jars' });
    stall(X, -3.6, -3, 0.2, { goods: 'lamps', light: false });
    for (var lp = 0; lp < 5; lp++) { lanternPole(X, -2.4, 10 - lp * 4, 2.6, lp % 2 === 0); lanternPole(X, 2.4, 9 - lp * 4, 2.6, false); }
    sledge(X, 1.6, 7, 0.4, {}); barrel(X, -2.1, 8.2, 0); crates(X, 2.2, -2.5, 0.5);
    snowbank(X, -5, 12, 1.8); snowbank(X, 5.5, 13, 2.2); snowbank(X, 9, 4, 1.4);
    crowd(X, 26, -3, 3, -9, 12, { lanterns: 0.15 });
    crowd(X, 10, -16, -5, -2, 4, {});
    crowd(X, 10, 5, 16, -5, 2, {});
    lanternString(X, new T.Vector3(-14, 4.5, -4), new T.Vector3(-2, 4.5, -10), 1, 12, [0xffcf7a, 0xff9a6a, 0xf4e0a0]);
    lanternString(X, new T.Vector3(2, 4.5, -10), new T.Vector3(16, 4.5, -3), 1, 12, [0xffcf7a, 0xff9a6a, 0xf4e0a0]);
    lanternString(X, new T.Vector3(-20, 4, -20), new T.Vector3(-10, 5, -12), 0.8, 10, [0xffcf7a, 0xf4e0a0]);
    lamp(X, -6, 3, -2, 0xffb060, 1, 14, { glow: 2 });
    lamp(X, 7, 3, 0, 0xffb060, 1, 14, { glow: 2 });
    if (!act3) snow(X, 700, [-20, 20, 0, 14, -30, 14], { size: 0.08 });
    cam(X, 2, 9, 22, 0, 2.5, -14, 50, 0.2);
  };

  function hall(X, o) {
    lights(X, { sky: 0x6a3a3a, ground: 0x1a0c0c, hemi: 0.35, dir: false });
    var plush = new T.MeshPhongMaterial({ map: plushTex(), side: T.BackSide, shininess: 4 });
    plush.map.repeat.set(10, 4);
    var floorT = planksTex('parquet', '#6a4228', false); floorT.repeat.set(6, 6);
    roomBox(X, 26, 10, 18, { wallMat: plush, floorMat: new T.MeshPhongMaterial({ map: floorT, shininess: 60, specular: 0x6a4a30 }) });
    for (var i = -3; i <= 3; i++) {
      put(X.s, box(0.3, 10, 0.3, M(0x8a6a30, { shininess: 50 })), i * 3.6, 5, -8.8);
      if (i > -3) { put(X.s, box(0.3, 10, 0.3, M(0x8a6a30, { shininess: 50 })), -12.8, 5, i * 2.4); put(X.s, box(0.3, 10, 0.3, M(0x8a6a30, { shininess: 50 })), 12.8, 5, i * 2.4); }
    }
    // stage and band
    put(X.s, box(9, 0.6, 3, M(0x3a2218)), 0, 0.3, -7.2);
    put(X.s, plane(9, 5, M(0x7a1a22)), 0, 3.2, -8.9);
    var band = [
      { x: -2.8, z: -7.2, pose: 'sit', coat: 0x1c1c22, seat: 0.6, hair: 0x8a8a8a },
      { x: -0.9, z: -7.4, pose: 'hold', coat: 0x1c1c22, hair: 0x2a2020 },
      { x: 1, z: -7.4, pose: 'sit', coat: 0x1c1c22, seat: 0.6 },
      { x: 2.9, z: -7.2, pose: 'hold', coat: 0x1c1c22 }
    ];
    band.forEach(function (b) { var p = person(Object.assign({ h: 1.72, long: false }, b)); put(X.s, p, b.x, b.pose === 'sit' ? 0.14 : 0.6, b.z); });
    put(X.s, box(0.5, 0.45, 0.3, M(0x7a1a1a, { shininess: 40 })), -2.8, 1.35, -6.85);
    var cello = sph(0.3, M(0x6a3a1a, { shininess: 50 })); cello.scale.set(0.8, 1.6, 0.4); put(X.s, cello, 1.3, 1.25, -6.9);
    put(X.s, cyl(0.25, 0.25, 0.35, M(0x8a2a2a)), 3.4, 0.8, -6.8);
    // tables
    for (var t = 0; t < 4; t++) { table(X, -10.5, -5 + t * 3.5, 1.4, 1.4, { cloth: true }); table(X, 10.5, -5 + t * 3.5, 1.4, 1.4, { cloth: true }); }
    for (var k = 0; k < 6; k++) { lamp(X, -12.6, 4, -6 + k * 2.8, 0xffc070, 0, 0, { light: false, glow: 1.4 }); lamp(X, 12.6, 4, -6 + k * 2.8, 0xffc070, 0, 0, { light: false, glow: 1.4 }); }
    // garlands of paper roses
    for (var g = 0; g < 3; g++) {
      var pts = [];
      for (var q = 0; q <= 30; q++) {
        var tt = q / 30, x = -12 + tt * 24, y = 7 - Math.sin(tt * Math.PI) * 1.2, z = -6 + g * 5;
        if (q % 2 === 0) put(X.s, sph(0.14, M(pick([0xc03040, 0xe06070, 0xf0e0d0])), 6), x, y, z);
        pts.push(new T.Vector3(x, y, z));
      }
      X.s.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x3a2a1a })));
    }
    chandelierModel(X, 0, 6.2, -1, 1.7, { intensity: o.act3 ? 1.7 : 1.9 });
    var fill = new T.PointLight(0xffb070, 0.5, 30, 1.2); fill.position.set(0, 3, 6); X.s.add(fill);
    X.s.fog = new T.FogExp2(0x1a0a0c, 0.03);
  }

  SCENES.chandelier = function (X) {
    hall(X, {});
    people(X, [
      { x: -6, z: -2, coat: 0xe8e4dc, pose: 'hold', long: false, legs: 0x1a1a1a, ry: 0.5 },
      { x: 6.5, z: 0.5, coat: 0xe8e4dc, pose: 'stand', long: false, legs: 0x1a1a1a, ry: -0.6 },
      { x: -3, z: 3, coat: 0x2a1a24, pose: 'walk', ry: 0.3, skirt: 0x6a1a2a },
      { x: 4, z: 4, coat: 0x1c2230, pose: 'stand', ry: -0.4, hat: 'hat' }
    ]);
    // a boy on a ladder lighting the chandelier
    put(X.s, box(0.05, 4.6, 0.05, M(0x5a4030)), 2, 2.3, -0.4).rotation.z = 0.2;
    put(X.s, box(0.05, 4.6, 0.05, M(0x5a4030)), 2.5, 2.3, -0.4).rotation.z = 0.2;
    cam(X, 0, 3.2, 10, 0, 4, -3, 55, 0.12);
  };

  SCENES.ballroom = function (X) {
    hall(X, { act3: true });
    var dress = [0x8a1a2a, 0x1a4a3a, 0xd0b060, 0x3a2a6a, 0xa04060, 0x2a4a7a, 0xe0d8c0, 0x6a1a4a];
    var couples = [];
    for (var i = 0; i < 16; i++) {
      var cx = rr(-9, 9), cz = rr(-4.5, 6);
      var cg = new T.Group();
      var a = person({ h: 1.8, coat: pick([0x1a1a22, 0x222230, 0x2a1a1a]), pose: 'dance', long: false, hair: pick([0x2a1a10, 0x6a5a4a]) });
      var b = person({ h: 1.65, coat: pick(dress), skirt: pick(dress), pose: 'dance', long: false, hair: pick([0x2a1a10, 0x8a5a2a, 0xd0b070]), bun: R() < 0.5 });
      put(cg, a, 0, 0, 0.28, Math.PI);
      put(cg, b, 0, 0, -0.28, 0);
      put(X.s, cg, cx, 0, cz, rr(0, 6));
      couples.push({ g: cg, sp: rr(0.4, 0.9), ph: rr(0, 6), cx: cx, cz: cz });
    }
    X.upd.push(function (t) {
      couples.forEach(function (c) {
        c.g.rotation.y = t * c.sp + c.ph;
        c.g.position.x = c.cx + Math.sin(t * 0.3 + c.ph) * 0.8;
        c.g.position.z = c.cz + Math.cos(t * 0.3 + c.ph) * 0.5;
      });
    });
    // the crack across the floor
    var pts = [], x = -13, z = 7;
    while (x < 13) { pts.push(new T.Vector3(x, 0.02, z)); x += rr(0.8, 1.8); z += rr(-0.9, 0.5); }
    for (var k = 0; k < pts.length - 1; k++) {
      var a2 = pts[k], b2 = pts[k + 1];
      var len = a2.distanceTo(b2);
      var seg = box(len, 0.02, 0.09, E(0x020304));
      seg.position.copy(a2).lerp(b2, 0.5);
      seg.rotation.y = -Math.atan2(b2.z - a2.z, b2.x - a2.x);
      X.s.add(seg);
    }
    glow(X.s, 0, 0.3, 4, 10, 0x6ad0e0, 0.12);
    snow(X, 300, [-3, 3, 0, 6, -3, 1], { size: 0.06, color: 0xd8f0ff, opacity: 0.6, speed: 1.4, sway: 0 });
    cam(X, 0, 3.4, 11.5, 0, 3.2, -2, 55, 0.12);
  };

  SCENES.hut = function (X) {
    lights(X, { sky: 0x4a3a3a, ground: 0x100a08, hemi: 0.25, dir: false });
    var wallT = planksTex('hutplank', '#4a3426', true); wallT.repeat.set(3, 1);
    var floorT = planksTex('hutfloor', '#3e2c20', false); floorT.repeat.set(2, 2);
    roomBox(X, 5, 2.6, 4.4, { wallMat: new T.MeshPhongMaterial({ map: wallT, side: T.BackSide, shininess: 4 }), floorMat: new T.MeshPhongMaterial({ map: floorT, shininess: 8 }) });
    stove(X, -1.8, -1.6, { intensity: 1.8 });
    lamp(X, 0.2, 2.05, -0.6, 0xffc070, 1.3, 7, { glow: 1.8 });
    put(X.s, cyl(0.005, 0.005, 0.5, M(0x222222), 3), 0.2, 2.35, -0.6);
    // flags in a rack
    [[1.5, 0x2a5aa8], [1.75, 0xa82a2a], [2, 0x2a5aa8], [2.2, 0xc8b050]].forEach(function (f) {
      var pole = cyl(0.02, 0.02, 2, M(0x5a4030), 5); put(X.s, pole, f[0], 1, -2).rotation.z = 0.08;
      var cl = plane(0.45, 0.32, M(f[1], { side: T.DoubleSide })); put(X.s, cl, f[0] + 0.25, 1.75, -2);
    });
    // the table and the Warden's log
    table(X, 1.2, -0.9, 1.2, 0.8, {});
    book(X, 1.2, 0.82, -0.9, { color: 0x2a3a2a, ry: 0.3 });
    // the trapdoor over the hole
    put(X.s, plane(1.1, 1.1, new T.MeshPhongMaterial({ color: 0x050a10, shininess: 120, specular: 0x5a7a8a })), 0, 0.02, 0.6).rotation.x = -Math.PI / 2;
    [[0, 0.02, 0.05, 1.3, 0.06, 0.1], [0, 0.02, 1.15, 1.3, 0.06, 0.1], [-0.6, 0.02, 0.6, 0.1, 0.06, 1.2], [0.6, 0.02, 0.6, 0.1, 0.06, 1.2]].forEach(function (e) { put(X.s, box(e[3], e[4], e[5], M(0x9ab8c8, { shininess: 60 })), e[0], e[1], e[2]); });
    var lidT = planksTex('lid', '#5a4030', true);
    var lid = box(1.1, 0.05, 1.1, new T.MeshPhongMaterial({ map: lidT })); put(X.s, lid, 1.25, 0.03, 0.9).rotation.y = 0.2;
    // rope coil
    for (var r = 0; r < 7; r++) put(X.s, mesh(new T.TorusGeometry(0.32 - r * 0.012, 0.025, 5, 16), M(0x9a7a4a)), -1, 0.04 + r * 0.05, 0.4).rotation.x = Math.PI / 2;
    bench(X, -1.6, -0.6, 1.2, { ry: Math.PI / 2 });
    // Aino, on the bench by the stove, with the chisel
    var aino = person({ h: 1.6, coat: 0x5a2a24, skin: 0xc8a088, hair: 0x1a1210, pose: 'sit', seat: 0, long: false, legs: 0x2a2020, wide: 1.1 });
    put(X.s, aino, -1.55, 0, -0.6, Math.PI / 2 + 0.4);
    var ch = cyl(0.02, 0.02, 1.8, M(0x8a8a90, { shininess: 60 }), 5); put(X.s, ch, -1.2, 0.9, -0.4).rotation.z = 0.35;
    cam(X, 0.3, 1.55, 2.1, -0.3, 0.8, -1, 60, 0.05);
  };

  SCENES.cutters = function (X) {
    lights(X, { sky: 0x6a4a40, ground: 0x0e0808, hemi: 0.45, dir: false, fog: 0x1a0e0c, fogD: 0.012 });
    var wallT = planksTex('shedplank', '#3a2a22', true); wallT.repeat.set(10, 2);
    roomBox(X, 10, 5, 24, { wallMat: new T.MeshPhongMaterial({ map: wallT, side: T.BackSide }), floor: 0x2a2018 });
    // saws on the walls
    for (var i = 0; i < 6; i++) {
      [-4.95, 4.95].forEach(function (x) {
        var saw = box(0.04, 0.35, 3.2, M(0xa8aab0, { shininess: 80, specular: 0xffffff }));
        put(X.s, saw, x, 3 - (i % 2) * 0.4, -9 + i * 3.4);
        put(X.s, box(0.06, 0.4, 0.12, M(0x5a3a20)), x, 3 - (i % 2) * 0.4, -9 + i * 3.4 - 1.7);
        put(X.s, box(0.06, 0.4, 0.12, M(0x5a3a20)), x, 3 - (i % 2) * 0.4, -9 + i * 3.4 + 1.7);
      });
    }
    // UNPRICED on the far wall
    var tex = textTex('UNPRICED', { color: '#b02418', size: 170, font: 'Georgia, serif', weight: 'bold', w: 1024, h: 256 });
    put(X.s, plane(8, 2, new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, fog: false })), 0, 3.1, -11.9);
    var wl = new T.PointLight(0xff9a50, 1.2, 10, 1.2); wl.position.set(0, 2.5, -9); X.s.add(wl);
    // braziers
    [[-2, -6], [2.2, 1], [-1.5, 6]].forEach(function (b) {
      put(X.s, cyl(0.4, 0.35, 0.8, M(0x2a2420)), b[0], 0.4, b[1]);
      put(X.s, cyl(0.36, 0.36, 0.05, E(0xff7a2a)), b[0], 0.82, b[1]);
      glow(X.s, b[0], 1.1, b[1], 3.4, 0xff6a20, 0.75);
      var L = new T.PointLight(0xff7030, 2, 10, 1.3); L.position.set(b[0], 1.4, b[1]); X.s.add(L);
      smoke(X, b[0], 1.2, b[1], { n: 5, size: 1, rise: 3, opacity: 0.18 });
    });
    for (var k = 0; k < 4; k++) { bench(X, -3.2, -8 + k * 4.5, 2.4, { ry: Math.PI / 2 }); bench(X, 3.2, -8 + k * 4.5, 2.4, { ry: Math.PI / 2 }); }
    var men = [];
    for (var m = 0; m < 14; m++) {
      var side = m % 2 ? 1 : -1;
      men.push({ x: side * 3.2, z: -8.5 + (m >> 1) * 2.4 + rr(-0.4, 0.4), pose: R() < 0.7 ? 'sit' : 'stand', seat: 0, ry: side > 0 ? -Math.PI / 2 : Math.PI / 2, coat: pick([0x3a2a1a, 0x2a2a2a, 0x3a3020, 0x28303a]), hat: pick([null, 'cap', 'cap']), wide: 1.15, h: rr(1.7, 1.9), long: false, beard: R() < 0.5 ? 0x4a3a2a : null });
    }
    people(X, men);
    people(X, [{ x: 0, z: -8.5, h: 2.05, wide: 1.35, coat: 0x2a2018, pose: 'stand', hair: null, beard: 0x5a4a3a, long: false }]);
    cam(X, 0.5, 2.3, 8, 0, 1.8, -8, 58, 0.1);
  };

  SCENES.works = function (X) {
    skyBg(X, 'works', [[0, '#0a1016'], [0.3, '#1c2c34'], [0.45, '#3a5048'], [0.52, '#6a7a5a'], [0.6, '#2a3a36'], [1, '#141c20']], { stars: 60 });
    lights(X, { sky: 0x6a8a8a, ground: 0x10161a, hemi: 0.7, dirI: 0.3, fog: 0x2a3a3a, fogD: 0.007 });
    ground(X, 400, 0x4a5868, { shine: 30, map: speckTex('icegrain', '#8a96b0', 0.25, 900, 3) });
    var bt = brickTex(); bt.repeat.set(6, 3);
    var bm = new T.MeshPhongMaterial({ map: bt, shininess: 4 });
    put(X.s, box(34, 14, 14, bm), -4, 7, -36);
    put(X.s, box(36, 0.8, 16, M(0x2a2a2a)), -4, 14.2, -36);
    var ct = brickTex(); var chim = cyl(1.6, 2.2, 34, new T.MeshPhongMaterial({ map: ct }), 12);
    put(X.s, chim, 6, 17, -38);
    smoke(X, 6, 34, -38, { n: 10, size: 7, rise: 18, drift: 8, opacity: 0.3, color: 0x9aa6a0, speed: 0.05 });
    for (var r = 0; r < 3; r++) for (var c = 0; c < 12; c++) {
      put(X.s, plane(1.2, 2, E(0xc8f0d0)), -19 + c * 2.7, 3 + r * 4, -28.9);
      if ((c + r) % 3 === 0) glow(X.s, -19 + c * 2.7, 3 + r * 4, -28.4, 3, 0xb8f0c8, 0.25);
    }
    var L = new T.PointLight(0xb8f0c8, 1.2, 40, 1.2); L.position.set(-4, 6, -26); X.s.add(L);
    // the outfall pipe and the open water
    var pipe = cyl(0.9, 0.9, 16, M(0x2a2c30, { shininess: 40 }), 12); pipe.rotation.x = Math.PI / 2;
    put(X.s, pipe, 10, 0.6, -22);
    var pool = mesh(new T.CircleGeometry(5, 24), new T.MeshPhongMaterial({ color: 0x06100e, shininess: 140, specular: 0x9ac0b0 }));
    pool.rotation.x = -Math.PI / 2; pool.scale.set(1.3, 1, 1); pool.position.set(11, 0.02, -12); X.s.add(pool);
    reflect(X, 11, -26, 6, 14, 0xb8f0c8, { opacity: 0.35 });
    [[-14, -27], [0, -27], [14, -27]].forEach(function (p) { lamp(X, p[0], 5, p[1], 0xd8f0c0, 1.2, 25, { glow: 3 }); });
    for (var s = 0; s < 5; s++) smoke(X, 8 + s * 2.2, 0.3, -10 + s * 1.2, { n: 5, size: 3, rise: 5, drift: 2, opacity: 0.22, color: 0xc8d0c8, speed: 0.06 });
    // the seam: a dark stripe running out across the ice
    var seam = plane(3.5, 120, new T.MeshPhongMaterial({ color: 0x1a2430, transparent: true, opacity: 0.8, shininess: 80 }));
    seam.rotation.x = -Math.PI / 2; seam.rotation.z = 0.5; seam.position.set(-10, 0.015, 30); X.s.add(seam);
    // fence posts
    for (var f = 0; f < 10; f++) put(X.s, cyl(0.07, 0.07, 1.4, M(0x2a2420), 5), -20 + f * 3, 0.7, -20);
    people(X, [{ x: 2, z: 6, h: 1.9, coat: 0x2a2a30, pose: 'stand', ry: Math.PI + 0.4, hair: 0x6a6a6a }, { x: 3.2, z: 6.8, h: 1.62, coat: 0x2c2c3a, pose: 'stand', ry: Math.PI + 0.2, bun: true }]);
    cam(X, 8, 4.5, 16, 0, 7, -30, 55, 0.15);
  };

  SCENES.chapel = function (X) {
    lights(X, { sky: 0x8a6a4a, ground: 0x1a100a, hemi: 0.45, dir: false, fog: 0x2a1a10, fogD: 0.025 });
    var canvasT = canvasTex('tentcanvas', 256, 256, function (g, w, h) {
      g.fillStyle = '#b08a58'; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 8; i++) { g.fillStyle = 'rgba(60,40,20,0.25)'; g.fillRect(i * 32, 0, 2, h); g.fillStyle = 'rgba(0,0,0,' + Math.random() * 0.08 + ')'; g.fillRect(i * 32 + 2, 0, 30, h); }
      for (var k = 0; k < 900; k++) { g.fillStyle = 'rgba(60,40,20,' + Math.random() * 0.12 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    }, true);
    canvasT.repeat.set(6, 1);
    var wallMat = new T.MeshPhongMaterial({ map: canvasT, side: T.BackSide, shininess: 2 });
    put(X.s, mesh(new T.CylinderGeometry(8, 8, 3.2, 28, 1, true), wallMat), 0, 1.6, 0);
    put(X.s, mesh(new T.ConeGeometry(8.1, 5, 28, 1, true), wallMat), 0, 5.7, 0);
    var floorT = planksTex('chapelfloor', '#4a3422', false); floorT.repeat.set(5, 5);
    var fl = plane(18, 18, new T.MeshPhongMaterial({ map: floorT })); fl.rotation.x = -Math.PI / 2; X.s.add(fl);
    // tiered stands of candle jars along the back of the tent
    var flames = [], jars = [];
    for (var t = 0; t < 5; t++) {
      var rad = 7.2 - t * 0.55, y = 0.35 + t * 0.42;
      for (var b2 = -1.2; b2 <= 1.2; b2 += 0.2) put(X.s, box(1.5, 0.08, 0.45, M(0x5a3e24)), Math.sin(b2) * rad, y - 0.06, -Math.cos(b2) * rad).rotation.y = -b2;
      for (var a = -1.2; a <= 1.2; a += 0.05) {
        var x = Math.sin(a) * rad + rr(-0.06, 0.06), z = -Math.cos(a) * rad + rr(-0.06, 0.06);
        jars.push([x, y, z]);
        flames.push(new T.Vector3(x, y + 0.16, z));
      }
    }
    var jm = new T.InstancedMesh(new T.CylinderGeometry(0.05, 0.05, 0.13, 6), new T.MeshPhongMaterial({ color: 0xd8b070, emissive: 0x6a3a10, transparent: true, opacity: 0.8 }), jars.length);
    var dm = new T.Object3D();
    jars.forEach(function (j, i) { dm.position.set(j[0], j[1] + 0.05, j[2]); dm.updateMatrix(); jm.setMatrixAt(i, dm.matrix); });
    X.s.add(jm);
    X.s.add(new T.Points(new T.BufferGeometry().setFromPoints(flames), new T.PointsMaterial({ size: 0.32, map: glowTex(), color: 0xffc860, transparent: true, depthWrite: false, blending: T.AdditiveBlending })));
    [[-4, 1.4, -5], [0, 1.6, -6.5], [4, 1.4, -5]].forEach(function (p2) {
      var L = new T.PointLight(0xffb050, 1.4, 12, 1.2); L.position.set(p2[0], p2[1], p2[2]); X.s.add(L);
      glow(X.s, p2[0], p2[1], p2[2] + 0.4, 5, 0xffa040, 0.35);
      var ph = rr(0, 9); X.upd.push(function (tt) { L.intensity = 1.4 * (0.88 + 0.12 * Math.sin(tt * 6 + ph)); });
    });
    // hanging lanterns from the roof
    [[-3, 3.4, -1], [3, 3.4, -1], [0, 3.8, 2.5]].forEach(function (p3) { put(X.s, cyl(0.004, 0.004, 1.6, M(0x222222), 3), p3[0], p3[1] + 0.8, p3[2]); lamp(X, p3[0], p3[1], p3[2], 0xffc070, 0.8, 7, { glow: 1.2 }); });
    // altar and an icon of Saint Ondine
    put(X.s, box(1.8, 0.95, 0.8, M(0x6a4a2a)), 0, 0.47, -5.6);
    put(X.s, box(1.9, 0.06, 0.9, M(0xe8e0d0)), 0, 0.97, -5.6);
    var icon = canvasTex('ondine', 128, 192, function (g) {
      g.fillStyle = '#2a3a4a'; g.fillRect(0, 0, 128, 192);
      g.fillStyle = '#d8b050'; g.beginPath(); g.arc(64, 60, 34, 0, 7); g.fill();
      g.fillStyle = '#e8d8c0'; g.beginPath(); g.ellipse(64, 64, 16, 20, 0, 0, 7); g.fill();
      g.fillStyle = '#4a6a8a'; g.beginPath(); g.moveTo(34, 184); g.lineTo(64, 84); g.lineTo(94, 184); g.fill();
      g.strokeStyle = '#a8d0e0'; g.lineWidth = 3; for (var i = 0; i < 4; i++) { g.beginPath(); g.moveTo(10, 150 + i * 10); g.bezierCurveTo(40, 140 + i * 10, 88, 160 + i * 10, 118, 150 + i * 10); g.stroke(); }
    });
    put(X.s, plane(0.9, 1.35, new T.MeshPhongMaterial({ map: icon, emissive: 0x2a2010 })), 0, 1.75, -6.1);
    lamp(X, -0.7, 1.2, -5.5, 0xffd080, 0.9, 6, { glow: 1.1 });
    lamp(X, 0.7, 1.2, -5.5, 0xffd080, 0.9, 6, { glow: 1.1 });
    // the trestle
    var wd = M(0x4a3420);
    put(X.s, box(0.1, 0.8, 0.8, wd), -1.2, 0.4, -1.8);
    put(X.s, box(0.1, 0.8, 0.8, wd), 1.2, 0.4, -1.8);
    put(X.s, box(2.8, 0.08, 0.9, wd), 0, 0.84, -1.8);
    if (X.v.body_cut) {
      var sheet = sph(1, M(0xeee8da)); sheet.scale.set(1.25, 0.22, 0.42); put(X.s, sheet, 0, 1.0, -1.8);
      var head = sph(0.16, M(0xeee8da)); put(X.s, head, -1.05, 1.08, -1.8);
      var peak = mesh(new T.ConeGeometry(0.14, 0.95, 7), M(0xeee8da)); put(X.s, peak, -0.55, 1.55, -1.85);
      lamp(X, -1.6, 1.05, -1.8, 0xffd080, 1, 5, { glow: 1.1 });
    }
    // the Deaconess on her stool
    put(X.s, cyl(0.2, 0.2, 0.5, M(0x3a2a1c), 6), -2.2, 0.25, -0.9);
    people(X, [{ x: -2.2, z: -0.9, h: 1.45, coat: 0x6e6a66, pose: 'sit', seat: 0.08, hat: 'hood', hatColor: 0x5a5856, ry: 0.9, long: true, face: true }]);
    cam(X, 2.2, 2.1, 4.2, -0.4, 1.2, -3.4, 58, 0.08);
  };

  SCENES.mending = function (X) {
    lights(X, { sky: 0x5a3a4a, ground: 0x100a0c, hemi: 0.3, dir: false, fog: 0x1a0e12, fogD: 0.05 });
    roomBox(X, 6, 3, 5, { wall: 0x3a2430, floor: 0x3a2a24 });
    var cols = [0x8a2a34, 0x2a3a6a, 0xa8904a, 0x3a5a3a, 0x6a4a6a, 0x5a4a3a, 0x7a3a2a, 0x2a4a5a];
    for (var r = 0; r < 2; r++) {
      put(X.s, cyl(0.02, 0.02, 5.6, M(0x5a4030), 5), 0, 2.6 - r * 0.2, -2 + r * 0.6).rotation.z = Math.PI / 2;
      for (var i = 0; i < 13; i++) {
        var coat = box(0.5, rr(0.9, 1.4), 0.12, M(pick(cols)));
        put(X.s, coat, -2.6 + i * 0.42 + rr(-0.05, 0.05), 2.1 - r * 0.2 - rr(0, 0.2), -2 + r * 0.6).rotation.y = rr(-0.3, 0.3);
      }
    }
    table(X, 0.6, -0.2, 1.4, 0.7, {});
    put(X.s, box(0.5, 0.3, 0.25, M(0x141414, { shininess: 50 })), 0.6, 0.93, -0.2);
    put(X.s, mesh(new T.TorusGeometry(0.12, 0.02, 5, 14), M(0xb0a070)), 0.9, 1.0, -0.2);
    for (var s = 0; s < 6; s++) put(X.s, cyl(0.04, 0.04, 0.08, M(pick(cols)), 8), 0.1 + s * 0.12, 0.83, 0.05);
    lamp(X, 0.2, 2.2, 0, 0xffc070, 1.5, 7, { glow: 1.8 });
    stove(X, 2.4, -1.6, { intensity: 1.1 });
    var marta = person({ h: 1.55, coat: 0x4a3a44, skin: 0xd0a890, hair: 0x9a8a80, bun: true, pose: 'sit', seat: 0.05, wide: 1.3, apron: 0xd8d0c0, long: false });
    put(X.s, marta, -0.3, 0, -0.2, 0.5);
    put(X.s, box(0.45, 0.45, 0.45, M(0x5a4030)), -0.3, 0.22, -0.3);
    cam(X, 0.4, 1.6, 3.2, 0, 1.2, -1, 58, 0.05);
  };

  SCENES.booth = function (X) {
    lights(X, { sky: 0x3a5a3a, ground: 0x08100a, hemi: 0.25, dir: false });
    roomBox(X, 3, 2.6, 2.6, { wall: 0x1e3a28, floor: 0x2a2620 });
    table(X, 0, -0.6, 1.5, 0.7, { color: 0x3a2a1a });
    put(X.s, box(0.35, 0.22, 0.4, M(0x2a2a2a, { shininess: 60 })), -0.35, 0.87, -0.6);
    put(X.s, cyl(0.015, 0.015, 0.3, M(0xb0a060), 5), -0.12, 1.02, -0.6).rotation.z = 0.6;
    for (var b = 0; b < 5; b++) put(X.s, box(0.3, 0.05, 0.4, M(pick([0x2a4a2a, 0x3a5a3a, 0x224030]))), 0.45, 0.8 + b * 0.05, -0.5);
    // shelves of green books
    for (var sh = 0; sh < 3; sh++) {
      put(X.s, box(2.6, 0.04, 0.3, M(0x3a2a1a)), 0, 1.3 + sh * 0.4, -1.15);
      for (var k = 0; k < 20; k++) put(X.s, box(0.1, 0.32, 0.24, M(pick([0x1e4a2a, 0x2a5a34, 0x16361e, 0x4a6a3a]))), -1.2 + k * 0.125, 1.48 + sh * 0.4, -1.15);
    }
    // green-shaded lamp
    var shade = mesh(new T.ConeGeometry(0.22, 0.14, 12, 1, true), M(0x1e6a3a, { side: T.DoubleSide, emissive: 0x0a2a14 }));
    put(X.s, shade, 0.4, 1.3, -0.5);
    put(X.s, cyl(0.01, 0.01, 0.5, M(0xb0a060), 4), 0.4, 1.05, -0.5);
    var L = new T.PointLight(0xe8f0b0, 1.8, 5, 1.3); L.position.set(0.4, 1.15, -0.4); X.s.add(L);
    glow(X.s, 0.4, 1.2, -0.45, 1.2, 0xe8f0a0, 0.6);
    // window with the night
    put(X.s, plane(0.8, 0.9, E(0x141c34)), 1.49, 1.6, 0.2).rotation.y = -Math.PI / 2;
    stove(X, -1.1, 0.8, { intensity: 0.6, ry: Math.PI / 2 });
    people(X, [{ x: 0, z: -0.95, h: 1.78, coat: 0x4a4a50, pose: 'sit', seat: 0.02, hair: 0x2a2420, long: false, wide: 0.85 }]);
    put(X.s, box(0.45, 0.45, 0.45, M(0x3a2a1a)), 0, 0.22, -1.05);
    cam(X, 0.2, 1.5, 1.2, 0, 1.1, -0.9, 62, 0.03);
  };

  SCENES.watch = function (X) {
    lights(X, { sky: 0x3a4a6a, ground: 0x0a0c10, hemi: 0.3, dir: false });
    var wallT = planksTex('watchplank', '#2e3444', true); wallT.repeat.set(3, 1);
    roomBox(X, 4, 2.6, 3.6, { wallMat: new T.MeshPhongMaterial({ map: wallT, side: T.BackSide }), floor: 0x2a2a30 });
    stove(X, 1.5, -1.3, { intensity: 1.4 });
    // bell
    var prof = [];
    for (var i = 0; i <= 10; i++) { var t = i / 10; prof.push(new T.Vector2(0.08 + Math.pow(t, 1.8) * 0.32, 0.5 - t * 0.5)); }
    var bell = mesh(new T.LatheGeometry(prof, 16), M(0xb08a3a, { shininess: 70, specular: 0xffe0a0, side: T.DoubleSide }));
    put(X.s, bell, -1.2, 1.85, -1.2);
    put(X.s, cyl(0.01, 0.01, 1.5, M(0x8a7a5a), 4), -1.2, 1.1, -1.2);
    // portrait of the Hearth-King
    var pt = canvasTex('portrait', 128, 160, function (g) {
      g.fillStyle = '#2a2230'; g.fillRect(0, 0, 128, 160);
      g.fillStyle = '#c8a888'; g.beginPath(); g.ellipse(64, 80, 30, 38, 0, 0, 7); g.fill();
      g.fillStyle = '#6a5040'; g.beginPath(); g.ellipse(64, 108, 26, 20, 0, 0, 7); g.fill();
      g.fillStyle = '#f0ece4'; g.fillRect(32, 34, 64, 18);
      g.fillStyle = '#2a1a14'; g.fillRect(50, 74, 8, 4); g.fillRect(70, 74, 8, 4);
    });
    put(X.s, box(0.62, 0.78, 0.04, M(0x8a6a30, { shininess: 40 })), 0.2, 1.7, -1.78);
    put(X.s, plane(0.52, 0.66, new T.MeshPhongMaterial({ map: pt })), 0.2, 1.7, -1.75);
    // cot and desk
    put(X.s, box(0.8, 0.35, 1.9, M(0x3a3a44)), -1.5, 0.3, 0.6);
    put(X.s, box(0.8, 0.1, 1.9, M(0x6a6a7a)), -1.5, 0.5, 0.6);
    table(X, 0.4, -0.9, 1.1, 0.6, {});
    book(X, 0.4, 0.82, -0.9, { color: 0x6a1a1a });
    lamp(X, 0.4, 1.95, -0.2, 0xffc070, 1.1, 6, { glow: 1.4 });
    people(X, [{ x: 0.3, z: 0.1, h: 1.8, coat: 0x26303e, pose: 'hands', hat: 'cap', hatColor: 0x1a2230, long: true, scarf: 0x7a7a80, ry: 0.2 }]);
    cam(X, 0.4, 1.6, 2.4, -0.2, 1.3, -1, 60, 0.04);
  };

  SCENES.under = function (X) {
    X.s.background = new T.Color(0x02100e);
    lights(X, { sky: 0x5a9a8a, ground: 0x020606, hemi: 0.5, dir: false, fog: 0x062420, fogD: 0.07 });
    // the underside of the ice
    var ceil = plane(90, 90, new T.MeshPhongMaterial({ color: 0x1e4a44, emissive: 0x0e2a26, side: T.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = 4.05; X.s.add(ceil);
    // gold light from the Chandelier coming through, far ahead
    var goldM = new T.MeshBasicMaterial({ color: 0xffc460, transparent: true, opacity: 0.85, fog: false });
    var gp = mesh(new T.CircleGeometry(6, 24), goldM); gp.rotation.x = Math.PI / 2; gp.position.set(-2, 4.0, -16); X.s.add(gp);
    glow(X.s, -2, 3.6, -16, 16, 0xffb850, 0.6).material.fog = false;
    var gL = new T.PointLight(0xffc060, 2.4, 22, 1.1); gL.position.set(-2, 3, -15); X.s.add(gL);
    // dancers' shadows across the gold
    var shadows = [];
    for (var s2 = 0; s2 < 12; s2++) {
      var sh = mesh(new T.CircleGeometry(0.55, 10), new T.MeshBasicMaterial({ color: 0x3a2a10, transparent: true, opacity: 0.65, fog: false }));
      sh.rotation.x = Math.PI / 2; sh.position.set(-2 + rr(-4, 4), 3.98, -16 + rr(-4, 4)); X.s.add(sh);
      shadows.push({ m: sh, x: sh.position.x, z: sh.position.z, ph: rr(0, 6) });
    }
    X.upd.push(function (t) { shadows.forEach(function (d) { d.m.position.x = d.x + Math.sin(t * 0.9 + d.ph) * 0.7; d.m.position.z = d.z + Math.cos(t * 0.9 + d.ph) * 0.5; }); });
    // candle ice: a forest of needles hanging from the ice
    var n = 1100;
    var geo = new T.ConeGeometry(0.06, 1, 5); geo.translate(0, -0.5, 0);
    var im = new T.InstancedMesh(geo, new T.MeshPhongMaterial({ color: 0xd8f4ee, emissive: 0x2a5a52, shininess: 100, specular: 0xffffff }), n);
    var dm = new T.Object3D();
    for (var i = 0; i < n; i++) {
      dm.position.set(rr(-16, 16), 4, rr(-26, 4));
      dm.scale.set(rr(0.6, 1.5), rr(0.4, 2.2), rr(0.6, 1.5));
      dm.rotation.set(rr(-0.04, 0.04), 0, rr(-0.04, 0.04));
      dm.updateMatrix(); im.setMatrixAt(i, dm.matrix);
    }
    X.s.add(im);
    // shafts of light falling from the gold
    for (var k = 0; k < 6; k++) {
      var shaft = mesh(new T.CylinderGeometry(0.4, 1.8, 7, 10, 1, true), new T.MeshBasicMaterial({ color: 0xd8c880, transparent: true, opacity: 0.06, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
      put(X.s, shaft, -2 + rr(-4, 4), 0.5, -16 + rr(-3, 3)).rotation.z = rr(-0.15, 0.15);
    }
    // the hole above you, and the rope running up to it
    var holeM = new T.MeshBasicMaterial({ color: 0xffe8b0, fog: false });
    put(X.s, plane(1.1, 1.1, holeM), 1.4, 4.0, 0.2).rotation.x = Math.PI / 2;
    glow(X.s, 1.4, 3.6, 0.2, 4.5, 0xffe0a0, 0.7).material.fog = false;
    var rope = new T.CatmullRomCurve3([new T.Vector3(1.4, 4.0, 0.2), new T.Vector3(1.1, 2.6, -0.3), new T.Vector3(0.5, 1.6, -1.1), new T.Vector3(0.1, 1.2, -1.6)]);
    X.s.add(mesh(new T.TubeGeometry(rope, 24, 0.025, 5), M(0xb09a6a)));
    // the green lantern
    lamp(X, -0.3, 1.0, -1.6, 0x7ae0a8, 1.8, 9, { glow: 2.2, bodyColor: 0x9af0c0 });
    // far off in the murk, a small hand against the ice
    var hnd = handModel(M(0xb8ccc8, { emissive: 0x1a3a34 }), 5);
    hnd.rotation.x = Math.PI / 2; put(X.s, hnd, 7, 3.75, -12);
    glow(X.s, 7, 3.5, -12, 2.4, 0xa8e0d8, 0.35);
    snow(X, 350, [-8, 8, -2, 4, -14, 2], { up: true, size: 0.06, color: 0xc8f0e8, opacity: 0.55, speed: 0.6 });
    cam(X, 0, 0.6, 3, 0, 2.6, -12, 64, 0.15);
  };

  SCENES.break = function (X) {
    skyBg(X, 'break', [[0, '#080c1c'], [0.55, '#1a2444'], [0.85, '#3e3a5a'], [1, '#7a5060']], { stars: 80 });
    lights(X, { sky: 0x4a5a8a, ground: 0x05060c, hemi: 0.45, dirI: 0.25, fog: 0x141a2a, fogD: 0.012 });
    water(X, 300, 0x080c14, { shine: 110, specular: 0x6a7aa0 });
    city(X, -80, -160, { n: 120, spread: 50, hill: 22 });
    var pav = pavilion(X, 6, -30, { tilt: 0.22, tiltX: -0.08, sink: -2.2, big: true });
    var under = new T.PointLight(0xffb050, 3, 30, 1.2); under.position.set(6, 0.5, -24); X.s.add(under);
    glow(X.s, 6, 0.2, -24, 26, 0xffa040, 0.3);
    for (var i = 0; i < 26; i++) {
      var fx = rr(-40, 40), fz = rr(-60, 10);
      if (Math.abs(fx - 6) < 12 && Math.abs(fz + 30) < 10) continue;
      floe(X, fx, fz, rr(1.5, 5));
      if (R() < 0.35) hut(X, fx, fz, rr(0, 6), { smoke: false, litChance: 0.8 });
    }
    X.upd.push(function (t) { pav.rotation.z = 0.22 + Math.sin(t * 0.3) * 0.015; });
    // watchers on the shore
    for (var p = 0; p < 9; p++) people(X, [{ x: rr(-8, 8), z: rr(8, 12), h: rr(1.5, 1.85), coat: pick([0x1a1a22, 0x2a2020, 0x22262e]), ry: Math.PI + rr(-0.3, 0.3), hat: pick([null, 'cap', 'hood']) }]);
    put(X.s, box(40, 1, 8, M(0x1a1818)), 0, -0.2, 13);
    cam(X, 0, 3.4, 20, 4, 2, -30, 50, 0.15);
  };

  SCENES.shore = function (X) {
    skyBg(X, 'shore', [[0, '#1a2440'], [0.5, '#3e4468'], [0.78, '#8a6a7a'], [0.92, '#d89a80'], [1, '#e8b88a']], { stars: 20 });
    lights(X, { sky: 0xb0a8c8, ground: 0x2a2028, hemi: 0.85, dirColor: 0xffc0a0, dirI: 0.5, dx: 40, dy: 10, dz: -60, fog: 0x4a4a68, fogD: 0.006 });
    water(X, 400, 0x2a3450, { shine: 80, specular: 0xd8a890, y: -0.3 });
    ground(X, 60, 0x4a4248, { bumps: 0.4, shine: 6, y: -0.2 }).position.z = 22;
    for (var i = 0; i < 18; i++) floe(X, rr(-50, 50), rr(-80, -5), rr(1.5, 4.5), { y: -0.15 });
    city(X, -90, -30, { n: 90, spread: 30, hill: 20, lit: 0.3 });
    [[-6, 6], [3, 9], [9, 4]].forEach(function (f) { fire(X, f[0], f[1], 1); });
    var groups = [];
    for (var p = 0; p < 20; p++) {
      var f = pick([[-6, 6], [3, 9], [9, 4]]);
      var a = rr(0, Math.PI * 2), d = rr(1.4, 2.6);
      groups.push({ x: f[0] + Math.cos(a) * d, z: f[1] + Math.sin(a) * d, ry: -a - Math.PI / 2, pose: R() < 0.5 ? 'sit' : 'stand', seat: 0, h: rr(1.3, 1.85), coat: pick([0x5a3a3a, 0x3a3a4a, 0x6a5a3a, 0x2a2a2a]), wide: 1.3, hat: pick([null, 'hood', 'cap']) });
    }
    people(X, groups);
    // what they carried off the ice
    for (var b = 0; b < 8; b++) pick([sledge, crates, barrel])(X, rr(-10, 12), rr(10, 16), rr(0, 6));
    crowd(X, 16, -12, 12, 12, 18, { lanterns: 0.25 });
    var ch = new T.Group(), stoneM = M(0x3a3640);
    put(ch, box(14, 7, 6, stoneM), 0, 3.5, 0); put(ch, box(15, 0.6, 7, M(0x2a2630)), 0, 7.2, 0);
    for (var w = 0; w < 6; w++) { put(ch, plane(1, 1.8, E(0xffc070)), -5 + w * 2, 3, 3.02); }
    put(X.s, ch, 12, 0, 30, -0.4);
    cam(X, 4, 5, 22, -2, 1, -10, 52, 0.15);
  };

  SCENES.dawn = function (X) {
    skyBg(X, 'dawn', [[0, '#2a3a60'], [0.4, '#6a6a8e'], [0.7, '#e0a080'], [0.9, '#ffd8a0'], [1, '#fff0c8']], { clouds: [{ x: 0.3, y: 0.45, w: 0.5, h: 0.08, r: 0.18, n: 16, c: 'rgba(250,190,150,0.35)' }, { x: 0.75, y: 0.38, w: 0.4, h: 0.06, r: 0.15, n: 12, c: 'rgba(250,200,160,0.3)' }] });
    lights(X, { sky: 0xffd0b0, ground: 0x3a2a3a, hemi: 0.7, dirColor: 0xffd0a0, dirI: 0.7, dx: 0, dy: 5, dz: -80, fog: 0xd8a890, fogD: 0.006 });
    water(X, 500, 0x4a5070, { shine: 120, specular: 0xffd8a0, y: -0.2 });
    var sun = sph(9, E(0xfff0c8, { fog: false }), 20); put(X.s, sun, 0, 3, -220);
    glow(X.s, 0, 5, -210, 90, 0xffd8a0, 0.7);
    for (var k = 0; k < 40; k++) put(X.s, plane(rr(1, 4), 0.15, E(0xffe0a8, { transparent: true, opacity: 0.6 })), rr(-3, 3), -0.15, -20 - k * 4.5).rotation.x = -Math.PI / 2;
    for (var i = 0; i < 14; i++) floe(X, rr(-40, 40), rr(-120, -10), rr(1.5, 4), { y: -0.1, color: 0xd8c8c8 });
    ground(X, 40, 0x5a4a50, { bumps: 0.3, y: -0.1 }).position.z = 26;
    people(X, [{ x: -0.8, z: 8, h: 1.9, coat: 0x2a2a30, pose: 'stand', ry: Math.PI, hair: 0x6a6a6a }, { x: 0.5, z: 8.3, h: 1.62, coat: 0x2c2c3a, pose: 'stand', ry: Math.PI, bun: true }]);
    // gulls
    for (var g = 0; g < 6; g++) {
      var gull = new T.Group();
      var w1 = box(0.6, 0.02, 0.15, E(0x2a2a30)); w1.position.x = -0.28; w1.rotation.z = 0.3; gull.add(w1);
      var w2 = box(0.6, 0.02, 0.15, E(0x2a2a30)); w2.position.x = 0.28; w2.rotation.z = -0.3; gull.add(w2);
      put(X.s, gull, rr(-20, 20), rr(8, 18), rr(-60, -30));
    }
    cam(X, 0, 2.2, 15, 0, 3, -60, 50, 0.12);
  };

  SCENES.black = function (X) {
    X.s.background = new T.Color(0x040306);
    lights(X, { sky: 0x1a1030, ground: 0x000000, hemi: 0.2, dir: false });
    snow(X, 200, [-6, 6, -3, 3, -6, 2], { size: 0.05, color: 0x6a5a8a, opacity: 0.4, speed: 0.3 });
    cam(X, 0, 0, 5, 0, 0, 0, 50, 0.05);
  };

  SCENES.fisher = function (X) {
    skyBg(X, 'fisher', [[0, '#080a18'], [0.6, '#181a34'], [1, '#2a2440']], { stars: 260 });
    lights(X, { sky: 0x4a5a8a, ground: 0x0a0c14, hemi: 0.4, dirI: 0.2, fog: 0x141628, fogD: 0.03 });
    ground(X, 200, 0x7a86a4, { shine: 20, map: speckTex('snowgrain', '#c8d0e0', 0.2, 1200, 2) });
    // windbreak
    [[-1.4, -1], [0, -1.6], [1.4, -1]].forEach(function (p) { put(X.s, cyl(0.04, 0.04, 2.2, M(0x3a2a1c), 5), p[0], 1.1, p[1]); });
    var cloth = plane(3, 1.9, M(0xc8b890, { side: T.DoubleSide }));
    put(X.s, cloth, 0, 1.05, -1.3).rotation.y = 0;
    signBoard(X, 'PLEASE DO NOT DISTURB\nTHE MAGISTRATE', 1.6, 0.55, -0.4, 1.1, 0.6, { size: 60, ry: -0.5 });
    // the hole
    var hole = mesh(new T.CircleGeometry(0.35, 16), new T.MeshPhongMaterial({ color: 0x020408, shininess: 150, specular: 0x6a8aa0 }));
    hole.rotation.x = -Math.PI / 2; hole.position.set(0, 0.015, 0.4); X.s.add(hole);
    // the old man on his stool, three coats, rod
    put(X.s, cyl(0.2, 0.2, 0.45, M(0x3a2a1c), 6), -0.4, 0.22, 0);
    people(X, [{ x: -0.4, z: 0, h: 1.72, coat: 0x4a4038, pose: 'sit', seat: 0, wide: 1.45, hat: 'hat', hatColor: 0x2a2420, ry: 0.4, long: false, beard: 0xb0b0a8 }]);
    var rod = cyl(0.012, 0.008, 1.3, M(0x6a5030), 4); put(X.s, rod, -0.05, 0.75, 0.2).rotation.x = 0.9;
    var line = new T.BufferGeometry().setFromPoints([new T.Vector3(-0.05, 1.2, 0.72), new T.Vector3(0, 0.02, 0.4)]);
    X.s.add(new T.Line(line, new T.LineBasicMaterial({ color: 0xc8c8c8 })));
    // the row of dead fish
    for (var f = 0; f < 6; f++) { var fish = sph(0.1, M(0xc8ccd0, { shininess: 80, specular: 0xffffff }), 8); fish.scale.set(2.2, 0.35, 0.7); put(X.s, fish, 0.7 + f * 0.05, 0.04, 0.9 + f * 0.25, 0.3); }
    lamp(X, 0.8, 0.2, 0.1, 0xffc070, 1.4, 7, { glow: 1.6 });
    // the red flag the Warden left
    put(X.s, cyl(0.015, 0.015, 1, M(0x5a4030), 4), 1.3, 0.5, -0.9).rotation.z = 0.3;
    put(X.s, plane(0.3, 0.2, M(0xa82a2a, { side: T.DoubleSide })), 1.5, 0.95, -0.9);
    // other holes, other flags, far off
    [[-4, -4, 0xc03030], [3.5, -6, 0x2a5aa8], [-7, -9, 0xc8b050], [6, -12, 0xc03030]].forEach(function (fh) { fishHole(X, fh[0], fh[1], { color: fh[2] }); });
    dryingRack(X, -2.6, -2.4, 0.4); sledge(X, 2.4, 1.6, -0.7, { load: false }); snowbank(X, -3, 2, 1.2); snowbank(X, 3.5, -2.5, 1.6);
    people(X, [{ x: -4.4, z: -4.3, h: 1.6, coat: 0x3a3a4a, pose: 'sit', seat: 0, hat: 'fur', ry: 0.5 }, { x: 3.9, z: -6.4, h: 1.7, coat: 0x4a3a2a, pose: 'hands', hat: 'hood', ry: -0.6 }]);
    // the Glass behind
    for (var h = 0; h < 12; h++) hut(X, rr(-20, 20), rr(-40, -22), rr(0, 6), { smoke: false });
    glow(X.s, 0, 5, -40, 30, 0xffa050, 0.25);
    snow(X, 400, [-6, 6, 0, 6, -6, 4], { size: 0.06 });
    cam(X, 1.2, 1.6, 3.4, -0.2, 0.6, -0.4, 55, 0.05);
  };

  SCENES.bath = function (X) {
    lights(X, { sky: 0x6a4a3a, ground: 0x100806, hemi: 0.3, dir: false, fog: 0x2a1c16, fogD: 0.05 });
    var lt = logTex(); lt.repeat.set(3, 3);
    roomBox(X, 6, 3, 5, { wallMat: new T.MeshPhongMaterial({ map: lt, side: T.BackSide }), floor: 0x3a2a1e });
    var wood = M(0x7a5a3a);
    for (var b = 0; b < 3; b++) put(X.s, box(5.6, 0.1, 0.7, wood), 0, 0.45 + b * 0.5, -2 + b * 0.55 - 1.1 + 0.9);
    for (var s2 = 0; s2 < 3; s2++) put(X.s, box(5.6, 0.45 + s2 * 0.5, 0.1, M(0x5a3e28)), 0, (0.45 + s2 * 0.5) / 2, -1.9 + s2 * 0.55 - 1.1 + 1.2);
    // the stove of stones
    put(X.s, box(0.9, 0.8, 0.8, M(0x1a1616, { shininess: 30 })), 2.3, 0.4, 1.2);
    for (var st = 0; st < 14; st++) put(X.s, sph(0.12, M(pick([0x3a3634, 0x4a4442, 0x2a2624])), 6), 2.3 + rr(-0.3, 0.3), 0.9 + rr(0, 0.15), 1.2 + rr(-0.3, 0.3));
    glow(X.s, 2.3, 0.5, 1.7, 2, 0xff7a2a, 0.6);
    var L = new T.PointLight(0xff9050, 1.8, 8, 1.2); L.position.set(2.2, 1, 1.5); X.s.add(L);
    var L2 = new T.PointLight(0xffc080, 0.8, 8, 1.2); L2.position.set(-1, 2.5, 0.5); X.s.add(L2);
    // four in towels on the benches, and Ma Saari by the stove
    var skin = [0xd8b09a, 0xe0b8a0, 0xc09080, 0xd0a890];
    [[-1.8, -1.2, 1], [-0.4, -0.65, 0], [1, -1.2, 2], [-1.1, -0.1, 3]].forEach(function (p, i) {
      var pr = person({ h: [1.75, 1.7, 1.95, 1.65][i], coat: skin[i], skin: skin[i], legs: skin[i], pose: 'sit', seat: 0.02, long: false, wide: i === 2 ? 1.4 : 1, hair: [0xd8d8d8, 0xa06030, 0x8a8a8a, 0x8a2a1a][i], beard: i === 2 ? 0xc8c8c8 : null });
      put(X.s, pr, p[0], 0.45 + (p[2] % 3) * 0, p[1], 0);
      put(X.s, cyl(0.28, 0.3, 0.3, M(0xe8e4dc), 10), p[0], 0.95, p[1]);
    });
    people(X, [{ x: 2.2, z: 2.2, h: 1.5, coat: 0xe0dccc, pose: 'sit', seat: 0.05, hair: 0xd8d4cc, bun: true, ry: -2.4, long: false, wide: 1.1 }]);
    for (var k = 0; k < 4; k++) smoke(X, rr(-2, 2.4), 0.8, rr(-1, 1.5), { n: 6, size: 3, rise: 2.4, drift: 0.8, opacity: 0.12, color: 0xd8ccc0, speed: 0.07 });
    cam(X, -0.2, 1.6, 2.6, 0, 1.1, -1, 62, 0.05);
  };

  SCENES.gull = function (X) {
    skyBg(X, 'gullsky', [[0, '#0a0c1c'], [1, '#2a2440']], { stars: 80 });
    lights(X, { sky: 0x4a5a8a, ground: 0x0a0c14, hemi: 0.35, dirI: 0.15, fog: 0x1a1628, fogD: 0.05 });
    ground(X, 100, 0x8a90a8, { shine: 16, map: speckTex('snowgrain', '#c8d0e0', 0.2, 1200, 2) });
    // Needle Row: huts either side, sailcloth over
    for (var i = 0; i < 6; i++) { hut(X, -3.2, -2 - i * 3.4, Math.PI / 2, { smoke: false }); hut(X, 3.4, -1 - i * 3.4, -Math.PI / 2, { smoke: false }); }
    var sail = plane(8, 22, M(0xa89a7a, { side: T.DoubleSide, transparent: true, opacity: 0.85 })); sail.rotation.x = Math.PI / 2; sail.position.set(0, 3.4, -9); X.s.add(sail);
    lanternString(X, new T.Vector3(-3, 3, -3), new T.Vector3(3, 3, -12), 0.5, 10, [0xffcf7a, 0xff9a6a]);
    // the brazier
    put(X.s, cyl(0.32, 0.3, 0.75, M(0x3a2a24, { shininess: 20 })), 0.6, 0.37, 0.4);
    for (var h = 0; h < 10; h++) { var a = (h / 10) * Math.PI * 2; put(X.s, plane(0.06, 0.06, E(0xffa040)), 0.6 + Math.cos(a) * 0.31, 0.3 + (h % 2) * 0.2, 0.4 + Math.sin(a) * 0.31).rotation.y = -a + Math.PI / 2; }
    put(X.s, cyl(0.3, 0.3, 0.04, E(0xff6a20)), 0.6, 0.76, 0.4);
    for (var c = 0; c < 9; c++) put(X.s, sph(0.035, M(0x5a3020), 6), 0.6 + rr(-0.15, 0.15), 0.8, 0.4 + rr(-0.15, 0.15));
    glow(X.s, 0.6, 0.9, 0.4, 2.6, 0xff6a20, 0.8);
    var L = new T.PointLight(0xff7a30, 2, 7, 1.3); L.position.set(0.6, 1.1, 0.6); X.s.add(L);
    X.upd.push(function (t) { L.intensity = 2 * (0.85 + 0.15 * Math.sin(t * 10) * Math.sin(t * 3.3)); });
    snow(X, 120, [0.3, 0.9, 0.8, 3, 0.2, 0.6], { up: true, size: 0.05, color: 0xffa040, opacity: 0.9, additive: true, speed: 1.5 });
    crowd(X, 9, -1.6, 1.8, -12, -3, { lanterns: 0.3 });
    stall(X, -1.6, -6, Math.PI / 2, { goods: 'jars', light: false });
    // Gull on his crate, cap and the constable's scarf
    put(X.s, box(0.45, 0.4, 0.4, M(0x5a4030)), -0.1, 0.2, 0.5);
    people(X, [{ x: -0.1, z: 0.5, h: 1.3, coat: 0x3a3228, pose: 'sit', seat: 0.02, hat: 'cap', hatColor: 0x2a2420, scarf: 0x7a7a80, ry: 0.6, long: false }]);
    cam(X, 0.9, 1.4, 3.4, 0.2, 0.7, 0, 55, 0.05);
  };

  SCENES.bench = function (X) {
    skyBg(X, 'benchsky', [[0, '#080a1a'], [0.5, '#1a1a3e'], [0.85, '#3a2a4e'], [1, '#5a3a50']], { stars: 280 });
    lights(X, { sky: 0x4a5a8a, ground: 0x0a0c14, hemi: 0.45, dirI: 0.2, fog: 0x1a1830, fogD: 0.012 });
    ground(X, 300, 0x7a86a4, { shine: 20, map: speckTex('snowgrain', '#c8d0e0', 0.2, 1200, 2) });
    // the old church pew, and a tall man sitting on it, seen from behind
    var pew = new T.Group(), pm = M(0x4a3424);
    put(pew, box(2.2, 0.08, 0.5, pm), 0, 0.46, 0);
    put(pew, box(2.2, 0.8, 0.07, pm), 0, 0.9, -0.24);
    put(pew, box(0.08, 1.1, 0.55, pm), -1.1, 0.55, 0);
    put(pew, box(0.08, 1.1, 0.55, pm), 1.1, 0.55, 0);
    put(X.s, pew, 0, 0, 0, Math.PI);
    people(X, [{ x: 0.3, z: 0.05, h: 1.9, coat: 0x2a2a30, pose: 'sit', seat: 0, hair: 0x6a6a6a, ry: Math.PI, long: false }]);
    lanternPole(X, -1.6, 0.2, 2.2, true);
    // the town ahead
    pavilion(X, 4, -40, { light: false });
    glow(X.s, 4, 6, -34, 34, 0xffa050, 0.3);
    for (var i = 0; i < 30; i++) hut(X, rr(-30, 30), rr(-55, -20), rr(0, 6), {});
    lanternString(X, new T.Vector3(-14, 4, -18), new T.Vector3(10, 4.5, -16), 1.4, 20, [0xffcf7a, 0xff9a6a, 0xf4e0a0]);
    crowd(X, 12, -10, 12, -19, -12, { lanterns: 0.3 });
    path(X, [[0, 2], [1.5, -8], [3, -18]], 1.6);
    snowbank(X, -2.4, 0.8, 1); snowbank(X, 2.6, -1, 1.3);
    snow(X, 400, [-8, 8, 0, 8, -10, 4], { size: 0.07 });
    cam(X, 0.2, 1.9, 3.4, 1, 1.4, -30, 50, 0.08);
  };

  SCENES.kitchen = function (X) {
    lights(X, { sky: 0xa87a5a, ground: 0x1a100a, hemi: 0.45, dir: false, fog: 0x2a1a12, fogD: 0.05 });
    var tt = canvasTex('tiles', 128, 128, function (g) { for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#6a4a30' : '#5a3a24'; g.fillRect(x * 16, y * 16, 16, 16); } }, true);
    tt.repeat.set(4, 4);
    roomBox(X, 4.6, 2.6, 4, { wall: 0x7a5a3e, floorMat: new T.MeshPhongMaterial({ map: tt }) });
    // window with the dusk and the far lights of the Glass
    var wt = canvasTex('duskwin', 256, 256, function (g) {
      var gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#2a2a5a'); gr.addColorStop(0.55, '#c07a6a'); gr.addColorStop(0.62, '#3a3a5a'); gr.addColorStop(1, '#2a3048');
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      for (var i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,200,120,' + (0.5 + Math.random() * 0.5) + ')'; g.fillRect(90 + Math.random() * 90, 150 + Math.random() * 14, 2, 2); }
      g.fillStyle = '#2a1a10'; g.fillRect(124, 0, 8, 256); g.fillRect(0, 124, 256, 8);
    });
    put(X.s, plane(1.4, 1.3, new T.MeshBasicMaterial({ map: wt })), 0.3, 1.5, -1.98);
    glow(X.s, 0.3, 1.5, -1.8, 3, 0xd08a6a, 0.3);
    // the rack of thaw-cakes by the window
    put(X.s, box(1.2, 0.04, 0.35, M(0x3a2a1a)), -1.2, 1.1, -1.75);
    for (var c = 0; c < 8; c++) put(X.s, cyl(0.07, 0.07, 0.03, M(0xd89a3a, { shininess: 60 }), 10), -1.7 + c * 0.14, 1.14, -1.75);
    // the table, two plates, two cups, the apron-string knots
    table(X, 0, 0.2, 1.1, 0.8, { h: 0.62, color: 0x6a4a2a });
    [[-0.28, 0.2], [0.28, 0.2]].forEach(function (p) { put(X.s, cyl(0.12, 0.1, 0.02, M(0xe8e0d0, { shininess: 40 }), 14), p[0], 0.66, p[1]); put(X.s, cyl(0.04, 0.035, 0.07, M(0xe8e0d0), 10), p[0] + 0.18, 0.69, p[1] - 0.15); });
    var knot = new T.CatmullRomCurve3([new T.Vector3(-0.1, 0.66, 0.3), new T.Vector3(0, 0.68, 0.4), new T.Vector3(0.1, 0.66, 0.32), new T.Vector3(0.02, 0.67, 0.24), new T.Vector3(-0.05, 0.68, 0.36), new T.Vector3(0.12, 0.66, 0.45)]);
    X.s.add(mesh(new T.TubeGeometry(knot, 30, 0.008, 4), M(0xf0ece4)));
    // the range and the kettle
    put(X.s, box(0.9, 0.85, 0.6, M(0x2a2420, { shininess: 30 })), 1.7, 0.43, -1.6);
    var kettle = sph(0.16, M(0x6a4a2a, { shininess: 50 })); kettle.scale.y = 0.8; put(X.s, kettle, 1.6, 0.98, -1.6);
    smoke(X, 1.72, 1.1, -1.55, { n: 4, size: 0.4, rise: 0.8, opacity: 0.25 });
    lamp(X, 0, 2.15, 0, 0xffc890, 1.4, 7, { glow: 2 });
    // your mother at the window, her back to you
    people(X, [{ x: 0.3, z: -1.45, h: 1.62, coat: 0x6a6a70, skirt: 0x6a6a70, apron: 0xe0d8c8, hair: 0x4a3020, bun: true, pose: 'stand', ry: Math.PI, long: false }]);
    cam(X, -0.6, 1.25, 2.1, 0.1, 1.2, -1.6, 60, 0.04);
  };

  // ---------------------------------------------------------------- close-ups (semi-décors)
  // Held for the length of a passage: an object, a hand, a page.
  function vig(X, o) {
    X.s.background = new T.Color(o.bg || 0x07080c);
    X.s.add(new T.HemisphereLight(o.sky || 0x5a5a7a, o.ground || 0x0a0808, o.hemi == null ? 0.35 : o.hemi));
    if (o.fog) X.s.fog = new T.FogExp2(o.fog, o.fogD || 0.08);
  }
  function scrawlTex(key, o) {
    o = o || {};
    return canvasTex(key, o.w || 512, o.h || 512, function (g, w, h) {
      g.fillStyle = o.paper || '#e6dcc4'; g.fillRect(0, 0, w, h);
      for (var k = 0; k < 900; k++) { g.fillStyle = 'rgba(90,60,20,' + Math.random() * 0.05 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 1 + Math.random() * 3); }
      if (o.rule) { g.strokeStyle = 'rgba(80,110,150,0.25)'; for (var y = 60; y < h; y += 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }
      g.fillStyle = o.ink || '#1e1a2a';
      var y0 = o.top || 70;
      if (o.head) { g.font = 'bold ' + (o.headSize || 30) + 'px Georgia, serif'; g.textAlign = 'left'; g.fillText(o.head, 36, y0); y0 += 44; }
      g.strokeStyle = o.ink || '#1e1a2a'; g.lineWidth = o.lw || 2;
      (o.lines || []).forEach(function (ln) {
        if (typeof ln === 'string') { g.font = 'italic ' + (o.size || 22) + 'px Georgia, serif'; g.fillText(ln, 36, y0); y0 += 26; return; }
      });
      for (var l = 0; l < (o.scribble || 0); l++) {
        var x = 36, yy = y0 + l * 26; if (yy > h - 30) break;
        var end = w - 40 - Math.random() * (l % 5 === 4 ? w * 0.5 : 60);
        g.beginPath(); g.moveTo(x, yy);
        while (x < end) { var st = 6 + Math.random() * 10; g.quadraticCurveTo(x + st / 2, yy - 8 - Math.random() * 6, x + st, yy + (Math.random() - 0.5) * 3); x += st; if (Math.random() < 0.12) { x += 8; g.moveTo(x, yy); } }
        g.stroke();
      }
      if (o.draw) o.draw(g, w, h);
    });
  }
  function paperSheet(X, tex, w, h, x, y, z, rx, rz) {
    var geo = new T.PlaneGeometry(w, h, 8, 8), p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 3.1) * 0.006 + Math.cos(p.getY(i) * 2.3) * 0.005);
    geo.computeVertexNormals();
    var m = mesh(geo, new T.MeshPhongMaterial({ map: tex, shininess: 6, side: T.DoubleSide }));
    m.rotation.x = rx == null ? -Math.PI / 2 : rx; m.rotation.z = rz || 0;
    put(X.s, m, x, y, z);
    return m;
  }
  function iceSheetTex() {
    return canvasTex('icecracks', 512, 512, function (g, w, h) {
      g.fillStyle = '#35505e'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(220,240,250,0.35)'; g.lineWidth = 1;
      for (var i = 0; i < 40; i++) { g.beginPath(); var x0 = Math.random() * w, y0 = Math.random() * h; g.moveTo(x0, y0); for (var k = 0; k < 5; k++) { x0 += (Math.random() - 0.5) * 80; y0 += (Math.random() - 0.5) * 80; g.lineTo(x0, y0); } g.stroke(); }
      for (var j = 0; j < 300; j++) { g.fillStyle = 'rgba(230,245,255,' + Math.random() * 0.5 + ')'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, Math.random() * 2.5, 0, 7); g.fill(); }
    }, true);
  }
  function woodTable(X, w, d, color) {
    var t = planksTex('vigtable' + (color || ''), color || '#4a3222', false); t.repeat.set(1.5, 1.5);
    var tb = plane(w, d, new T.MeshPhongMaterial({ map: t, shininess: 14 })); tb.rotation.x = -Math.PI / 2; X.s.add(tb);
    return tb;
  }
  function fingersCurled(mat, s) {
    // a closed fist: palm block and four curled fingers, a thumb across
    var g = new T.Group();
    put(g, box(0.09 * s, 0.1 * s, 0.05 * s, mat), 0, 0, 0);
    for (var i = 0; i < 4; i++) { var f = cyl(0.011 * s, 0.011 * s, 0.05 * s, mat, 6); f.rotation.z = Math.PI / 2; put(g, f, 0, 0.035 * s - i * 0.022 * s, 0.035 * s); }
    var th = cyl(0.012 * s, 0.011 * s, 0.06 * s, mat, 6); th.rotation.x = Math.PI / 2; th.rotation.z = 0.5; put(g, th, 0.03 * s, 0.03 * s, 0.03 * s);
    return g;
  }

  SCENES.v_hand = function (X) {
    vig(X, { bg: 0x03060a, sky: 0x5a7a9a, hemi: 0.35 });
    var top = new T.PointLight(0xffd8a0, 0.9, 5, 1.5); top.position.set(0.6, 1.4, 0.6); X.s.add(top);
    var cold = new T.PointLight(0x5a9ac0, 0.9, 3, 1.2); cold.position.set(0, -0.8, 0); X.s.add(cold);
    put(X.s, plane(8, 8, M(0x02050a)), 0, -1.2, 0).rotation.x = -Math.PI / 2;
    var tex = iceSheetTex(); tex.repeat.set(1.2, 1.2);
    var ice = plane(6, 6, new T.MeshPhongMaterial({ color: 0x4a6878, transparent: true, opacity: 0.42, shininess: 100, specular: 0xb0a080, map: tex, depthWrite: false }));
    ice.rotation.x = -Math.PI / 2; X.s.add(ice);
    var skin = M(0xa8a4a8, { emissive: 0x10161e });
    var hand = hand2(skin, 4, 0.05, 0.25); hand.rotation.x = -Math.PI / 2; hand.rotation.z = 0.25; put(X.s, hand, 0, -0.07, 0);
    var sleeve = cyl(0.15, 0.16, 1.4, M(0x2e2a26), 8); sleeve.rotation.x = 0.9; put(X.s, sleeve, -0.08, -0.55, -0.62);
    // split knuckles
    [[-0.07, 0.19], [-0.02, 0.21]].forEach(function (k) { put(X.s, box(0.03, 0.01, 0.012, E(0x5a1a1a)), k[0], -0.02, -k[1] + 0.12); });
    for (var b = 0; b < 40; b++) put(X.s, sph(rr(0.005, 0.02), M(0xdfeaf2, { emissive: 0x2a3a44 }), 5), rr(-1, 1), rr(-0.04, 0.02), rr(-1, 1));
    glow(X.s, 0.9, 0.3, -0.6, 0.9, 0xffc890, 0.25);
    snow(X, 60, [-1, 1, -0.9, -0.05, -1, 1], { up: true, size: 0.02, color: 0xa8c8e0, opacity: 0.5, speed: 0.1 });
    cam(X, 0.15, 1.05, 0.55, 0, -0.08, -0.02, 50, 0.02);
  };

  SCENES.v_fist = function (X) {
    vig(X, { bg: 0x0a0806, sky: 0x8a6a4a, hemi: 0.3 });
    var L = new T.PointLight(0xffc880, 0.8, 4, 1.5); L.position.set(0.7, 0.9, 0.5); X.s.add(L);
    var sheet = plane(3, 3, M(0xb8b0a0, { shininess: 4 })); sheet.rotation.x = -Math.PI / 2; X.s.add(sheet);
    for (var f = 0; f < 6; f++) { var fold = box(3, 0.02, 0.05, M(0xd8d0c0)); put(X.s, fold, 0, 0.005, -1 + f * 0.4).rotation.y = rr(-0.1, 0.1); }
    var skin = M(0xb8b4b4, { emissive: 0x12161c });
    var fist = hand2(skin, 3.6, 1.25, 0.02); fist.rotation.set(-Math.PI / 2, 0, 1.2); put(X.s, fist, 0, 0.1, 0);
    var wrist = cyl(0.11, 0.13, 0.9, M(0x2e2a26), 8); wrist.rotation.z = Math.PI / 2 - 0.4; wrist.rotation.y = 0.3; put(X.s, wrist, -0.52, 0.12, -0.2);
    // the grey rotten ice, crumbling out between the fingers
    var rot = new T.MeshPhongMaterial({ color: 0x8a949a, transparent: true, opacity: 0.85, shininess: 30, emissive: 0x1a1e22 });
    var lump = mesh(new T.IcosahedronGeometry(0.13, 1), rot);
    var lp = lump.geometry.attributes.position; for (var i = 0; i < lp.count; i++) { var k = 0.75 + R() * 0.45; lp.setXYZ(i, lp.getX(i) * k, lp.getY(i) * k, lp.getZ(i) * k); } lump.geometry.computeVertexNormals();
    put(X.s, lump, 0.12, 0.2, 0.08);
    for (var c = 0; c < 18; c++) put(X.s, mesh(new T.TetrahedronGeometry(rr(0.01, 0.035)), rot), 0.15 + rr(-0.2, 0.25), 0.01, 0.1 + rr(-0.15, 0.2));
    put(X.s, plane(0.5, 0.3, new T.MeshPhongMaterial({ color: 0x6a7a8a, transparent: true, opacity: 0.35, shininess: 100 })), 0.2, 0.003, 0.2).rotation.x = -Math.PI / 2;
    cam(X, 0.55, 0.75, 0.75, 0.05, 0.1, 0.02, 48, 0.02);
  };

  SCENES.v_rope = function (X) {
    vig(X, { bg: 0x06080e, sky: 0x6a7a9a, hemi: 0.4, fog: 0x0a0c14, fogD: 0.12 });
    var L = new T.PointLight(0xffc070, 0.9, 5, 1.5); L.position.set(-0.6, 1, 0.3); X.s.add(L);
    ground(X, 12, 0x7a8498, { shine: 30, map: speckTex('snowgrain', '#c8d0e0', 0.2, 1200, 2) });
    var curve = new T.CatmullRomCurve3([new T.Vector3(-2.5, 0.04, -2.2), new T.Vector3(-1.2, 0.04, -0.9), new T.Vector3(-0.8, 0.04, 0.1), new T.Vector3(-0.1, 0.05, 0.25), new T.Vector3(0.35, 0.05, 0.05)]);
    var rope = mesh(new T.TubeGeometry(curve, 60, 0.035, 7), M(0x9a7a44));
    X.s.add(rope);
    // twist marks along it
    for (var i = 0; i < 60; i++) { var pt = curve.getPoint(i / 60); put(X.s, mesh(new T.TorusGeometry(0.036, 0.006, 3, 8), M(0x6a5028)), pt.x, pt.y, pt.z).rotation.y = i; }
    // the clean cut face
    var end = cyl(0.036, 0.036, 0.01, M(0xc8a870), 10); end.rotation.z = Math.PI / 2; put(X.s, end, 0.36, 0.05, 0.05);
    // the knife
    var kn = new T.Group(); put(kn, box(0.3, 0.012, 0.045, M(0xc0c4cc, { shininess: 120, specular: 0xffffff })), 0.17, 0, 0); put(kn, box(0.26, 0.035, 0.06, M(0x4a3020)), -0.12, 0, 0);
    put(X.s, kn, 0.55, 0.03, 0.4, 0.6);
    cam(X, 0.7, 0.8, 1.2, 0.05, 0, 0.05, 45, 0.02);
  };

  SCENES.v_watch = function (X) {
    vig(X, { bg: 0x080608, sky: 0x7a6a5a, hemi: 0.3 });
    var L = new T.PointLight(0xffd8a0, 1, 3, 1.5); L.position.set(0.5, 0.8, 0.4); X.s.add(L);
    var cloth = canvasTex('baize', 128, 128, function (g, w, h) { g.fillStyle = '#2a1a1e'; g.fillRect(0, 0, w, h); for (var i = 0; i < 600; i++) { g.fillStyle = 'rgba(255,255,255,' + Math.random() * 0.04 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 1, 2); } }, true);
    var cl = plane(3, 3, new T.MeshPhongMaterial({ map: cloth })); cl.rotation.x = -Math.PI / 2; X.s.add(cl);
    var face = canvasTex('watchface', 256, 256, function (g) {
      g.fillStyle = '#efe6d2'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill();
      g.fillStyle = '#1a1612'; g.font = 'bold 26px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      var R_ = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
      for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2 - Math.PI / 2; g.fillText(R_[i], 128 + Math.cos(a) * 96, 128 + Math.sin(a) * 96); }
      for (var m = 0; m < 60; m++) { var b = m / 60 * Math.PI * 2; g.fillRect(128 + Math.cos(b) * 116 - 1, 128 + Math.sin(b) * 116 - 1, 2, 2); }
      g.strokeStyle = '#1a1612'; g.lineCap = 'round';
      var hA = (3 + 12 / 60) / 12 * Math.PI * 2 - Math.PI / 2, mA = 12 / 60 * Math.PI * 2 - Math.PI / 2;
      g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(hA) * 58, 128 + Math.sin(hA) * 58); g.stroke();
      g.lineWidth = 4; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(mA) * 88, 128 + Math.sin(mA) * 88); g.stroke();
      g.beginPath(); g.arc(128, 128, 7, 0, 7); g.fill();
      g.strokeStyle = 'rgba(80,110,130,0.5)'; g.lineWidth = 1; for (var c = 0; c < 6; c++) { g.beginPath(); g.moveTo(60 + c * 20, 40); g.lineTo(90 + c * 12, 220); g.stroke(); }
    });
    var brass = M(0xb08a3a, { shininess: 90, specular: 0xffe0a0 });
    put(X.s, cyl(0.3, 0.3, 0.06, brass, 32), 0, 0.03, 0);
    var fc = mesh(new T.CircleGeometry(0.27, 32), new T.MeshPhongMaterial({ map: face, shininess: 60 })); fc.rotation.x = -Math.PI / 2; put(X.s, fc, 0, 0.062, 0);
    put(X.s, mesh(new T.TorusGeometry(0.3, 0.02, 6, 32), brass), 0, 0.06, 0).rotation.x = Math.PI / 2;
    // open lid
    var lid = cyl(0.3, 0.3, 0.02, brass, 32); lid.rotation.x = 1.1; put(X.s, lid, 0, 0.26, -0.42);
    put(X.s, cyl(0.04, 0.04, 0.07, brass, 10), 0, 0.03, -0.33);
    // chain
    for (var k = 0; k < 16; k++) put(X.s, mesh(new T.TorusGeometry(0.025, 0.007, 4, 8), brass), -0.05 - k * 0.06, 0.01, -0.36 - Math.sin(k * 0.4) * 0.1).rotation.set(Math.PI / 2, 0, k);
    // water beads
    for (var d = 0; d < 26; d++) put(X.s, sph(rr(0.006, 0.018), new T.MeshPhongMaterial({ color: 0xd8e8f0, transparent: true, opacity: 0.7, shininess: 150, specular: 0xffffff }), 6), rr(-0.5, 0.5), 0.07, rr(-0.4, 0.5));
    cam(X, 0.05, 0.95, 0.45, 0, 0, -0.02, 45, 0.015);
  };

  SCENES.v_ledger = function (X) {
    vig(X, { bg: 0x0a0604, sky: 0x8a6a4a, hemi: 0.25 });
    woodTable(X, 3, 3);
    lamp(X, -0.55, 0.45, -0.35, 0xffc070, 2, 4, { glow: 1.6 });
    var left = scrawlTex('ledgerL', { head: '24 Deepwinter.', scribble: 15, rule: true, ink: '#2a2018' });
    var right = scrawlTex('ledgerR', { rule: true, ink: '#2a2018', draw: function (g, w, h) {
      g.strokeStyle = '#2a2018'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(40, 440); g.bezierCurveTo(160, 380, 260, 260, 470, 90); g.stroke();
      g.setLineDash([6, 8]); g.beginPath(); g.moveTo(50, 460); g.bezierCurveTo(170, 400, 280, 280, 480, 110); g.stroke(); g.setLineDash([]);
      g.font = 'italic 22px Georgia, serif'; g.fillStyle = '#2a2018';
      g.fillText('Works pipe', 30, 490); g.fillText('my hut', 190, 330); g.fillText('Chandelier', 300, 220); g.fillText('Narrows', 400, 70);
      g.fillRect(186, 340, 18, 14); g.beginPath(); g.arc(320, 240, 14, 0, 7); g.stroke();
      g.font = 'bold 30px Georgia, serif'; g.fillStyle = '#7a1a10'; g.fillText('CANDLED', 250, 420);
    } });
    var cover = box(1.35, 0.04, 0.95, M(0x2a3a2a)); put(X.s, cover, 0, 0.02, 0);
    paperSheet(X, left, 0.64, 0.9, -0.33, 0.055, 0, -Math.PI / 2, 0.03);
    paperSheet(X, right, 0.64, 0.9, 0.33, 0.055, 0, -Math.PI / 2, -0.03);
    var pen = cyl(0.008, 0.008, 0.36, M(0x3a2a1a), 6); pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.5; put(X.s, pen, 0.5, 0.07, 0.35);
    // spectacles
    [[-0.08, 0], [0.08, 0]].forEach(function (e) { put(X.s, mesh(new T.TorusGeometry(0.05, 0.005, 4, 16), M(0x8a7a50, { shininess: 60 })), 0.72 + e[0], 0.03, -0.35).rotation.x = Math.PI / 2; });
    cam(X, 0.05, 1.25, 0.75, 0, 0, -0.02, 48, 0.02);
  };

  SCENES.v_letter = function (X) {
    vig(X, { bg: 0x08060a, sky: 0x7a6a5a, hemi: 0.3 });
    woodTable(X, 3, 3, '#3a2a20');
    var L = new T.PointLight(0xffd8a0, 1, 3.5, 1.5); L.position.set(-0.4, 0.8, 0.2); X.s.add(L);
    var tex = scrawlTex('sarreletter', { paper: '#e2d6ba', ink: '#1a1a30', head: 'Examiner Marrow —', headSize: 34, top: 80, scribble: 13, lw: 2.4, draw: function (g, w, h) {
      g.font = 'italic 30px Georgia, serif'; g.fillStyle = '#1a1a30'; g.fillText('A. Sarre, Warden', 250, 470);
    } });
    paperSheet(X, tex, 0.7, 0.9, 0, 0.01, 0.05, -Math.PI / 2, 0.12);
    var env = plane(0.6, 0.36, M(0xd8c8a4, { side: T.DoubleSide })); env.rotation.x = -Math.PI / 2; env.rotation.z = -0.3; put(X.s, env, 0.55, 0.005, -0.4);
    put(X.s, cyl(0.05, 0.05, 0.012, M(0x8a1a1a, { shininess: 40 }), 12), 0.5, 0.012, -0.36);
    cam(X, 0.1, 1.15, 0.55, 0, 0, 0.02, 48, 0.02);
  };

  SCENES.v_bell = function (X) {
    skyBg(X, 'bellsky', [[0, '#0c1018'], [0.5, '#1e2434'], [1, '#3a3044']], {});
    lights(X, { sky: 0x5a6a8a, ground: 0x10101a, hemi: 0.5, dirI: 0.2, fog: 0x1a1c28, fogD: 0.04 });
    var prof = []; for (var i = 0; i <= 12; i++) { var t = i / 12; prof.push(new T.Vector2(0.1 + Math.pow(t, 1.8) * 0.42, 0.62 - t * 0.62)); }
    var bell = mesh(new T.LatheGeometry(prof, 20), M(0x3a3634, { shininess: 70, specular: 0xa09080, side: T.DoubleSide }));
    put(X.s, bell, 0, 2.1, 0);
    put(X.s, sph(0.08, M(0x2a2624)), 0, 1.6, 0);
    var wd = M(0x3a2a1e);
    put(X.s, box(0.1, 1.6, 0.1, wd), -0.75, 2, 0); put(X.s, box(0.1, 1.6, 0.1, wd), 0.75, 2, 0); put(X.s, box(1.7, 0.12, 0.14, wd), 0, 2.8, 0);
    var roof = mesh(new T.CylinderGeometry(1, 1, 1, 3), M(0x1c1a1e)); roof.rotation.x = -Math.PI / 2; roof.scale.set(2.4, 3, 0.8); put(X.s, roof, 0, 0.8, 0);
    put(X.s, cyl(0.012, 0.012, 2.4, M(0x9a7a4a), 4), 0.05, 0.4, 0.05);
    lamp(X, 1.4, 1.4, 0.5, 0xffb060, 1.8, 8, { glow: 1.8 });
    snow(X, 500, [-4, 4, -1, 5, -3, 3], { size: 0.03, color: 0xb8c8d8, opacity: 0.5, speed: 3, sway: 0 });
    var sw = 0; X.upd.push(function (tt) { bell.rotation.z = Math.sin(tt * 1.6) * 0.18; });
    cam(X, 1.2, 0.9, 3.2, 0, 2.1, 0, 50, 0.05);
  };

  SCENES.v_chisel = function (X) {
    vig(X, { bg: 0x0a0604, sky: 0x6a4a3a, hemi: 0.25, fog: 0x100806, fogD: 0.12 });
    var L = new T.PointLight(0xff8a3c, 2.4, 6, 1.2); L.position.set(0.6, 0.8, -2.2); X.s.add(L);
    glow(X.s, 0.6, 0.8, -2.4, 3, 0xff7a30, 0.45);
    var wallT = planksTex('hutplank', '#4a3426', true);
    put(X.s, plane(6, 4, new T.MeshPhongMaterial({ map: wallT })), 0, 1.5, -3);
    var girl = person({ h: 1.6, coat: 0x5a2a24, skin: 0xc8a088, hair: 0x1a1210, pose: 'hold', long: false, face: true, legs: 0x2a2020 });
    put(X.s, girl, 0, -0.5, -1.4, 0);
    var ch = new T.Group();
    var shaft = cyl(0.035, 0.035, 1.5, M(0x6a4a30), 8); shaft.rotation.x = Math.PI / 2; put(ch, shaft, 0, 0, -0.75);
    put(ch, cyl(0.045, 0.045, 0.08, M(0x3a3a40, { shininess: 60 }), 8), 0, 0, 0.02).rotation.x = Math.PI / 2;
    var head = box(0.09, 0.03, 0.3, M(0x8a8e96, { shininess: 90, specular: 0xffffff })); put(ch, head, 0, 0, 0.2);
    var tip = mesh(new T.ConeGeometry(0.06, 0.2, 4), M(0xb8bcc4, { shininess: 120, specular: 0xffffff })); tip.rotation.x = Math.PI / 2; tip.scale.set(1, 1, 0.35); put(ch, tip, 0, 0, 0.44);
    put(X.s, ch, 0.16, 0.7, 0.25).rotation.set(-0.1, 0.5, 0.15);
    var kl = new T.PointLight(0xffb070, 0.7, 2, 1.5); kl.position.set(0.3, 1, 0.9); X.s.add(kl);
    cam(X, 0.12, 0.8, 1.35, 0, 0.75, -1.2, 50, 0.015);
  };

  SCENES.v_trapdoor = function (X) {
    vig(X, { bg: 0x050404, sky: 0x6a5a4a, hemi: 0.2 });
    var floorT = planksTex('hutfloor', '#3e2c20', false);
    var fl = plane(4, 4, new T.MeshPhongMaterial({ map: floorT })); fl.rotation.x = -Math.PI / 2; X.s.add(fl);
    var water = plane(1, 1, new T.MeshPhongMaterial({ color: 0x03070c, shininess: 150, specular: 0x7a9aaa })); water.rotation.x = -Math.PI / 2; put(X.s, water, 0, 0.005, 0);
    [[0, -0.52, 1.14, 0.1], [0, 0.52, 1.14, 0.1], [-0.52, 0, 0.1, 0.94], [0.52, 0, 0.1, 0.94]].forEach(function (e) { put(X.s, box(e[2], 0.05, e[3], M(0xa8c0d0, { shininess: 80, specular: 0xffffff })), e[0], 0.02, e[1]); });
    var L = new T.PointLight(0xffc070, 2, 4, 1.2); L.position.set(0.4, 1.3, -0.3); X.s.add(L);
    lamp(X, 0.4, 1.3, -0.3, 0xffc070, 0, 0, { light: false, glow: 1.2 });
    var curve = new T.CatmullRomCurve3([new T.Vector3(-1.3, 0.04, 0.8), new T.Vector3(-0.6, 0.04, 0.4), new T.Vector3(-0.2, 0.03, 0.15), new T.Vector3(0, -0.4, 0)]);
    X.s.add(mesh(new T.TubeGeometry(curve, 30, 0.025, 6), M(0x9a7a44)));
    reflect(X, 0.15, -0.4, 0.2, 0.7, 0xffb060, { opacity: 0.35 });
    cam(X, 0.2, 1.6, 1.0, 0, 0, 0, 45, 0.02);
  };

  SCENES.v_valuation = function (X) {
    vig(X, { bg: 0x040806, sky: 0x6a8a6a, hemi: 0.3 });
    var baize = canvasTex('greenbaize', 128, 128, function (g, w, h) { g.fillStyle = '#1e3a24'; g.fillRect(0, 0, w, h); for (var i = 0; i < 700; i++) { g.fillStyle = 'rgba(0,0,0,' + Math.random() * 0.12 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 1, 1); } }, true);
    var b = plane(3, 3, new T.MeshPhongMaterial({ map: baize })); b.rotation.x = -Math.PI / 2; X.s.add(b);
    var L = new T.PointLight(0xe8f0b0, 1, 3, 1.5); L.position.set(0.2, 0.7, -0.1); X.s.add(L);
    var card = canvasTex('valuation', 512, 320, function (g, w, h) {
      g.fillStyle = '#ece4cc'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#2a4a34'; g.lineWidth = 6; g.strokeRect(12, 12, w - 24, h - 24); g.lineWidth = 1; g.strokeRect(22, 22, w - 44, h - 44);
      g.fillStyle = '#1e3a28'; g.textAlign = 'center'; g.font = 'bold 30px Georgia, serif'; g.fillText('THE GREAT MUTUAL OF AUBADE', w / 2, 64);
      g.font = 'italic 20px Georgia, serif'; g.fillText('Certificate of Valuation of a Life', w / 2, 94);
      g.textAlign = 'left'; g.font = '20px Georgia, serif'; g.fillStyle = '#2a2018';
      g.fillText('Holder: ______________________', 44, 146); g.fillText('Occupation: ice-cutter, Local Nine', 44, 178);
      g.font = 'bold 34px Georgia, serif'; g.fillText('Valued at  1,140 Crowns', 44, 236);
      g.save(); g.translate(390, 250); g.rotate(-0.25); g.strokeStyle = 'rgba(160,30,20,0.8)'; g.lineWidth = 4; g.strokeRect(-70, -26, 140, 52); g.fillStyle = 'rgba(160,30,20,0.85)'; g.font = 'bold 22px Georgia, serif'; g.textAlign = 'center'; g.fillText('ASSESSED', 0, 8); g.restore();
    });
    paperSheet(X, card, 0.8, 0.5, 0, 0.01, 0, -Math.PI / 2, 0.06);
    var st = new T.Group(); put(st, cyl(0.06, 0.07, 0.05, M(0x4a1a14)), 0, 0.025, 0); put(st, cyl(0.02, 0.02, 0.14, M(0xb08a3a, { shininess: 80 })), 0, 0.12, 0); put(st, sph(0.045, M(0x2a1a14, { shininess: 50 })), 0, 0.22, 0);
    put(X.s, st, 0.55, 0, -0.25);
    cam(X, 0.05, 0.9, 0.5, 0, 0, 0, 45, 0.015);
  };

  SCENES.v_pipe = function (X) {
    skyBg(X, 'pipesky', [[0, '#0a1016'], [0.5, '#1c2c34'], [1, '#2a3a36']], {});
    lights(X, { sky: 0x6a8a8a, ground: 0x0a1010, hemi: 0.55, dirI: 0.3, dx: 20, dy: 30, dz: 30, fog: 0x1a2a2a, fogD: 0.05 });
    ground(X, 40, 0x6a7888, { shine: 30, bumps: 0.12, map: speckTex('rotten', '#8a9098', 0.35, 1800, 4) });
    var iron = M(0x3a3c42, { shininess: 50, specular: 0x6a7a7a });
    var pipe = cyl(0.7, 0.7, 7, iron, 20); pipe.rotation.z = Math.PI / 2; put(X.s, pipe, -3.6, 0.75, -0.6);
    for (var f = 0; f < 3; f++) { var fl = cyl(0.8, 0.8, 0.12, M(0x2a2c30, { shininess: 40 }), 20); fl.rotation.z = Math.PI / 2; put(X.s, fl, -0.1 - f * 2.2, 0.75, -0.6); }
    var mouth = mesh(new T.CircleGeometry(0.62, 20), E(0x020404)); mouth.rotation.y = Math.PI / 2; put(X.s, mouth, 0.0, 0.75, -0.6);
    for (var rv = 0; rv < 10; rv++) put(X.s, sph(0.04, M(0x2a2420), 5), -0.12, 0.75 + Math.sin(rv / 10 * 6.28) * 0.75, -0.6 + Math.cos(rv / 10 * 6.28) * 0.75);
    // the warm water spilling out and the steam off it
    var fall = plane(1.0, 0.9, new T.MeshPhongMaterial({ color: 0x6a8a80, transparent: true, opacity: 0.55, shininess: 100, specular: 0xb8f0c8, side: T.DoubleSide })); fall.rotation.set(0, Math.PI / 2, -0.8); put(X.s, fall, 0.3, 0.4, -0.6);
    var pool = mesh(new T.CircleGeometry(2.4, 24), new T.MeshPhongMaterial({ color: 0x061210, shininess: 150, specular: 0x9ac0b0 })); pool.rotation.x = -Math.PI / 2; pool.position.set(1.8, 0.02, -0.4); pool.scale.set(1.2, 1, 1); X.s.add(pool);
    for (var s2 = 0; s2 < 5; s2++) smoke(X, 0.6 + rr(0, 2.5), 0.15, rr(-1.4, 0.6), { n: 4, size: 1, rise: 2.8, drift: 1, opacity: 0.16, color: 0xc8d0c8, speed: 0.07 });
    lamp(X, -1.6, 2.6, -2.6, 0xd8f0c0, 1.4, 12, { glow: 1.6 });
    reflect(X, 1.4, -1.6, 0.6, 3, 0xb8f0c8, { opacity: 0.3 });
    for (var c = 0; c < 36; c++) { var a = rr(0, 6.28), r = rr(2.2, 3.2); var sp = mesh(new T.ConeGeometry(rr(0.03, 0.07), rr(0.15, 0.4), 5), M(0xa8b4bc, { transparent: true, opacity: 0.8 })); put(X.s, sp, 1.8 + Math.cos(a) * r * 1.2, 0.08, -0.4 + Math.sin(a) * r); }
    cam(X, 3.2, 1.5, 2.6, -0.6, 0.6, -0.6, 52, 0.05);
  };

  SCENES.v_jars = function (X) {
    vig(X, { bg: 0x0c0604, sky: 0x8a6a4a, hemi: 0.2, fog: 0x1a0c06, fogD: 0.25 });
    var shelf = box(3, 0.06, 0.5, M(0x5a3e24)); put(X.s, shelf, 0, 0.4, 0);
    put(X.s, box(3, 0.06, 0.5, M(0x5a3e24)), 0, 0.8, -0.5);
    var jarM = new T.MeshPhongMaterial({ color: 0xd8b070, emissive: 0x7a3a10, transparent: true, opacity: 0.75, shininess: 90 });
    var flames = [];
    for (var i = 0; i < 26; i++) { var row = i < 13 ? 0 : 1; var x = -1.3 + (i % 13) * 0.21 + rr(-0.03, 0.03), y = row ? 0.83 : 0.43, z = row ? -0.5 : rr(-0.1, 0.12); put(X.s, cyl(0.065, 0.065, 0.16, jarM, 10), x, y + 0.08, z); flames.push(new T.Vector3(x, y + 0.2, z)); }
    X.s.add(new T.Points(new T.BufferGeometry().setFromPoints(flames), new T.PointsMaterial({ size: 0.16, map: glowTex(), color: 0xffc860, transparent: true, depthWrite: false, blending: T.AdditiveBlending })));
    var L = new T.PointLight(0xffb050, 2.4, 4, 1.2); L.position.set(0, 0.8, 0.5); X.s.add(L);
    X.upd.push(function (t) { L.intensity = 2.4 * (0.88 + 0.12 * Math.sin(t * 7)); });
    // a hand setting down one more jar
    var hand = hand2(M(0xc8a088), 2.4, 0.5, 0.05); hand.rotation.set(0, 0, 1.6); put(X.s, hand, 0.58, 0.6, 0.22);
    put(X.s, cyl(0.065, 0.065, 0.16, jarM, 10), 0.42, 0.58, 0.22);
    glow(X.s, 0.42, 0.7, 0.22, 0.4, 0xffd070, 0.8);
    put(X.s, cyl(0.07, 0.08, 0.5, M(0x6e6a66), 8), 0.95, 0.56, 0.2).rotation.z = 1.2;
    cam(X, 0.1, 0.7, 1.4, 0.05, 0.55, 0, 50, 0.015);
  };

  SCENES.v_notebook = function (X) {
    vig(X, { bg: 0x0a0c14, sky: 0x6a7aa0, hemi: 0.4 });
    var L = new T.PointLight(0xffc070, 0.9, 3, 1.5); L.position.set(0.5, 0.6, 0.4); X.s.add(L);
    var tex = scrawlTex('thingsnot', { paper: '#e8e0cc', ink: '#1a1a2a', head: 'Things Not Entered', headSize: 30, scribble: 14, lw: 1.6, rule: true });
    var cover = box(0.46, 0.03, 0.62, M(0x141216)); put(X.s, cover, 0, 0.3, 0);
    paperSheet(X, tex, 0.42, 0.58, 0.01, 0.32, 0, -Math.PI / 2 + 0.02, 0);
    // her hands: gloves with the fingertips cut away
    var glove = M(0x3a3438);
    var hl = hand2(M(0xd8b8a0), 1.9, 0.55, 0.05); hl.rotation.set(-Math.PI / 2, 0, 0.9); put(X.s, hl, -0.3, 0.33, 0.2);
    var gv = sph(0.1, glove, 10); gv.scale.set(0.95, 0.5, 1.15); put(X.s, gv, -0.33, 0.33, 0.22);
    put(X.s, cyl(0.07, 0.08, 0.35, M(0x2c2c3a), 8), -0.45, 0.32, 0.4).rotation.set(Math.PI / 2, 0, 0.9);
    var pencil = cyl(0.008, 0.008, 0.22, M(0xc89a2a), 6); pencil.rotation.z = Math.PI / 2; pencil.rotation.y = -0.6; put(X.s, pencil, 0.18, 0.34, 0.1);
    put(X.s, plane(4, 4, M(0x1a1c26)), 0, -0.2, 0).rotation.x = -Math.PI / 2;
    snow(X, 200, [-1, 1, 0.3, 1.6, -1, 1], { size: 0.02, opacity: 0.7 });
    cam(X, 0.05, 0.95, 0.45, 0, 0.3, 0, 48, 0.015);
  };

  SCENES.v_snowname = function (X) {
    vig(X, { bg: 0x10141e, sky: 0x8a9ac0, hemi: 0.5, fog: 0x141824, fogD: 0.12 });
    var L = new T.PointLight(0xffc890, 1.4, 5, 1.2); L.position.set(-0.8, 0.9, -0.4); X.s.add(L);
    var tex = canvasTex('feliks', 512, 256, function (g, w, h) {
      g.fillStyle = '#d2d8e6'; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 1500; i++) { g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '255,255,255,' : '60,70,100,') + Math.random() * 0.12 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      g.font = 'italic 140px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 16; g.strokeStyle = 'rgba(70,80,110,0.55)'; g.strokeText('Feliks', w / 2, h / 2);
      g.lineWidth = 6; g.strokeStyle = 'rgba(40,46,70,0.5)'; g.strokeText('Feliks', w / 2 + 2, h / 2 + 3);
      // a boot has scuffed through the end of it
      g.fillStyle = 'rgba(210,216,230,0.85)'; g.beginPath(); g.ellipse(452, 150, 34, 80, 0.5, 0, 7); g.fill();
      g.fillStyle = 'rgba(70,80,110,0.3)'; for (var k = 0; k < 6; k++) g.fillRect(430 + k * 8, 90 + k * 20, 34, 5);
    });
    var sn = plane(2.4, 1.2, new T.MeshPhongMaterial({ map: tex, shininess: 8 })); sn.rotation.x = -Math.PI / 2; X.s.add(sn);
    ground(X, 20, 0xc8d0e0, { shine: 8, y: -0.005, map: speckTex('snowgrain', '#c8d0e0', 0.2, 1200, 2) });
    snow(X, 300, [-2, 2, 0, 2, -2, 2], { size: 0.025 });
    cam(X, 0.1, 1.2, 1.1, 0, 0, 0, 50, 0.02);
  };

  SCENES.v_saws = function (X) {
    vig(X, { bg: 0x0c0604, sky: 0x6a4a40, hemi: 0.35, fog: 0x1a0e0c, fogD: 0.05 });
    var wallT = planksTex('shedplank', '#3a2a22', true); wallT.repeat.set(3, 1);
    put(X.s, plane(8, 4, new T.MeshPhongMaterial({ map: wallT })), 0, 1.8, -0.2);
    var steel = M(0x7a8490, { shininess: 90, specular: 0xd0e0ff });
    var cool = new T.PointLight(0x9ab8e0, 0.8, 8, 1.4); cool.position.set(-1.5, 2.5, 2); X.s.add(cool);
    for (var i = 0; i < 4; i++) {
      var y = 2.9 - i * 0.62, g = new T.Group();
      put(g, box(3.4, 0.28, 0.03, steel), 0, 0, 0);
      for (var t = 0; t < 34; t++) { var tooth = mesh(new T.ConeGeometry(0.045, 0.14, 3), steel); tooth.rotation.z = Math.PI; put(g, tooth, -1.65 + t * 0.1, -0.18, 0); }
      put(g, box(0.1, 0.5, 0.1, M(0x5a3a20)), -1.75, 0.1, 0.02); put(g, box(0.1, 0.5, 0.1, M(0x5a3a20)), 1.75, 0.1, 0.02);
      put(X.s, g, rr(-0.3, 0.3), y, 0, 0).rotation.z = rr(-0.03, 0.03);
      put(X.s, cyl(0.03, 0.03, 0.2, M(0x2a2420), 5), -1.2, y + 0.18, 0.05).rotation.x = Math.PI / 2;
      put(X.s, cyl(0.03, 0.03, 0.2, M(0x2a2420), 5), 1.2, y + 0.18, 0.05).rotation.x = Math.PI / 2;
    }
    var L = new T.PointLight(0xff8a40, 1.2, 8, 1.4); L.position.set(1.2, 0.6, 1.6); X.s.add(L);
    cam(X, -0.9, 1.7, 3.2, 0.2, 1.8, 0, 52, 0.04);
  };

  SCENES.v_cake = function (X) {
    vig(X, { bg: 0x0a0604, sky: 0x8a6a4a, hemi: 0.3 });
    var L = new T.PointLight(0xff9a50, 0.9, 3, 1.5); L.position.set(0.5, 0.5, 0.3); X.s.add(L);
    var glove = M(0x3a302a);
    var gh = hand2(glove, 4.2, 0.35, 0.08); gh.rotation.set(-Math.PI / 2, 0, 0); put(X.s, gh, 0, 0.0, 0.05);
    put(X.s, cyl(0.1, 0.12, 0.6, M(0x2a2a30), 8), 0, -0.05, -0.45).rotation.x = Math.PI / 2;
    var paper = plane(0.4, 0.36, new T.MeshPhongMaterial({ color: 0xe8dcc0, transparent: true, opacity: 0.85, shininess: 60, side: T.DoubleSide })); paper.rotation.x = -Math.PI / 2; paper.rotation.z = 0.3; put(X.s, paper, 0, 0.04, 0.02);
    var cake = box(0.2, 0.08, 0.14, M(0xb07a3a, { shininess: 30 })); put(X.s, cake, 0, 0.09, 0.02, 0.3);
    put(X.s, box(0.2, 0.012, 0.14, M(0xe0a84a, { shininess: 90, specular: 0xffe0a0 })), 0, 0.135, 0.02, 0.3);
    put(X.s, plane(4, 4, M(0x3e2c20)), 0, -0.6, 0).rotation.x = -Math.PI / 2;
    cam(X, 0.2, 0.55, 0.55, 0, 0.05, 0, 45, 0.015);
  };

  SCENES.v_chestnuts = function (X) {
    vig(X, { bg: 0x0a0806, sky: 0x8a6a4a, hemi: 0.3, fog: 0x100a08, fogD: 0.1 });
    fire(X, 0.7, -1.6, 0.5);
    var cone = mesh(new T.ConeGeometry(0.16, 0.42, 14, 1, true), new T.MeshPhongMaterial({ color: 0xd8c8a0, side: T.DoubleSide, map: scrawlTex('newsprint', { paper: '#d8ccaa', scribble: 18, lw: 1, ink: '#5a5040' }) }));
    cone.rotation.x = Math.PI; put(X.s, cone, 0, 0.3, 0);
    var cl = new T.PointLight(0xffa860, 0.8, 2, 1.5); cl.position.set(0.3, 0.7, 0.5); X.s.add(cl);
    for (var i = 0; i < 9; i++) { var n = sph(0.045, M(0x6a3018, { shininess: 60 }), 7); n.scale.set(1, 0.8, 1); put(X.s, n, rr(-0.1, 0.1), 0.53 + rr(0, 0.05), rr(-0.1, 0.1)); }
    var hand = hand2(M(0xc8a088), 2.4, 0.9, 0.05); hand.rotation.set(0.3, 0, 0.2); put(X.s, hand, -0.02, 0.2, 0.1);
    smoke(X, 0, 0.6, 0, { n: 4, size: 0.4, rise: 0.8, drift: 0.1, opacity: 0.25, color: 0xd8d0c8, speed: 0.2 });
    cam(X, 0.2, 0.7, 0.8, 0, 0.42, 0, 50, 0.015);
  };

  SCENES.v_raining = function (X) {
    hall(X, { act3: true });
    X.s.fog = new T.FogExp2(0x1a0a0c, 0.06);
    var drops = snow(X, 500, [-3, 3, 0, 5.6, -4, 2], { size: 0.05, color: 0xd8f0ff, opacity: 0.8, speed: 4, sway: 0 });
    for (var d = 0; d < 10; d++) { var cx = rr(-4, 4), cz = rr(-3, 3); var a = person({ h: 1.75, coat: pick([0x1a1a22, 0x8a1a2a, 0x1a4a3a, 0xd0b060]), pose: 'dance', long: false }); put(X.s, a, cx, 0, cz, rr(0, 6)); }
    cam(X, 0.4, 1.4, 3.5, 0, 5.8, -1, 62, 0.06);
  };

  SCENES.v_crack = function (X) {
    skyBg(X, 'cracksky', [[0, '#0c1018'], [0.55, '#2a2a3a'], [1, '#4a3a44']], {});
    lights(X, { sky: 0x5a6a8a, ground: 0x0a0a12, hemi: 0.5, dirI: 0.2, fog: 0x1c1c28, fogD: 0.05 });
    ground(X, 60, 0x5a6478, { shine: 90, specular: 0x8a9ab0, map: speckTex('icegrain', '#8a96b0', 0.25, 900, 3) });
    var pts = [], x = -0.3, z = 2;
    while (z > -30) { pts.push([x, z]); x += rr(-0.8, 0.8); z -= rr(0.6, 1.6); }
    for (var k = 0; k < pts.length - 1; k++) {
      var a = pts[k], b = pts[k + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      var wdt = 0.3 * (1 - k / pts.length) + 0.04;
      var seg = box(wdt, 0.02, len, new T.MeshPhongMaterial({ color: 0x020508, shininess: 150, specular: 0x6a8aa0 }));
      seg.position.set((a[0] + b[0]) / 2, 0.012, (a[1] + b[1]) / 2); seg.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); X.s.add(seg);
    }
    // meltwater puddles, lanterns reflected
    for (var p = 0; p < 7; p++) { var pd = mesh(new T.CircleGeometry(rr(0.4, 1.4), 14), new T.MeshPhongMaterial({ color: 0x0a1018, shininess: 150, specular: 0x9ab0c8 })); pd.rotation.x = -Math.PI / 2; pd.position.set(rr(-5, 5), 0.01, rr(-14, 0)); X.s.add(pd); }
    for (var l = 0; l < 6; l++) { var lx = rr(-7, 7), lz = rr(-24, -5); lanternPole(X, lx, lz, 2.4, l < 2); reflect(X, lx, lz, 0.5, 6, 0xffb060, { opacity: 0.35 }); }
    var boot = box(0.14, 0.12, 0.3, M(0x141114)); put(X.s, boot, 0.5, 0.06, 1.3, 0.3);
    snow(X, 600, [-6, 6, 0, 5, -10, 3], { size: 0.03, color: 0xb8c8d8, opacity: 0.5, speed: 3, sway: 0 });
    cam(X, 0.2, 1.3, 3.2, -0.3, 0, -8, 55, 0.04);
  };

  SCENES.v_boathook = function (X) {
    vig(X, { bg: 0x0a0604, sky: 0x6a4a3a, hemi: 0.3 });
    var wallT = planksTex('hutplank', '#4a3426', true); wallT.repeat.set(2, 1);
    put(X.s, plane(5, 3, new T.MeshPhongMaterial({ map: wallT })), 0, 1.2, 0);
    var L = new T.PointLight(0xffb060, 1, 4, 1.5); L.position.set(0.8, 1.9, 1.2); X.s.add(L);
    var hook = new T.Group();
    put(hook, cyl(0.045, 0.045, 3, M(0x6a4a30), 8), 0, 0, 0).rotation.z = Math.PI / 2;
    for (var n = 0; n < 44; n++) put(hook, box(0.006, 0.08, 0.03, E(0x1a100a)), -1.2 + n * 0.05, 0, 0.04);
    var iron = M(0x3a3a40, { shininess: 60 });
    put(hook, cyl(0.035, 0.035, 0.25, iron, 8), 1.55, 0, 0).rotation.z = Math.PI / 2;
    var hk = mesh(new T.TorusGeometry(0.16, 0.035, 6, 12, Math.PI * 1.2), iron); put(hook, hk, 1.75, 0.13, 0);
    put(hook, mesh(new T.ConeGeometry(0.025, 0.2, 6), iron), 1.8, 0, 0).rotation.z = -Math.PI / 2;
    put(X.s, hook, 0, 1.3, 0.12);
    [-0.9, 0.9].forEach(function (px) { put(X.s, cyl(0.02, 0.02, 0.18, M(0x2a2018), 5), px, 1.25, 0.1).rotation.x = Math.PI / 2; });
    cam(X, 1.0, 1.5, 1.25, 1.15, 1.3, 0, 58, 0.015);
  };

  SCENES.v_lantern = function (X) {
    skyBg(X, 'dawnlamp', [[0, '#3a3a5a'], [0.45, '#8a6a7a'], [0.55, '#e8a888'], [0.6, '#f0c89a'], [1, '#6a5a6a']], {});
    lights(X, { sky: 0xd8a8a0, ground: 0x2a2a34, hemi: 0.8, dirColor: 0xffc8a0, dirI: 0.5, dx: 0, dy: 5, dz: -40, fog: 0x8a7a8a, fogD: 0.03 });
    water(X, 200, 0x3a4458, { y: -0.1, shine: 120, specular: 0xffc8a0 });
    var sh = plane(6, 3, new T.MeshPhongMaterial({ color: 0x4a4a50, shininess: 60, specular: 0x8a7a70 })); sh.rotation.x = -Math.PI / 2; put(X.s, sh, 0, 0.02, 1.3);
    for (var st = 0; st < 40; st++) { var pb = sph(rr(0.03, 0.09), M(pick([0x5a5a60, 0x6a6660, 0x3a3a40]), { shininess: 50 }), 6); pb.scale.y = 0.5; put(X.s, pb, rr(-2.5, 2.5), 0.03, rr(0.2, 2.6)); }
    for (var f = 0; f < 10; f++) floe(X, rr(-20, 20), rr(-40, -6), rr(0.8, 3));
    var jarM = new T.MeshPhongMaterial({ color: 0xd8b070, emissive: 0x7a3a10, transparent: true, opacity: 0.8, shininess: 90 });
    put(X.s, cyl(0.07, 0.07, 0.18, jarM, 10), 0, 0.1, 0.6);
    glow(X.s, 0, 0.25, 0.6, 0.5, 0xffc860, 0.9);
    var L = new T.PointLight(0xffb050, 1, 2, 1.2); L.position.set(0, 0.3, 0.7); X.s.add(L);
    reflect(X, 0, -30, 3, 30, 0xffd0a0, { opacity: 0.4, y: -0.1 });
    cam(X, 0.1, 0.5, 2.3, 0, 0.2, -6, 50, 0.03);
  };

  SCENES.v_cairn = function (X) {
    skyBg(X, 'cairnsky', NIGHT_SKY, { stars: 200 });
    lights(X, { sky: 0x4a5a8a, ground: 0x10101a, hemi: 0.55, dirI: 0.25, fog: 0x1c1a30, fogD: 0.02 });
    ground(X, 100, 0x8a96b4, { shine: 20, map: speckTex('snowgrain', '#c8d0e0', 0.2, 1200, 2) });
    var iceM = new T.MeshPhongMaterial({ color: 0xc8dce6, emissive: 0x18242c, shininess: 60, specular: 0xffffff, flatShading: true });
    var layers = [[5, 0.5], [4, 0.4], [3, 0.3], [1, 0.22]];
    var y = 0;
    layers.forEach(function (lv, li) { for (var i = 0; i < lv[0]; i++) { var a = (i / lv[0]) * Math.PI * 2 + li; var bx = mesh(new T.DodecahedronGeometry(lv[1] * 0.55, 0), iceM); bx.scale.y = 0.6; put(X.s, bx, Math.cos(a) * (0.35 - li * 0.1), y + 0.11, Math.sin(a) * (0.35 - li * 0.1), a); } y += 0.2; });
    var plate = canvasTex('fmplate', 128, 96, function (g) { g.fillStyle = '#8a8a90'; g.fillRect(0, 0, 128, 96); g.strokeStyle = '#2a2a30'; g.lineWidth = 5; g.font = 'bold 56px Georgia, serif'; g.textAlign = 'center'; g.strokeText('F.M.', 64, 62); for (var k = 0; k < 200; k++) { g.fillStyle = 'rgba(60,40,30,' + Math.random() * 0.3 + ')'; g.fillRect(Math.random() * 128, Math.random() * 96, 2, 2); } });
    var pl = plane(0.3, 0.22, new T.MeshPhongMaterial({ map: plate, shininess: 70, specular: 0xffffff, emissive: 0x2a2a2a })); put(X.s, pl, 0, 0.16, 0.5).rotation.x = -0.15;
    var jarM = new T.MeshPhongMaterial({ color: 0xd8b070, emissive: 0x7a3a10, transparent: true, opacity: 0.8, shininess: 90 });
    put(X.s, cyl(0.07, 0.07, 0.18, jarM, 10), 0, y + 0.09, 0);
    glow(X.s, 0, y + 0.2, 0, 0.8, 0xffc860, 0.9);
    var L = new T.PointLight(0xffb050, 1.6, 4, 1.2); L.position.set(0, y + 0.3, 0.2); X.s.add(L);
    // the far Glass and its lights, across the Narrows
    for (var h = 0; h < 14; h++) hut(X, rr(-30, 10), rr(-70, -55), rr(0, 6), { smoke: false, props: false });
    glow(X.s, -10, 3, -60, 20, 0xffa050, 0.3).material.fog = false;
    var ch = plane(40, 6, new T.MeshPhongMaterial({ color: 0x03060a, shininess: 150, specular: 0x6a7a9a })); ch.rotation.x = -Math.PI / 2; ch.position.set(0, 0.01, -20); X.s.add(ch);
    snow(X, 400, [-5, 5, 0, 5, -6, 3], { size: 0.04 });
    cam(X, 0.3, 0.7, 1.6, 0, 0.35, 0, 50, 0.03);
  };

  SCENES.v_broadsheet = function (X) {
    vig(X, { bg: 0x0a0806, sky: 0x8a7a5a, hemi: 0.35 });
    woodTable(X, 3, 3, '#3a2a1c');
    var L = new T.PointLight(0xffd8a0, 1, 3, 1.5); L.position.set(0.3, 0.8, 0.2); X.s.add(L);
    var warn = !!X.v.f_press;
    var sheet = canvasTex(warn ? 'lampwarn' : 'lampscandal', 512, 700, function (g, w, h) {
      g.fillStyle = '#e4dcc6'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#141414'; g.textAlign = 'center';
      g.font = 'bold 44px Georgia, serif'; g.fillText('THE EVENING LAMP', w / 2, 66);
      g.fillRect(30, 80, w - 60, 3); g.font = 'italic 16px Georgia, serif'; g.fillText('Aubade · Special Sheet · The Last Night of Winter', w / 2, 102); g.fillRect(30, 112, w - 60, 1);
      g.font = 'bold 60px Georgia, serif';
      (warn ? ['THE ICE', 'WILL GO', 'TONIGHT'] : ['WARDEN', 'DROWNS', 'IN DRINK']).forEach(function (l, i) { g.fillText(l, w / 2, 190 + i * 66); });
      g.font = 'italic 20px Georgia, serif'; g.fillText(warn ? 'Examiner orders the Glass cleared — walk ashore now' : 'Old ice-man found beneath the Chandelier', w / 2, 400);
      g.textAlign = 'left'; g.fillStyle = 'rgba(20,20,20,0.75)';
      for (var c = 0; c < 2; c++) for (var l = 0; l < 11; l++) g.fillRect(34 + c * 230, 430 + l * 22, 200 - Math.random() * (l === 10 ? 120 : 20), 7);
    });
    paperSheet(X, sheet, 0.6, 0.82, 0, 0.012, 0, -Math.PI / 2, -0.05);
    // type in a composing stick
    var stick = box(0.4, 0.03, 0.08, M(0x8a8a90, { shininess: 70 })); put(X.s, stick, 0.55, 0.02, 0.3, 0.4);
    for (var t = 0; t < 14; t++) put(X.s, box(0.02, 0.04, 0.02, M(0x5a5a60, { shininess: 60 })), 0.4 + t * 0.022, 0.05, 0.25 + t * 0.009);
    cam(X, 0.05, 1.05, 0.55, 0, 0, 0.02, 48, 0.015);
  };

  // ---------------------------------------------------------------- two more places
  SCENES.narrows = function (X) {
    skyBg(X, 'narrows', NIGHT_SKY, { stars: 260, clouds: [{ x: 0.3, y: 0.62, w: 0.7, h: 0.08, r: 0.2, n: 20, c: 'rgba(90,70,130,0.3)' }] });
    lights(X, { sky: 0x4a5a8a, ground: 0x10101a, hemi: 0.55, dirI: 0.25, fog: 0x1c1a30, fogD: 0.012 });
    ground(X, 400, 0x7a88a8, { shine: 30, bumps: 0.25, map: speckTex('snowgrain', '#c8d0e0', 0.2, 1200, 2) });
    // pressure ridges
    for (var r = 0; r < 26; r++) { var sl = box(rr(0.6, 1.6), rr(0.2, 0.9), rr(0.3, 0.8), M(0x9ab0c8, { shininess: 50, specular: 0xffffff })); put(X.s, sl, -14 + r * 1.1 + rr(-0.3, 0.3), 0.2, -10 + Math.sin(r * 0.5) * 1.5).rotation.set(rr(-0.5, 0.5), rr(0, 3), rr(-0.6, 0.6)); }
    // the open lead: black water, floes
    var lead = plane(80, 12, new T.MeshPhongMaterial({ color: 0x02050a, shininess: 150, specular: 0x6a7a9a })); lead.rotation.x = -Math.PI / 2; lead.position.set(0, 0.01, -24); X.s.add(lead);
    for (var f = 0; f < 8; f++) floe(X, rr(-30, 30), rr(-28, -20), rr(0.6, 2), { color: 0x9aaac0 });
    // warning posts, long ago
    for (var p = 0; p < 6; p++) { put(X.s, cyl(0.04, 0.04, 1.6, M(0x3a2a20), 5), -8 + p * 3.2, 0.8, -15); put(X.s, plane(0.4, 0.25, M(0x8a2a20, { side: T.DoubleSide })), -7.8 + p * 3.2, 1.45, -15); }
    // the Glass behind, far off
    for (var h = 0; h < 30; h++) hut(X, rr(-50, 50), rr(40, 70), rr(0, 6), { smoke: false, props: false });
    glow(X.s, 0, 6, 60, 40, 0xffa050, 0.25).material.fog = false;
    city(X, 20, -160, { n: 110, spread: 60, hill: 22, lit: 0.45 });
    reflect(X, 20, -60, 16, 36, 0xffa860, { opacity: 0.2 });
    // a small cairn, and Ilse with the lantern
    SCENES._cairnSmall(X, 1.5, -3);
    people(X, [{ x: -0.8, z: 1.5, h: 1.66, coat: 0x2c2c3a, pose: 'stand', bun: true, hair: 0x1a1410, ry: Math.PI - 0.3, scarf: 0x6a2a3a, face: true }]);
    lamp(X, -0.5, 0.95, 1.4, 0xffb45a, 1.2, 8, { glow: 1.4 });
    snow(X, 700, [-15, 15, 0, 14, -20, 10], { size: 0.08 });
    cam(X, -2.5, 1.9, 6.5, 1.5, 0.6, -8, 52, 0.12);
  };
  SCENES._cairnSmall = function (X, x, z) {
    var iceM = new T.MeshPhongMaterial({ color: 0xa8d0e0, emissive: 0x1a3040, transparent: true, opacity: 0.9, shininess: 90 });
    for (var i = 0; i < 8; i++) put(X.s, box(0.35, 0.2, 0.3, iceM), x + rr(-0.3, 0.3), 0.1 + (i > 4 ? 0.2 : 0) + (i > 6 ? 0.2 : 0), z + rr(-0.2, 0.2), rr(0, 3));
    glow(X.s, x, 0.75, z, 0.8, 0xffc860, 0.8);
    var L = new T.PointLight(0xffb050, 1, 4, 1.2); L.position.set(x, 0.9, z + 0.2); X.s.add(L);
  };

  SCENES.press = function (X) {
    lights(X, { sky: 0x6a5a4a, ground: 0x0c0806, hemi: 0.35, dir: false, fog: 0x1a120c, fogD: 0.05 });
    var wallT = planksTex('pressplank', '#3e3026', true); wallT.repeat.set(4, 1);
    roomBox(X, 5, 2.6, 6, { wallMat: new T.MeshPhongMaterial({ map: wallT, side: T.BackSide }), floor: 0x2a2018 });
    // the platen press: frame, great flywheel, platen and bed
    var iron = M(0x1e1e22, { shininess: 50 });
    var pr = new T.Group();
    put(pr, box(0.9, 1.2, 0.8, iron), 0, 0.6, 0);
    put(pr, box(0.7, 0.7, 0.08, iron), 0, 1.2, 0.35).rotation.x = -0.4;
    var wheel = mesh(new T.TorusGeometry(0.55, 0.04, 6, 24), iron); put(pr, wheel, -0.6, 1.1, 0).rotation.y = Math.PI / 2;
    for (var sp = 0; sp < 6; sp++) { var spk = box(0.03, 1.08, 0.03, iron); spk.rotation.x = sp / 6 * Math.PI; put(pr, spk, -0.6, 1.1, 0); }
    put(pr, cyl(0.03, 0.03, 0.9, M(0x5a4030), 6), 0.6, 1.5, 0.2).rotation.z = 0.6;
    put(pr, box(0.6, 0.02, 0.45, M(0xe8e0cc)), 0, 1.02, 0.45).rotation.x = -0.2;
    put(X.s, pr, -0.9, 0, -1.6, 0.3);
    X.upd.push(function (t) { wheel.rotation.x = t * 0.6; });
    // type cases on a stand
    var cs = new T.Group();
    put(cs, box(1.3, 0.9, 0.5, M(0x5a4030)), 0, 0.45, 0);
    for (var k = 0; k < 2; k++) { var tray = box(1.2, 0.06, 0.7, M(0x6a5038)); put(cs, tray, 0, 1.0 + k * 0.15, 0.1 - k * 0.1).rotation.x = -0.5; }
    put(X.s, cs, 1.4, 0, -2.3, -0.2);
    // sheets drying on lines
    for (var l = 0; l < 3; l++) {
      put(X.s, cyl(0.004, 0.004, 4.6, M(0x8a8070), 3), 0, 2.2 - l * 0.02, -1.5 + l * 1.2).rotation.z = Math.PI / 2;
      for (var s2 = 0; s2 < 7; s2++) paperSheet(X, scrawlTex('press' + ((s2 + l) % 3), { paper: '#e0d8c2', head: 'THE EVENING LAMP', headSize: 34, scribble: 16, lw: 1.2, ink: '#222' }), 0.42, 0.56, -1.9 + s2 * 0.62, 1.9 - l * 0.02, -1.5 + l * 1.2, 0, rr(-0.05, 0.05));
    }
    stove(X, 2, 0.8, { intensity: 1.2, ry: -Math.PI / 2 });
    lamp(X, 0, 2.05, -0.6, 0xffc070, 1.8, 8, { glow: 1.8 });
    lamp(X, -1.2, 1.9, 0.9, 0xffc070, 1.2, 6, { glow: 1.4 });
    var fillP = new T.PointLight(0xffd8a0, 0.8, 8, 1.2); fillP.position.set(1.5, 1.8, 2); X.s.add(fillP);
    table(X, 0.6, 0.4, 1.2, 0.7, {});
    paperSheet(X, scrawlTex('proofs', { paper: '#e6dcc4', scribble: 14, lw: 1.6 }), 0.5, 0.66, 0.6, 0.8, 0.4, -Math.PI / 2, 0.2);
    // Wren, in an ink apron and a green eyeshade
    people(X, [{ x: 0.2, z: -0.2, h: 1.7, coat: 0xd8d0c0, legs: 0x2a2a30, pose: 'hands', long: false, apron: 0x2a2a2a, hair: 0x7a3a1a, bun: true, hat: 'cap', hatColor: 0x1e6a3a, face: true, ry: 0.6 }]);
    cam(X, 1.9, 1.5, 2.7, -0.6, 1.0, -1.6, 60, 0.06);
  };

  api.scenes = Object.keys(SCENES).filter(function (k) { return k.charAt(0) !== '_'; });

  // ---------------------------------------------------------------- lifecycle
  function disposeScene(sc) {
    if (!sc) return;
    sc.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        var ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach(function (m) {
          if (m.map && !(m.map.userData && m.map.userData.cached)) m.map.dispose();
          if (!(m.userData && m.userData.cached)) m.dispose();
        });
      }
    });
  }

  function resize() {
    if (!renderer) return;
    var r = canvas.getBoundingClientRect();
    var w = Math.max(2, r.width | 0), h = Math.max(2, r.height | 0);
    var k = Math.min(1, 1280 / w, 900 / h) * scale;
    W = Math.max(2, Math.round(w * k)); H = Math.max(2, Math.round(h * k));
    renderer.setSize(W, H, false);
    rt.setSize(W, H);
    post.uniforms.res.value.set(W, H);
    if (cur) { cur.camera.aspect = W / H; cur.camera.updateProjectionMatrix(); }
    kick(true);
  }

  function renderOnce(t) {
    if (!cur) return;
    cur.update(t);
    renderer.setRenderTarget(rt);
    renderer.render(cur.scene, cur.camera);
    renderer.setRenderTarget(null);
    post.uniforms.time.value = t;
    renderer.render(postScene, postCam);
  }

  function loop(now) {
    raf = 0;
    if (!cur || !api.ok) return;
    var interval = staticMode ? 1000 : 40;
    if (now - lastRender >= interval) {
      var dt = now - last; last = now;
      renderOnce(now / 1000);
      lastRender = now;
      if (!staticMode && dt > 0 && dt < 1000) {
        if (dt > 95) slowCount++; else slowCount = Math.max(0, slowCount - 1);
        if (slowCount > 25) {
          slowCount = 0;
          if (scale > 0.55) { scale *= 0.75; resize(); } else { staticMode = true; }
        }
      }
    }
    if (!reduce && !document.hidden) raf = requestAnimationFrame(loop);
  }
  function kick(force) {
    if (!cur) return;
    if (reduce || force) renderOnce(performance.now() / 1000);
    if (!raf && !reduce && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); }
  }

  api.init = function (cv) {
    if (!T) return false;
    canvas = cv;
    try {
      renderer = new T.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch (e) { return false; }
    if (!renderer || !renderer.getContext()) return false;
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x05060a, 1);
    rt = new T.WebGLRenderTarget(4, 4, { minFilter: T.LinearFilter, magFilter: T.LinearFilter, format: T.RGBAFormat });
    post = new T.ShaderMaterial({
      uniforms: { tDiffuse: { value: rt.texture }, res: { value: new T.Vector2(4, 4) }, time: { value: 0 }, strength: { value: 1 } },
      vertexShader: POST_VS, fragmentShader: POST_FS, depthTest: false, depthWrite: false
    });
    postScene = new T.Scene();
    postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    postScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), post));
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); api.ok = false; if (api.onlost) api.onlost(); });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    api.ok = true;
    resize();
    return true;
  };

  api.setStrength = function (v) { if (post) { post.uniforms.strength.value = v; kick(true); } };

  api.show = function (key, v) {
    if (!api.ok) return false;
    pending = { key: key, v: v || {} };
    canvas.classList.remove('on');
    clearTimeout(showTimer);
    showTimer = setTimeout(function () {
      var p = pending; pending = null;
      if (!p) return;
      var old = cur;
      cur = null;
      if (old) disposeScene(old.scene);
      R = rng(hashStr(p.key));
      var s = new T.Scene();
      var cm = new T.PerspectiveCamera(50, W / H, 0.1, 2500);
      var X = { s: s, cam: cm, v: p.v, upd: [] };
      try { (SCENES[p.key] || SCENES.black)(X); } catch (e) { console.error('Scene failed', p.key, e); }
      cm.aspect = W / H; cm.updateProjectionMatrix();
      cur = { scene: s, camera: cm, update: function (t) { for (var i = 0; i < X.upd.length; i++) X.upd[i](t); } };
      kick(true);
      canvas.classList.add('on');
    }, reduce ? 0 : 450);
    return true;
  };
})();
