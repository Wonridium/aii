/* CANDLE ICE — procedural oil-sketch painter.
 * Every scene is painted at runtime from thousands of bristled brush strokes,
 * after the expressionist look of Disco Elysium's concept art. Seeded, so a
 * scene always paints the same way.
 */
(function () {
  'use strict';
  var C = (window.CANDLE = window.CANDLE || {});
  var W = 1600, H = 1000;
  var ctx, R;

  // ------------------------------------------------------------ utilities
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function hex(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function ramp(stops, t) {
    // stops: [[t, '#hex'], ...]
    if (t <= stops[0][0]) return hex(stops[0][1]);
    for (var i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i];
        return mix(hex(a[1]), hex(b[1]), (t - a[0]) / (b[0] - a[0]));
      }
    }
    return hex(stops[stops.length - 1][1]);
  }
  function jit(c, j) { return [c[0] + (R() - 0.5) * j, c[1] + (R() - 0.5) * j, c[2] + (R() - 0.5) * j]; }
  function css(c) { return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; }
  function rr(a, b) { return a + R() * (b - a); }
  function pick(arr) { return arr[(R() * arr.length) | 0]; }

  // A bristled stroke: several thin parallel curves, like a loaded brush.
  function stroke(x, y, len, ang, w, col, a, bend) {
    var n = Math.max(2, Math.min(7, Math.round(w / 3.5)));
    var dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
    for (var i = 0; i < n; i++) {
      var off = ((i + 0.5) / n - 0.5) * w;
      var l = len * (0.72 + R() * 0.4);
      var sx = x + nx * off + dx * (R() - 0.5) * len * 0.2;
      var sy = y + ny * off + dy * (R() - 0.5) * len * 0.2;
      var ex = sx + dx * l, ey = sy + dy * l;
      var b = (bend || 0) * l * (0.6 + R() * 0.8);
      ctx.globalAlpha = a * (0.5 + R() * 0.5);
      ctx.strokeStyle = css(jit(col, 16));
      ctx.lineWidth = Math.max(1, (w / n) * (1.2 + R() * 0.9));
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo((sx + ex) / 2 + nx * b, (sy + ey) / 2 + ny * b, ex, ey);
      ctx.stroke();
    }
  }

  // Fill a region with strokes whose colour comes from colorAt(x, y).
  function field(o) {
    var n = o.n || 1500;
    for (var i = 0; i < n; i++) {
      var x = rr(o.x0, o.x1), y = rr(o.y0, o.y1);
      if (o.mask && !o.mask(x, y)) continue;
      var c = o.color(x, y);
      if (!c) continue;
      var ang = o.ang ? o.ang(x, y) : (R() - 0.5) * 0.3;
      stroke(x, y, rr(o.len[0], o.len[1]), ang, rr(o.w[0], o.w[1]), c, rr(o.a[0], o.a[1]), o.bend ? rr(o.bend[0], o.bend[1]) : (R() - 0.5) * 0.25);
    }
  }

  function wash(stops, y0, y1) {
    var g = ctx.createLinearGradient(0, y0, 0, y1);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, y0, W, y1 - y0);
  }

  function glow(x, y, r, col, a) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    var c = hex(col);
    g.addColorStop(0, 'rgba(' + c.join(',') + ',' + (a == null ? 0.9 : a) + ')');
    g.addColorStop(0.35, 'rgba(' + c.join(',') + ',' + (a == null ? 0.9 : a) * 0.35 + ')');
    g.addColorStop(1, 'rgba(' + c.join(',') + ',0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  function dab(x, y, r, col, a) {
    ctx.globalAlpha = a;
    ctx.fillStyle = css(jit(hex(col), 20));
    ctx.beginPath();
    ctx.ellipse(x, y, r * rr(0.7, 1.3), r * rr(0.6, 1.1), R() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ------------------------------------------------------------ components
  function sky(stops, y1, n, swirl) {
    wash(stops.map(function (s) { return [s[0], css(hex(s[1]))]; }), 0, y1);
    field({
      x0: -60, x1: W + 20, y0: -20, y1: y1, n: n || 1800,
      color: function (x, y) { return ramp(stops, y / y1); },
      ang: function (x, y) { return (swirl ? Math.sin(x / 260 + y / 180) * 0.5 : 0) + (R() - 0.5) * 0.35; },
      len: [60, 220], w: [10, 34], a: [0.25, 0.6], bend: [-0.25, 0.25]
    });
  }

  function clouds(cx, cy, rx, ry, stops, n) {
    field({
      x0: cx - rx, x1: cx + rx, y0: cy - ry, y1: cy + ry, n: n || 700,
      mask: function (x, y) { var d = ((x - cx) / rx) * ((x - cx) / rx) + ((y - cy) / ry) * ((y - cy) / ry); return d < 1 - R() * 0.35; },
      color: function (x, y) { return ramp(stops, (y - (cy - ry)) / (2 * ry)); },
      ang: function (x, y) { return Math.atan2(y - cy, x - cx) + Math.PI / 2 + (R() - 0.5) * 0.6; },
      len: [30, 110], w: [8, 26], a: [0.35, 0.8], bend: [0.1, 0.4]
    });
  }

  function flatField(stops, y0, y1, n, lenR, wR) {
    wash(stops.map(function (s) { return [s[0], css(hex(s[1]))]; }), y0, y1);
    field({
      x0: -60, x1: W + 20, y0: y0, y1: y1, n: n || 1600,
      color: function (x, y) { return ramp(stops, (y - y0) / (y1 - y0)); },
      ang: function () { return (R() - 0.5) * 0.12; },
      len: lenR || [80, 280], w: wR || [6, 22], a: [0.3, 0.7]
    });
  }

  function skyline(y, x0, x1, hMin, hMax, col, lightCol, density, tiers) {
    var x = x0;
    var base = hex(col);
    while (x < x1) {
      var w = rr(26, 90);
      var h = rr(hMin, hMax) * (tiers ? (1 - (x - x0) / (x1 - x0) * tiers) : 1);
      var top = y - h;
      field({ x0: x, x1: x + w, y0: top, y1: y, n: Math.max(6, (w * h) / 260), color: function () { return jit(base, 14); },
        ang: function () { return Math.PI / 2 + (R() - 0.5) * 0.15; }, len: [h * 0.3, h * 0.8], w: [6, 14], a: [0.6, 0.95] });
      if (R() < 0.25) { // spire or chimney
        var sx = x + w * rr(0.3, 0.7);
        stroke(sx, top, rr(20, 70), -Math.PI / 2 + (R() - 0.5) * 0.1, rr(4, 9), base, 0.9, 0);
      }
      var lights = Math.floor((w * h) / 900 * density);
      for (var i = 0; i < lights; i++) {
        var lx = rr(x + 4, x + w - 4), ly = rr(top + 6, y - 6);
        dab(lx, ly, rr(1.6, 3.4), lightCol, rr(0.5, 0.95));
        if (R() < 0.18) glow(lx, ly, rr(8, 22), lightCol, 0.25);
      }
      x += w * rr(0.7, 1.05);
    }
  }

  function shack(x, y, w, h, col, lit, roof) {
    var c = hex(col);
    field({ x0: x, x1: x + w, y0: y - h, y1: y, n: Math.max(8, (w * h) / 120), color: function () { return jit(c, 18); },
      ang: function () { return (R() < 0.5 ? 0 : Math.PI / 2) + (R() - 0.5) * 0.2; }, len: [w * 0.25, w * 0.7], w: [4, 10], a: [0.7, 1] });
    // roof
    var rc = roof ? hex(roof) : mix(c, [0, 0, 0], 0.3);
    for (var i = 0; i < 8; i++) {
      stroke(x - w * 0.08 + R() * 4, y - h - rr(0, 4), w * 0.62, -0.5 + (R() - 0.5) * 0.12, rr(5, 9), rc, 0.85, 0);
      stroke(x + w * 0.5 + R() * 4, y - h - w * 0.28 - rr(0, 4), w * 0.62, 0.5 + (R() - 0.5) * 0.12, rr(5, 9), rc, 0.85, 0);
    }
    if (lit) {
      var wx = x + w * rr(0.25, 0.6), wy = y - h * rr(0.35, 0.6);
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = css(jit(hex(lit), 20));
      ctx.fillRect(wx, wy, w * 0.2, h * 0.24);
      glow(wx + w * 0.1, wy + h * 0.12, w * 0.9, lit, 0.35);
    }
    if (R() < 0.6) { // stovepipe + smoke
      var px = x + w * rr(0.55, 0.8), py = y - h - w * 0.2;
      stroke(px, py, w * 0.3, -Math.PI / 2, 5, [40, 36, 40], 0.9, 0);
      for (var s = 0; s < 6; s++) stroke(px + s * 6 + rr(-4, 4), py - w * 0.3 - s * 12, rr(18, 40), -Math.PI / 2 + 0.6 + (R() - 0.5) * 0.4, rr(6, 14), [150, 150, 165], 0.12, 0.3);
    }
  }

  function figure(x, y, h, col, opt) {
    opt = opt || {};
    var c = hex(col);
    var headR = h * 0.075;
    var shoulder = h * (opt.wide ? 0.34 : 0.26);
    var hem = h * (opt.coat ? 0.34 : 0.22);
    for (var i = 0; i < Math.max(10, h / 3); i++) {
      var t = R();
      var yy = y - h * 0.82 + t * h * 0.78;
      var half = shoulder / 2 + (hem - shoulder) / 2 * t;
      var xx = x + rr(-half, half);
      stroke(xx, yy, h * rr(0.1, 0.3), Math.PI / 2 + (R() - 0.5) * 0.25, rr(3, 7), c, 0.85, 0);
    }
    for (var j = 0; j < 7; j++) stroke(x + rr(-headR, headR) * 0.6, y - h * 0.9 - headR + R() * headR, headR * 1.3, Math.PI / 2, headR * 0.9, c, 0.9, 0.2);
    if (opt.hat) for (var k = 0; k < 5; k++) stroke(x - headR * 1.5, y - h * 0.9 - headR * 1.1 + R() * 2, headR * 3, 0, 4, c, 0.9, 0);
    if (opt.rim) glow(x + (opt.rim > 0 ? shoulder * 0.4 : -shoulder * 0.4), y - h * 0.6, h * 0.35, opt.rimCol || '#e0a860', 0.12);
  }

  function lanternString(x0, y0, x1, y1, sag, n, cols) {
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      var x = x0 + (x1 - x0) * t;
      var y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * sag;
      var c = pick(cols);
      dab(x, y, rr(3, 5.5), c, 0.95);
      glow(x, y, rr(14, 26), c, 0.3);
    }
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = 'rgb(30,26,30)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (var j = 0; j <= 40; j++) {
      var tt = j / 40;
      var xx = x0 + (x1 - x0) * tt, yy = y0 + (y1 - y0) * tt + Math.sin(tt * Math.PI) * sag;
      if (j === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }

  function reflections(lights, y0, y1) {
    lights.forEach(function (L) {
      for (var i = 0; i < 10; i++) {
        var yy = rr(y0, y1);
        stroke(L[0] + rr(-L[2], L[2]) * 0.3, yy, rr(20, 70), (R() - 0.5) * 0.1, rr(2, 6), hex(L[3]), rr(0.12, 0.4), 0);
      }
    });
  }

  function pavilion(x, y, w, h, bright) {
    // dance hall: timber body, glazed dome, glowing
    var body = [46, 34, 44];
    glow(x + w / 2, y - h * 0.6, w * 1.1, '#f0b060', bright ? 0.55 : 0.35);
    field({ x0: x, x1: x + w, y0: y - h * 0.6, y1: y, n: 260, color: function (xx, yy) { return mix(body, [120, 70, 60], (yy - (y - h * 0.6)) / (h * 0.6) * 0.4); },
      ang: function () { return Math.PI / 2 + (R() - 0.5) * 0.1; }, len: [20, 60], w: [6, 14], a: [0.7, 1] });
    // windows
    for (var i = 0; i < 9; i++) {
      var wx = x + w * (0.07 + i * 0.1);
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = css(jit([250, 200, 120], 20));
      ctx.fillRect(wx, y - h * 0.45, w * 0.05, h * 0.25);
      glow(wx + w * 0.025, y - h * 0.33, w * 0.12, '#ffc070', 0.3);
    }
    // dome
    var cx = x + w / 2, cy = y - h * 0.6;
    field({ x0: x + w * 0.1, x1: x + w * 0.9, y0: cy - h * 0.5, y1: cy, n: 320,
      mask: function (xx, yy) { var d = ((xx - cx) / (w * 0.4)) * ((xx - cx) / (w * 0.4)) + ((yy - cy) / (h * 0.5)) * ((yy - cy) / (h * 0.5)); return d < 1; },
      color: function (xx, yy) { return mix([255, 214, 150], [200, 120, 90], (cy - yy) / (h * 0.5)); },
      ang: function (xx, yy) { return Math.atan2(yy - cy, xx - cx) + Math.PI / 2; }, len: [16, 50], w: [5, 12], a: [0.5, 0.95] });
    glow(cx, cy - h * 0.2, w * 0.45, '#fff0c0', 0.6);
    stroke(cx, cy - h * 0.5, h * 0.25, -Math.PI / 2, 5, [60, 40, 40], 0.9, 0);
  }

  function chandelier(x, y, r, a) {
    glow(x, y, r * 3.2, '#ffcf80', 0.45 * (a || 1));
    glow(x, y, r * 1.2, '#fff4d8', 0.75 * (a || 1));
    for (var i = 0; i < 220; i++) {
      var ang = rr(0, Math.PI);
      var rad = rr(0.2, 1) * r;
      var px = x + Math.cos(ang) * rad * 1.4, py = y + Math.sin(ang) * rad * 0.7;
      stroke(px, py, rr(10, 36), Math.PI / 2 + (R() - 0.5) * 0.2, rr(1.5, 3.5), pick([[255, 244, 214], [210, 230, 240], [255, 210, 150]]), rr(0.4, 0.9), 0);
    }
    for (var j = 0; j < 40; j++) dab(x + rr(-r * 1.3, r * 1.3), y + rr(-r * 0.2, r * 0.8), rr(1.5, 3), '#ffffff', 0.9);
    stroke(x, y - r * 2, r * 1.6, Math.PI / 2, 3, [60, 50, 40], 0.8, 0);
  }

  function interior(wallStops, floorY, floorStops, n) {
    sky(wallStops, floorY, n || 1400, false);
    flatField(floorStops, floorY, H, 900, [60, 200], [8, 22]);
  }

  function stove(x, y, s) {
    var c = [34, 28, 30];
    field({ x0: x - s * 0.5, x1: x + s * 0.5, y0: y - s * 1.1, y1: y, n: 60, color: function () { return jit(c, 12); },
      ang: function () { return Math.PI / 2; }, len: [s * 0.3, s * 0.7], w: [5, 10], a: [0.8, 1] });
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = 'rgb(255,140,50)';
    ctx.fillRect(x - s * 0.25, y - s * 0.55, s * 0.5, s * 0.25);
    glow(x, y - s * 0.45, s * 2.6, '#ff8a3c', 0.5);
    stroke(x + s * 0.2, y - s * 1.1, s * 1.6, -Math.PI / 2, 7, c, 0.9, 0);
  }

  function lanternHang(x, y, s, col) {
    stroke(x, y - s * 3, s * 2.4, Math.PI / 2, 2, [40, 36, 36], 0.8, 0);
    dab(x, y, s * 0.6, col || '#ffd27a', 0.95);
    glow(x, y, s * 7, col || '#ffc060', 0.55);
  }

  function snowFloor(y0, stops) { flatField(stops, y0, H, 1400, [60, 240], [6, 20]); }

  function handShape(x, y, s, col, a) {
    var c = hex(col);
    // palm
    for (var i = 0; i < 26; i++) stroke(x + rr(-s * 0.35, s * 0.35), y + rr(-s * 0.2, s * 0.35), s * rr(0.2, 0.45), Math.PI / 2 + (R() - 0.5) * 0.4, rr(4, 9), c, a, 0.1);
    // fingers
    [-0.34, -0.14, 0.06, 0.26].forEach(function (fx, k) {
      var len = s * [0.62, 0.78, 0.74, 0.6][k];
      for (var j = 0; j < 5; j++) stroke(x + fx * s + rr(-2, 2), y - s * 0.2, len, -Math.PI / 2 + fx * 0.25 + (R() - 0.5) * 0.08, rr(3, 6), c, a, 0);
    });
    for (var t = 0; t < 5; t++) stroke(x + s * 0.42, y + s * 0.1, s * 0.45, -Math.PI / 2 + 0.9 + (R() - 0.5) * 0.1, rr(3, 6), c, a, 0);
  }

  function face(x, y, s) {
    // hair crown floating
    for (var i = 0; i < 140; i++) {
      var ang = rr(0, Math.PI * 2);
      stroke(x + Math.cos(ang) * s * 0.5, y + Math.sin(ang) * s * 0.6, s * rr(0.3, 0.8), ang + (R() - 0.5) * 0.4, rr(1.5, 3.5), pick([[150, 156, 160], [110, 118, 124], [190, 196, 198]]), rr(0.3, 0.7), 0.2);
    }
    for (var j = 0; j < 90; j++) {
      var a2 = rr(0, Math.PI * 2), d = Math.sqrt(R());
      stroke(x + Math.cos(a2) * s * 0.42 * d, y + Math.sin(a2) * s * 0.55 * d, s * rr(0.1, 0.25), Math.PI / 2 + (R() - 0.5) * 0.5, rr(4, 9), pick([[196, 170, 152], [170, 140, 128], [214, 200, 186], [150, 120, 118]]), rr(0.55, 0.9), 0.1);
    }
    // eyes, nose shadow, mouth
    dab(x - s * 0.15, y - s * 0.08, s * 0.05, '#3a3438', 0.8);
    dab(x + s * 0.15, y - s * 0.08, s * 0.05, '#3a3438', 0.8);
    stroke(x, y - s * 0.02, s * 0.16, Math.PI / 2, 4, [120, 96, 94], 0.55, 0);
    stroke(x - s * 0.1, y + s * 0.24, s * 0.2, 0, 3, [110, 80, 86], 0.6, 0);
    // chin marks
    for (var k = -1; k <= 1; k++) stroke(x + k * s * 0.06, y + s * 0.36, s * 0.08, Math.PI / 2, 2, [80, 110, 150], 0.7, 0);
  }

  function iceOver(n, a) {
    // translucent strokes over everything, like looking through black ice
    field({ x0: -40, x1: W + 20, y0: -20, y1: H + 20, n: n || 500,
      color: function () { return pick([[40, 70, 86], [70, 110, 124], [20, 36, 48], [130, 170, 180]]); },
      ang: function () { return (R() - 0.5) * 0.6; }, len: [60, 260], w: [4, 18], a: [0.05, a || 0.22] });
    for (var i = 0; i < 90; i++) dab(rr(0, W), rr(0, H), rr(1, 3), '#d8f0f4', rr(0.2, 0.6));
  }

  function steam(x, y, h, n) {
    for (var i = 0; i < (n || 60); i++) {
      var t = R();
      stroke(x + rr(-40, 40) + Math.sin(t * 6) * 30 * t, y - t * h, rr(30, 90), -Math.PI / 2 + (R() - 0.5) * 1.2, rr(10, 30), pick([[200, 210, 205], [160, 170, 168], [230, 230, 220]]), rr(0.08, 0.25) * (1 - t * 0.6), 0.4);
    }
  }

  function floes(y0, y1, n, lit) {
    for (var i = 0; i < n; i++) {
      var x = rr(-50, W), y = rr(y0, y1);
      var s = rr(40, 160) * (0.4 + (y - y0) / (y1 - y0));
      var c = pick([[150, 170, 180], [120, 140, 156], [190, 200, 206]]);
      ctx.globalAlpha = rr(0.6, 0.9);
      ctx.fillStyle = css(jit(c, 18));
      ctx.beginPath();
      var k = 5 + ((R() * 3) | 0);
      for (var j = 0; j < k; j++) {
        var a = (j / k) * Math.PI * 2;
        var px = x + Math.cos(a) * s * rr(0.6, 1.1), py = y + Math.sin(a) * s * 0.3 * rr(0.6, 1.1);
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      if (lit && R() < 0.35) { dab(x, y - s * 0.12, 4, '#ffcf7a', 0.95); glow(x, y - s * 0.12, 30, '#ffb85c', 0.35); }
    }
  }

  function vignette(a) {
    var g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(6,6,12,' + (a == null ? 0.6 : a) + ')');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function grain() {
    for (var i = 0; i < 1400; i++) {
      ctx.globalAlpha = R() * 0.07;
      ctx.fillStyle = R() < 0.5 ? '#000' : '#fff';
      ctx.fillRect(R() * W, R() * H, 1 + R() * 2, 1 + R() * 2);
    }
  }

  // ------------------------------------------------------------ scenes
  var NIGHT = [[0, '#0d1024'], [0.35, '#1f1f4a'], [0.62, '#4b2f5e'], [0.85, '#a0525a'], [1, '#d88a5a']];
  var ICE = [[0, '#3b4a66'], [0.3, '#2a3550'], [1, '#141a2a']];

  var SCENES = {
    title: function () {
      sky(NIGHT, 560, 2400, true);
      clouds(980, 330, 420, 170, [[0, '#2e2a5a'], [0.5, '#c3665a'], [1, '#f2b070']], 1100);
      clouds(420, 180, 300, 90, [[0, '#1c1c44'], [1, '#6a3f6a']], 500);
      skyline(560, -20, 700, 60, 260, '#191629', '#f3c77a', 1.2, 0.6);
      flatField(ICE, 560, H, 1800);
      for (var i = 0; i < 16; i++) shack(900 + i * 26 + rr(-8, 8), 572 + rr(-4, 6), rr(22, 34), rr(16, 28), pick(['#2a2436', '#352838', '#2d2a3c']), R() < 0.8 ? '#ffc877' : null);
      pavilion(1040, 580, 180, 110, true);
      glow(1130, 520, 380, '#ffb65c', 0.35);
      reflections([[1130, 600, 100, '#ffc070'], [300, 600, 200, '#f0b870']], 600, 900);
      figure(560, 820, 70, '#0d0c14', { coat: true });
      vignette(0.7);
    },
    dream: function () {
      wash([[0, '#07060e'], [0.5, '#130f24'], [1, '#050409']], 0, H);
      field({ x0: 0, x1: W, y0: 0, y1: H, n: 1800, color: function (x, y) { return ramp([[0, '#2a1f4a'], [0.4, '#18132e'], [1, '#0b0a14']], y / H); },
        ang: function (x, y) { return Math.atan2(y - 300, x - 800) + Math.PI / 2; }, len: [80, 260], w: [8, 30], a: [0.15, 0.5], bend: [0.1, 0.4] });
      glow(800, 170, 420, '#6c55b0', 0.35);
      flatField([[0, '#1a2336'], [1, '#0e1422']], 0, 190, 500);
      handShape(800, 260, 140, '#cfd8e6', 0.55);
      glow(800, 240, 160, '#c8d8ff', 0.25);
      iceOver(400, 0.18);
      vignette(0.85);
    },
    crossing: function () {
      sky(NIGHT, 520, 2200, true);
      clouds(1180, 360, 300, 110, [[0, '#2b2750'], [1, '#b0605c']], 700);
      skyline(520, -40, 620, 80, 300, '#171427', '#f0c070', 1.4, 0.7);
      flatField(ICE, 520, H, 2000);
      for (var i = 0; i < 14; i++) shack(1180 + i * 18 + rr(-6, 6), 528, rr(14, 22), rr(10, 18), '#2a2436', R() < 0.8 ? '#ffc877' : null);
      glow(1300, 505, 260, '#ffb65c', 0.4);
      reflections([[1300, 560, 120, '#ffc070'], [300, 560, 260, '#f0b870']], 560, 880);
      // sleigh and horse
      figure(760, 860, 90, '#0c0b12', { wide: true, coat: true });
      field({ x0: 640, x1: 900, y0: 840, y1: 900, n: 80, color: function () { return [16, 14, 22]; }, ang: function () { return 0; }, len: [40, 120], w: [6, 12], a: [0.8, 1] });
      figure(960, 880, 110, '#0c0b12', { wide: true });
      vignette(0.65);
    },
    gate: function () {
      sky([[0, '#0b0e22'], [0.6, '#261f45'], [1, '#43304f']], 520, 1500, true);
      skyline(520, -20, W + 20, 30, 90, '#1c1a2c', '#ffc36e', 2.2, 0);
      for (var i = 0; i < 24; i++) shack(rr(-20, W), 540 + rr(-10, 20), rr(40, 80), rr(34, 60), pick(['#2c2436', '#3a2c3a', '#252a3c']), R() < 0.7 ? '#ffc877' : null);
      snowFloor(540, [[0, '#4a4f6e'], [0.4, '#343a58'], [1, '#1a1e30']]);
      // arch of glowing ice blocks
      for (var b = 0; b < 26; b++) {
        var t = b / 25;
        var ang = Math.PI * t;
        var ax = 800 - Math.cos(ang) * 300, ay = 900 - Math.sin(ang) * 380;
        field({ x0: ax - 42, x1: ax + 42, y0: ay - 36, y1: ay + 36, n: 30, color: function () { return pick([[180, 230, 240], [240, 220, 170], [140, 200, 220]]); },
          ang: function () { return ang + (R() - 0.5) * 0.4; }, len: [20, 50], w: [8, 18], a: [0.5, 0.9] });
        glow(ax, ay, 60, R() < 0.5 ? '#ffd890' : '#9fe2f2', 0.35);
      }
      lanternString(420, 470, 1180, 470, 60, 18, ['#ffcf7a', '#ff9a6a', '#f4e0a0']);
      figure(820, 930, 150, '#15131d', { coat: true, hat: true, rim: 1 });
      vignette(0.6);
    },
    glass: function () {
      sky([[0, '#0b0d20'], [0.5, '#221d44'], [0.85, '#4a2e52'], [1, '#6d3a4e']], 470, 1800, true);
      clouds(900, 250, 360, 100, [[0, '#231f48'], [1, '#6a3d5c']], 500);
      skyline(470, -30, 500, 60, 200, '#171427', '#f0c070', 1.2, 0.5);
      snowFloor(470, [[0, '#3e4564'], [0.4, '#2c3350'], [1, '#141a2a']]);
      for (var i = 0; i < 40; i++) {
        var y = rr(490, 760);
        var s = 0.5 + (y - 490) / 270;
        shack(rr(-40, W), y, rr(30, 60) * s, rr(24, 44) * s, pick(['#2c2436', '#3a2c3a', '#252a3c', '#30283a']), R() < 0.7 ? '#ffc877' : null);
      }
      pavilion(700, 560, 260, 150, true);
      lanternString(80, 520, 700, 470, 50, 16, ['#ffcf7a', '#ff9a6a', '#f4e0a0']);
      lanternString(960, 470, 1560, 540, 50, 16, ['#ffcf7a', '#ff9a6a', '#f4e0a0']);
      for (var f = 0; f < 9; f++) figure(rr(100, 1500), rr(820, 960), rr(90, 140), '#100e18', { coat: R() < 0.6, hat: R() < 0.4 });
      vignette(0.6);
    },
    body: function () {
      wash([[0, '#0b1218'], [1, '#05080c']], 0, H);
      field({ x0: -40, x1: W, y0: -20, y1: H, n: 1400, color: function () { return pick([[18, 30, 38], [26, 44, 54], [12, 20, 28], [36, 58, 66]]); },
        ang: function () { return (R() - 0.5) * 0.8; }, len: [60, 220], w: [8, 26], a: [0.3, 0.7] });
      face(760, 560, 230);
      handShape(1080, 360, 170, '#b8b0a8', 0.75);
      // rope trailing
      for (var r = 0; r < 30; r++) stroke(760 + r * 18, 760 + Math.sin(r / 3) * 20, 22, 0.1, 5, [120, 96, 60], 0.6, 0);
      iceOver(700, 0.28);
      // lantern ring
      [[120, 120], [1480, 140], [140, 880], [1460, 900], [800, 60], [820, 960]].forEach(function (p) { glow(p[0], p[1], 260, '#ffb65c', 0.45); dab(p[0], p[1], 8, '#ffe2a0', 0.9); });
      // crowd boots at top
      for (var b = 0; b < 12; b++) figure(rr(0, W), rr(0, 60), 160, '#07070b', { coat: true });
      vignette(0.75);
    },
    chandelier: function () {
      interior([[0, '#2a1622'], [0.5, '#5a2c34'], [1, '#8a4c3c']], 640, [[0, '#6a3a30'], [0.3, '#3e2226'], [1, '#1c1216']]);
      for (var c = 0; c < 8; c++) stroke(100 + c * 200, 0, 640, Math.PI / 2, 22, [70, 34, 40], 0.5, 0);
      chandelier(800, 230, 150, 1);
      reflections([[800, 700, 200, '#ffcf80']], 660, 900);
      for (var i = 0; i < 5; i++) figure(260 + i * 60, 700, 120, '#1a0e12', { coat: true });
      figure(1180, 720, 150, '#140c10', { hat: false, rim: -1 });
      for (var g = 0; g < 30; g++) dab(rr(0, W), rr(40, 200), rr(2, 4), pick(['#ffd27a', '#ff9a6a']), 0.8);
      vignette(0.6);
    },
    ballroom: function () {
      interior([[0, '#2a1420'], [0.5, '#6a2c34'], [1, '#a8563e']], 620, [[0, '#7a4232'], [0.3, '#4a2626'], [1, '#1c1216']]);
      chandelier(800, 200, 170, 1.2);
      for (var i = 0; i < 26; i++) {
        var y = rr(640, 940), s = 0.6 + (y - 640) / 300;
        figure(rr(40, W - 40), y, 120 * s, pick(['#1a0e14', '#2a1018', '#140a10', '#3a1420']), { coat: R() < 0.6, rim: R() < 0.5 ? 1 : -1 });
      }
      // the crack
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = 'rgb(10,10,16)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      var x = -10, y2 = 900;
      ctx.moveTo(x, y2);
      while (x < W + 20) { x += rr(30, 80); y2 += rr(-30, 20); ctx.lineTo(x, y2); }
      ctx.stroke();
      glow(800, 880, 400, '#7fd0e0', 0.08);
      vignette(0.6);
    },
    hut: function () {
      interior([[0, '#1a1418'], [0.6, '#3a2a24'], [1, '#4a3428']], 700, [[0, '#4a3a30'], [1, '#1a1412']]);
      for (var p = 0; p < 7; p++) stroke(0, 120 + p * 90, W, 0.01, 18, [60, 44, 36], 0.3, 0);
      stove(260, 700, 120);
      lanternHang(820, 260, 14);
      // flags
      [[1100, 300, '#3a6ab0'], [1160, 290, '#b03a3a'], [1220, 310, '#3a6ab0'], [1290, 300, '#d0c060']].forEach(function (f) {
        stroke(f[0], f[1], 300, Math.PI / 2 + 0.05, 4, [80, 60, 44], 0.9, 0);
        field({ x0: f[0], x1: f[0] + 60, y0: f[1], y1: f[1] + 40, n: 14, color: function () { return hex(f[2]); }, ang: function () { return 0; }, len: [20, 50], w: [6, 12], a: [0.7, 1] });
      });
      // the hole in the floor
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgb(6,10,14)';
      ctx.beginPath(); ctx.ellipse(800, 860, 190, 60, 0, 0, Math.PI * 2); ctx.fill();
      field({ x0: 600, x1: 1000, y0: 790, y1: 930, n: 90, mask: function (x, y) { var d = ((x - 800) / 200) * ((x - 800) / 200) + ((y - 860) / 70) * ((y - 860) / 70); return d > 0.75 && d < 1.2; },
        color: function () { return pick([[180, 210, 220], [140, 170, 186]]); }, ang: function (x, y) { return Math.atan2(y - 860, x - 800) + Math.PI / 2; }, len: [20, 50], w: [4, 10], a: [0.5, 0.9] });
      glow(800, 860, 140, '#3a6070', 0.25);
      // rope coil
      for (var r = 0; r < 60; r++) { var a = r * 0.5; stroke(1180 + Math.cos(a) * (40 - r * 0.4), 840 + Math.sin(a) * (16 - r * 0.15), 18, a + 1.6, 4, [140, 110, 70], 0.7, 0); }
      figure(520, 860, 150, '#120e10', { rim: 1, rimCol: '#ff8a3c' });
      vignette(0.65);
    },
    cutters: function () {
      interior([[0, '#140f14'], [0.6, '#2e1f22'], [1, '#442a24']], 680, [[0, '#3a2a24'], [1, '#120c0c']]);
      // saws on the wall
      for (var s = 0; s < 5; s++) {
        var sx = 180 + s * 300, sy = 250;
        for (var k = 0; k < 40; k++) { var a = Math.PI * (k / 39); stroke(sx + Math.cos(a) * 110, sy - Math.sin(a) * 40 + 60, 20, a + Math.PI / 2, 5, [150, 150, 158], 0.7, 0); }
        for (var t = 0; t < 22; t++) stroke(sx - 110 + t * 10, sy + 60, 12, Math.PI / 2, 3, [180, 180, 186], 0.8, 0);
      }
      [[300, 760], [1250, 780]].forEach(function (b) { glow(b[0], b[1] - 40, 300, '#ff6a2a', 0.55); dab(b[0], b[1] - 20, 30, '#ffb060', 0.9); });
      for (var i = 0; i < 14; i++) figure(rr(80, 1520), rr(760, 900), rr(150, 210), pick(['#140c0c', '#1c1010', '#221210']), { wide: true, rim: R() < 0.5 ? 1 : -1, rimCol: '#ff7a3c' });
      vignette(0.65);
    },
    works: function () {
      sky([[0, '#0a0f14'], [0.5, '#1a2a2a'], [1, '#3a4a3a']], 560, 1500, false);
      // factory
      field({ x0: 180, x1: 1100, y0: 260, y1: 560, n: 700, color: function () { return pick([[70, 40, 36], [58, 34, 32], [84, 50, 42]]); }, ang: function () { return (R() < 0.5 ? 0 : Math.PI / 2); }, len: [20, 70], w: [6, 14], a: [0.7, 1] });
      field({ x0: 800, x1: 900, y0: 40, y1: 300, n: 200, color: function () { return pick([[60, 36, 34], [80, 46, 40]]); }, ang: function () { return Math.PI / 2; }, len: [30, 90], w: [6, 12], a: [0.8, 1] });
      steam(850, 60, 420, 120);
      for (var i = 0; i < 14; i++) { var wx = 220 + i * 60; ctx.globalAlpha = 0.9; ctx.fillStyle = css(jit([190, 230, 200], 20)); ctx.fillRect(wx, 360, 26, 60); glow(wx + 13, 390, 60, '#c8f0d0', 0.25); }
      flatField([[0, '#2a3440'], [1, '#101820']], 560, H, 1400);
      // open black water at the outfall, steaming
      ctx.globalAlpha = 1; ctx.fillStyle = 'rgb(4,8,10)';
      ctx.beginPath(); ctx.ellipse(1200, 700, 360, 90, -0.08, 0, Math.PI * 2); ctx.fill();
      for (var p = 0; p < 18; p++) stroke(980 + p * 12, 600 + p * 4, 40, 0.3, 26, [50, 50, 56], 0.9, 0);
      steam(1200, 700, 300, 140);
      reflections([[1200, 700, 200, '#c8f0d0']], 660, 760);
      figure(560, 880, 170, '#0c0e10', { coat: true, rim: 1, rimCol: '#c8f0d0' });
      vignette(0.65);
    },
    chapel: function () {
      interior([[0, '#1e140e'], [0.5, '#4a3020'], [1, '#6a4428']], 700, [[0, '#4a3222'], [1, '#150e0a']], 1200);
      for (var i = 0; i < 12; i++) stroke(i * 140, 0, 700, Math.PI / 2 + 0.2, 30, [90, 60, 34], 0.25, 0);
      for (var k = 0; k < 320; k++) {
        var x = rr(40, W - 40), y = rr(260, 690);
        dab(x, y, rr(1.5, 3.2), pick(['#ffd27a', '#ffb050', '#fff0c0']), 0.95);
        if (R() < 0.3) glow(x, y, rr(10, 26), '#ffb050', 0.22);
      }
      // trestle with a draped body
      field({ x0: 560, x1: 1060, y0: 740, y1: 800, n: 140, color: function () { return pick([[220, 214, 200], [196, 190, 178], [240, 234, 220]]); }, ang: function () { return (R() - 0.5) * 0.2; }, len: [40, 120], w: [6, 16], a: [0.7, 1] });
      // the raised hand under the sheet
      field({ x0: 900, x1: 960, y0: 620, y1: 760, n: 40, color: function () { return [224, 218, 206]; }, ang: function () { return -Math.PI / 2; }, len: [30, 80], w: [6, 12], a: [0.7, 1] });
      stroke(580, 800, 120, Math.PI / 2, 8, [60, 40, 26], 0.9, 0);
      stroke(1040, 800, 120, Math.PI / 2, 8, [60, 40, 26], 0.9, 0);
      figure(400, 900, 170, '#1a1010', { coat: true, rim: 1 });
      vignette(0.6);
    },
    mending: function () {
      interior([[0, '#1c1216'], [0.6, '#3a2430'], [1, '#4c3036']], 690, [[0, '#3a2a2a'], [1, '#140c0e']]);
      for (var i = 0; i < 16; i++) {
        var x = 120 + i * 90, col = pick([[150, 50, 60], [60, 80, 140], [180, 150, 80], [80, 120, 90], [140, 100, 140]]);
        field({ x0: x, x1: x + 60, y0: 60, y1: rr(260, 460), n: 30, color: function () { return jit(col, 24); }, ang: function () { return Math.PI / 2 + (R() - 0.5) * 0.1; }, len: [40, 140], w: [8, 18], a: [0.6, 0.95] });
      }
      lanternHang(900, 300, 12);
      stove(1320, 700, 100);
      figure(760, 860, 170, '#140c10', { wide: true, rim: 1 });
      field({ x0: 900, x1: 1100, y0: 740, y1: 800, n: 60, color: function () { return [30, 26, 30]; }, ang: function () { return 0; }, len: [30, 80], w: [6, 12], a: [0.8, 1] });
      vignette(0.6);
    },
    booth: function () {
      interior([[0, '#0c1410'], [0.6, '#1c3024'], [1, '#243a2c']], 700, [[0, '#2a2a22'], [1, '#0c0c0a']]);
      glow(820, 500, 380, '#d8e8a0', 0.4);
      field({ x0: 700, x1: 940, y0: 420, y1: 470, n: 50, color: function () { return [40, 90, 60]; }, ang: function () { return 0; }, len: [40, 90], w: [8, 14], a: [0.8, 1] });
      for (var s = 0; s < 6; s++) field({ x0: 300 + s * 30, x1: 300 + s * 30 + 26, y0: 700 - rr(160, 360), y1: 700, n: 20, color: function () { return pick([[120, 90, 60], [90, 60, 40], [150, 120, 80]]); }, ang: function () { return Math.PI / 2; }, len: [30, 90], w: [8, 14], a: [0.7, 1] });
      ctx.globalAlpha = 0.9; ctx.fillStyle = 'rgb(20,28,50)'; ctx.fillRect(1120, 180, 260, 300);
      for (var f = 0; f < 60; f++) dab(rr(1120, 1380), rr(180, 480), rr(1, 2.5), '#e8eef8', 0.8);
      figure(820, 780, 190, '#0a0e0c', { coat: true, rim: 1, rimCol: '#d8e8a0' });
      vignette(0.6);
    },
    watch: function () {
      interior([[0, '#10141c'], [0.6, '#222c3a'], [1, '#2c3444']], 700, [[0, '#2a2e36'], [1, '#0c0e12']]);
      stove(1200, 700, 110);
      // bell
      field({ x0: 360, x1: 520, y0: 220, y1: 380, n: 90, mask: function (x, y) { return Math.abs(x - 440) < 40 + (y - 220) * 0.4; }, color: function () { return pick([[180, 140, 70], [210, 170, 90], [140, 100, 50]]); }, ang: function () { return Math.PI / 2; }, len: [20, 60], w: [6, 12], a: [0.7, 1] });
      glow(440, 320, 160, '#ffd080', 0.2);
      // portrait frame
      ctx.globalAlpha = 0.9; ctx.strokeStyle = 'rgb(160,120,60)'; ctx.lineWidth = 10; ctx.strokeRect(760, 160, 180, 230);
      figure(850, 390, 180, '#3a3040', {});
      figure(640, 880, 170, '#0e1016', { coat: true, hat: true, rim: -1, rimCol: '#ff9a50' });
      vignette(0.6);
    },
    under: function () {
      wash([[0, '#2a4a40'], [0.3, '#0e2622'], [1, '#020607']], 0, H);
      // candle ice columns
      for (var i = 0; i < 260; i++) {
        var x = rr(-20, W + 20);
        stroke(x, rr(0, 40), rr(120, 320), Math.PI / 2 + (R() - 0.5) * 0.06, rr(4, 12), pick([[190, 230, 226], [150, 200, 196], [230, 246, 240], [110, 170, 170]]), rr(0.25, 0.7), 0);
      }
      glow(760, 60, 520, '#ffd070', 0.45);
      // dancers' shadows above
      for (var d = 0; d < 12; d++) dab(rr(400, 1200), rr(10, 60), rr(18, 34), '#0a1412', 0.6);
      // light shafts
      for (var s = 0; s < 9; s++) {
        var sx = rr(300, 1300);
        field({ x0: sx - 30, x1: sx + 30, y0: 260, y1: 900, n: 30, color: function () { return [150, 200, 170]; }, ang: function () { return Math.PI / 2 + 0.12; }, len: [100, 300], w: [10, 30], a: [0.03, 0.1] });
      }
      for (var b = 0; b < 140; b++) dab(rr(0, W), rr(300, H), rr(1, 4), '#bfe8e0', rr(0.1, 0.5));
      handShape(1180, 520, 70, '#9aaeb0', 0.4);
      glow(1180, 520, 120, '#a0c8c8', 0.12);
      vignette(0.8);
    },
    break: function () {
      sky([[0, '#0a1024'], [0.6, '#1e2a48'], [0.9, '#4a4060'], [1, '#8a5a60']], 460, 1600, true);
      skyline(460, -20, 560, 60, 220, '#141426', '#f0c070', 0.8, 0.5);
      flatField([[0, '#101a2a'], [1, '#04060c']], 460, H, 1400);
      floes(480, 960, 42, true);
      // the Chandelier, tilting, going down with its lights on
      ctx.save();
      ctx.translate(980, 620); ctx.rotate(0.22); ctx.translate(-980, -620);
      pavilion(860, 640, 240, 150, true);
      ctx.restore();
      glow(980, 660, 420, '#ffb050', 0.3);
      reflections([[980, 700, 160, '#ffc070']], 660, 960);
      vignette(0.7);
    },
    shore: function () {
      sky([[0, '#1a2440'], [0.5, '#4a4a6a'], [0.8, '#a07078'], [1, '#e0a880']], 470, 1600, true);
      flatField([[0, '#3a4660'], [1, '#141a28']], 470, 640, 800);
      floes(480, 630, 30, false);
      snowFloor(640, [[0, '#4a4450'], [1, '#18141a']]);
      [[300, 820], [900, 860], [1350, 800]].forEach(function (f) { glow(f[0], f[1] - 40, 260, '#ff8030', 0.55); dab(f[0], f[1] - 20, 22, '#ffc070', 0.9); });
      for (var i = 0; i < 22; i++) figure(rr(40, W - 40), rr(760, 980), rr(110, 190), pick(['#140e12', '#1a1216', '#221418']), { coat: true, wide: R() < 0.4, rim: R() < 0.5 ? 1 : -1, rimCol: '#ff8a40' });
      vignette(0.6);
    },
    dawn: function () {
      sky([[0, '#2a3a60'], [0.4, '#7a6a8a'], [0.7, '#e0a080'], [1, '#ffd8a0']], 540, 2000, true);
      glow(820, 540, 520, '#ffe0a0', 0.7);
      glow(820, 540, 160, '#fff6e0', 0.95);
      clouds(420, 300, 320, 70, [[0, '#6a5a80'], [1, '#f0b090']], 500);
      clouds(1220, 260, 300, 60, [[0, '#6a5a80'], [1, '#f8c8a0']], 500);
      flatField([[0, '#c89080'], [0.3, '#5a5a70'], [1, '#1a2032']], 540, H, 1800);
      reflections([[820, 560, 60, '#ffe0a0']], 560, 980);
      floes(580, 900, 18, false);
      for (var g = 0; g < 7; g++) { var gx = rr(300, 1300), gy = rr(160, 360); stroke(gx, gy, 16, -0.4, 2, [40, 40, 50], 0.8, 0.3); stroke(gx, gy, 16, Math.PI + 0.4, 2, [40, 40, 50], 0.8, -0.3); }
      figure(620, 980, 150, '#1a1418', { coat: true });
      figure(700, 985, 130, '#1a1418', { coat: true });
      vignette(0.45);
    },
    black: function () {
      wash([[0, '#050508'], [1, '#0c0a14']], 0, H);
      field({ x0: 0, x1: W, y0: 0, y1: H, n: 600, color: function () { return pick([[20, 16, 34], [12, 12, 20], [30, 22, 44]]); }, len: [80, 260], w: [8, 30], a: [0.2, 0.5] });
      vignette(0.9);
    }
  };
  SCENES.letter = SCENES.shore;

  // ------------------------------------------------------------ display
  var canvases = [], front = 0, cache = {}, cacheOrder = [];

  function paint(key) {
    if (cache[key]) return cache[key];
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    ctx = cv.getContext('2d');
    R = rng(hash(key));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    (SCENES[key] || SCENES.black)();
    grain();
    ctx.globalAlpha = 1;
    cache[key] = cv;
    cacheOrder.push(key);
    if (cacheOrder.length > 4) delete cache[cacheOrder.shift()];
    return cv;
  }

  C.painter = {
    init: function (a, b) {
      canvases = [a, b];
      a.width = b.width = W;
      a.height = b.height = H;
    },
    show: function (key) {
      if (!canvases.length) return;
      var run = function () {
        var src = paint(key);
        var back = canvases[1 - front];
        var bctx = back.getContext('2d');
        bctx.globalAlpha = 1;
        bctx.drawImage(src, 0, 0);
        back.classList.add('on');
        canvases[front].classList.remove('on');
        front = 1 - front;
      };
      requestAnimationFrame(run);
    },
    scenes: Object.keys(SCENES)
  };

  // ------------------------------------------------------------ weather
  var wcv, wctx, flakes = [], mode = null, raf = null;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() {
    if (!wcv) return;
    var r = wcv.getBoundingClientRect();
    wcv.width = Math.max(1, r.width | 0);
    wcv.height = Math.max(1, r.height | 0);
  }
  function tick() {
    raf = null;
    if (!wctx || !mode || mode === 'none') { if (wctx) wctx.clearRect(0, 0, wcv.width, wcv.height); return; }
    var w = wcv.width, h = wcv.height;
    wctx.clearRect(0, 0, w, h);
    var rain = mode === 'mild';
    flakes.forEach(function (f) {
      if (rain) {
        f.y += f.s * 6; f.x += f.s * 1.2;
        wctx.globalAlpha = 0.25;
        wctx.strokeStyle = '#b8c8d8';
        wctx.lineWidth = 1;
        wctx.beginPath(); wctx.moveTo(f.x, f.y); wctx.lineTo(f.x - 3, f.y - 14); wctx.stroke();
      } else {
        f.y += f.s; f.x += Math.sin((f.y + f.p) / 40) * 0.4 + 0.2;
        wctx.globalAlpha = 0.7;
        wctx.fillStyle = '#eef2f8';
        wctx.beginPath(); wctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); wctx.fill();
      }
      if (f.y > h + 10) { f.y = -10; f.x = Math.random() * w; }
      if (f.x > w + 10) f.x = -10;
    });
    if (!still && !document.hidden) raf = requestAnimationFrame(tick);
  }
  C.weather = {
    init: function (cv) {
      wcv = cv;
      wctx = cv.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      document.addEventListener('visibilitychange', function () { if (!document.hidden && !raf) tick(); });
      for (var i = 0; i < 110; i++) flakes.push({ x: Math.random() * 1600, y: Math.random() * 1000, r: 0.6 + Math.random() * 1.8, s: 0.3 + Math.random() * 0.9, p: Math.random() * 400 });
    },
    set: function (m) {
      mode = m || 'none';
      resize();
      if (!raf) tick();
    }
  };
})();
