/* CANDLE ICE — procedural sound: wind, singing ice, a distant waltz. */
(function () {
  'use strict';
  var C = (window.CANDLE = window.CANDLE || {});
  var ac = null, master = null, enabled = false, current = null;
  var layer = null; // active ambience {stop()}
  var timers = [];

  function ensure() {
    if (ac) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0.0001;
    var comp = ac.createDynamicsCompressor();
    master.connect(comp);
    comp.connect(ac.destination);
    return true;
  }

  function noiseBuffer(kind) {
    var len = ac.sampleRate * 3;
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    return buf;
  }
  var buffers = {};
  function noise(kind) {
    if (!buffers[kind]) buffers[kind] = noiseBuffer(kind);
    var s = ac.createBufferSource();
    s.buffer = buffers[kind];
    s.loop = true;
    return s;
  }

  function wind(gainVal, freq) {
    var src = noise('white');
    var bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq || 420;
    bp.Q.value = 0.8;
    var g = ac.createGain();
    g.gain.value = gainVal;
    var lfo = ac.createOscillator();
    lfo.frequency.value = 0.07;
    var lfoG = ac.createGain();
    lfoG.gain.value = (freq || 420) * 0.45;
    lfo.connect(lfoG);
    lfoG.connect(bp.frequency);
    var lfo2 = ac.createOscillator();
    lfo2.frequency.value = 0.11;
    var lfo2G = ac.createGain();
    lfo2G.gain.value = gainVal * 0.6;
    lfo2.connect(lfo2G);
    lfo2G.connect(g.gain);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(); lfo.start(); lfo2.start();
    return function () { try { src.stop(); lfo.stop(); lfo2.stop(); } catch (e) { /* stopped */ } };
  }
  function rumble(gainVal) {
    var src = noise('brown');
    var lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 160;
    var g = ac.createGain();
    g.gain.value = gainVal;
    src.connect(lp); lp.connect(g); g.connect(master);
    src.start();
    return function () { try { src.stop(); } catch (e) { /* stopped */ } };
  }
  function drone(freqs, gainVal, type) {
    var g = ac.createGain();
    g.gain.value = gainVal;
    var lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    g.connect(lp); lp.connect(master);
    var oscs = freqs.map(function (f, i) {
      var o = ac.createOscillator();
      o.type = type || 'sine';
      o.frequency.value = f;
      o.detune.value = (i % 2 ? 1 : -1) * 6;
      o.connect(g);
      o.start();
      return o;
    });
    return function () { oscs.forEach(function (o) { try { o.stop(); } catch (e) { /* stopped */ } }); };
  }

  // The eerie laser-like "pew" of singing lake ice: a fast falling chirp with echoes.
  function sing(vol) {
    if (!ac) return;
    var t = ac.currentTime;
    for (var k = 0; k < 3; k++) {
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.type = 'sine';
      var st = t + k * 0.16;
      o.frequency.setValueAtTime(2600 + Math.random() * 1200, st);
      o.frequency.exponentialRampToValueAtTime(180 + Math.random() * 120, st + 0.5);
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime((vol || 0.05) / (k + 1), st + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.6);
      o.connect(g); g.connect(master);
      o.start(st); o.stop(st + 0.7);
    }
  }
  function knock() {
    if (!ac) return;
    var t = ac.currentTime;
    for (var i = 0; i < 3; i++) {
      var s = noise('white');
      var bp = ac.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 180; bp.Q.value = 3;
      var g = ac.createGain();
      var st = t + i * 0.42;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(0.9, st + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.14);
      s.connect(bp); bp.connect(g); g.connect(master);
      s.start(st); s.stop(st + 0.2);
    }
  }
  function crack() {
    if (!ac) return;
    var t = ac.currentTime;
    var s = noise('white');
    var hp = ac.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 900;
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    s.connect(hp); hp.connect(g); g.connect(master);
    s.start(t); s.stop(t + 1);
    var o = ac.createOscillator();
    var og = ac.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 1.5);
    og.gain.setValueAtTime(0.2, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300;
    o.connect(lp); lp.connect(og); og.connect(master);
    o.start(t); o.stop(t + 1.7);
  }
  function bell() {
    if (!ac) return;
    var t = ac.currentTime;
    [1, 2.02, 2.76, 4.07, 5.4].forEach(function (r, i) {
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.frequency.value = 196 * r;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25 / (i + 1), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4 - i * 0.5);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 4.2);
    });
  }
  function dice() {
    if (!ac) return;
    var t = ac.currentTime;
    for (var i = 0; i < 4; i++) {
      var s = noise('white');
      var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400 + Math.random() * 1600; bp.Q.value = 6;
      var g = ac.createGain();
      var st = t + i * 0.06 + Math.random() * 0.03;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(0.35, st + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.05);
      s.connect(bp); bp.connect(g); g.connect(master);
      s.start(st); s.stop(st + 0.08);
    }
  }

  // A small minor-key waltz, muffled as if heard through a wall.
  var WALTZ = [
    [69, 72, 76], [74, 72, 71], [69, 64, 69], [71, 72, 74],
    [76, 77, 76], [74, 72, 74], [71, 68, 71], [69, 0, 0],
    [72, 76, 79], [77, 76, 74], [72, 71, 69], [71, 72, 71],
    [69, 72, 76], [74, 71, 68], [69, 71, 72], [69, 0, 0]
  ];
  var BASS = [45, 50, 45, 52, 45, 50, 52, 45, 48, 50, 45, 52, 45, 52, 45, 45];
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function waltz(vol, cutoff) {
    var out = ac.createGain();
    out.gain.value = vol;
    var lp = ac.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = cutoff;
    out.connect(lp); lp.connect(master);
    var beat = 60 / 88;
    var next = ac.currentTime + 0.2, bar = 0, alive = true;
    function note(m, st, dur, type, v) {
      if (!m) return;
      var o = ac.createOscillator();
      var o2 = ac.createOscillator();
      var g = ac.createGain();
      o.type = type; o2.type = type;
      o.frequency.value = mtof(m); o2.frequency.value = mtof(m); o2.detune.value = 9;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(v, st + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
      o.connect(g); o2.connect(g); g.connect(out);
      o.start(st); o2.start(st); o.stop(st + dur + 0.05); o2.stop(st + dur + 0.05);
    }
    function schedule() {
      if (!alive) return;
      while (next < ac.currentTime + 0.6) {
        var i = bar % WALTZ.length;
        var mel = WALTZ[i];
        note(BASS[i], next, beat * 0.9, 'triangle', 0.22);
        note(BASS[i] + 12 + 4, next + beat, beat * 0.5, 'triangle', 0.08);
        note(BASS[i] + 12 + 7, next + beat * 2, beat * 0.5, 'triangle', 0.08);
        for (var k = 0; k < 3; k++) note(mel[k], next + k * beat, beat * 0.95, 'sawtooth', 0.05);
        next += beat * 3;
        bar++;
      }
      timers.push(setTimeout(schedule, 200));
    }
    schedule();
    return function () { alive = false; try { out.disconnect(); } catch (e) { /* gone */ } };
  }

  function every(fn, min, max) {
    var alive = true;
    function loop() {
      if (!alive) return;
      timers.push(setTimeout(function () { if (alive) { fn(); loop(); } }, min + Math.random() * (max - min)));
    }
    loop();
    return function () { alive = false; };
  }

  var PROFILES = {
    dream: function () { return [drone([55, 82.4, 110.2], 0.05), wind(0.03, 300), every(knock, 14000, 26000)]; },
    wind: function () { return [wind(0.07, 420), rumble(0.25), every(function () { sing(0.03); }, 9000, 20000)]; },
    glass: function () { return [wind(0.05, 520), rumble(0.2), waltz(0.25, 500), every(function () { sing(0.035); }, 8000, 18000)]; },
    interior: function () { return [rumble(0.18), wind(0.02, 300)]; },
    ball: function () { return [waltz(0.75, 2200), rumble(0.2), every(function () { sing(0.05); }, 6000, 12000)]; },
    under: function () { return [drone([41.2, 61.7, 82.4], 0.08), rumble(0.5), every(function () { sing(0.07); }, 4000, 9000)]; },
    break: function () { return [wind(0.1, 380), rumble(0.6), every(crack, 3000, 7000)]; },
    dawn: function () { return [drone([220, 277.2, 329.6, 440], 0.02), wind(0.03, 600)]; },
    silence: function () { return []; }
  };

  function stopLayer() {
    if (layer) layer.forEach(function (f) { f(); });
    layer = null;
    timers.forEach(clearTimeout);
    timers = [];
  }
  function startProfile(name) {
    stopLayer();
    if (!enabled || !ac || !name || !PROFILES[name]) return;
    layer = PROFILES[name]();
  }

  C.audio = {
    enable: function (on, profile) {
      enabled = !!on;
      if (enabled) {
        if (!ensure()) return;
        if (ac.state === 'suspended') ac.resume();
        master.gain.setTargetAtTime(0.7, ac.currentTime, 0.4);
        startProfile(profile || current);
      } else if (ac) {
        master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.2);
        stopLayer();
      }
    },
    set: function (name) {
      if (name === current && layer) return;
      current = name;
      if (enabled && ac) startProfile(name);
    },
    sfx: function (name) {
      if (!enabled || !ac) return;
      ({ knock: knock, crack: crack, bell: bell, dice: dice, sing: function () { sing(0.08); } }[name] || function () {})();
    }
  };
})();
