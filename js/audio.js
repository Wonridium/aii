/* CANDLE ICE — sound.
 *   Music: a small generative score, one piece per location, played on
 *          synthesised instruments (plucked strings, piano, organ, accordion,
 *          cello, music box, reed, electric piano, choir, percussion).
 *   Ambience: wind, singing ice, rain, stoves, crowds, water, machines.
 *   Effects: one per game event (checks, notes, doors, footsteps, bells...).
 *   Voices: pre-rendered inner voices, played from audio sprites.
 */
(function () {
  'use strict';
  var C = (window.CANDLE = window.CANDLE || {});
  var ac = null, master, comp, musicBus, ambBus, sfxBus, revIn, revOut;
  var enabled = false, vol = { music: 0.75, sfx: 0.9, voice: 1 };
  var songNow = null, sceneNow = null, ambNow = null;

  function ensure() {
    if (ac) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.0001;
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ac.destination);
    musicBus = ac.createGain(); musicBus.gain.value = vol.music; musicBus.connect(master);
    ambBus = ac.createGain(); ambBus.gain.value = 0.9; ambBus.connect(master);
    sfxBus = ac.createGain(); sfxBus.gain.value = vol.sfx; sfxBus.connect(master);
    // reverb from a generated impulse response
    revIn = ac.createGain(); revIn.gain.value = 1;
    var conv = ac.createConvolver();
    var len = ac.sampleRate * 2.8, ir = ac.createBuffer(2, len, ac.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = ir.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    conv.buffer = ir;
    revOut = ac.createGain(); revOut.gain.value = 0.32;
    revIn.connect(conv); conv.connect(revOut); revOut.connect(master);
    return true;
  }
  function now() { return ac.currentTime; }

  // ---------------------------------------------------------------- noise
  var nb = {};
  function noiseBuf(kind) {
    if (nb[kind]) return nb[kind];
    var len = ac.sampleRate * 2, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else if (kind === 'pink') { last = 0.97 * last + 0.03 * w; d[i] = (last * 4 + w * 0.3); } else d[i] = w;
    }
    return (nb[kind] = b);
  }
  function noise(kind, loop) { var s = ac.createBufferSource(); s.buffer = noiseBuf(kind || 'white'); s.loop = loop !== false; return s; }
  function env(g, t, a, peak, dec, sus, rel, end) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    if (sus != null) { g.gain.setTargetAtTime(peak * sus, t + a, dec / 3); g.gain.setTargetAtTime(0.0001, end, rel / 4); }
    else g.gain.setTargetAtTime(0.0001, t + a, dec / 4);
  }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function out(node, dest, wet) {
    node.connect(dest);
    if (wet) { var s = ac.createGain(); s.gain.value = wet; node.connect(s); s.connect(revIn); }
  }

  // ---------------------------------------------------------------- instruments
  var ksCache = {};
  function ksBuffer(m, bright) {
    var key = m + ':' + bright;
    if (ksCache[key]) return ksCache[key];
    var sr = ac.sampleRate, f = mtof(m), N = Math.max(2, Math.round(sr / f)), len = Math.round(sr * 2.6);
    var b = ac.createBuffer(1, len, sr), d = b.getChannelData(0), buf = new Float32Array(N);
    for (var i = 0; i < N; i++) buf[i] = Math.random() * 2 - 1;
    var damp = bright ? 0.498 : 0.4965, p = 0;
    for (var j = 0; j < len; j++) {
      var n2 = (p + 1) % N;
      var v = (buf[p] + buf[n2]) * damp;
      d[j] = buf[p];
      buf[p] = v;
      p = n2;
    }
    return (ksCache[key] = b);
  }
  var INST = {
    pluck: function (dest, t, m, dur, v) {
      var s = ac.createBufferSource(); s.buffer = ksBuffer(m, false);
      var g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.setTargetAtTime(0.0001, t + Math.max(0.5, dur), 0.4);
      var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
      s.connect(lp); lp.connect(g); out(g, dest, 0.35);
      s.start(t); s.stop(t + 3);
    },
    harp: function (dest, t, m, dur, v) {
      var s = ac.createBufferSource(); s.buffer = ksBuffer(m, true);
      var g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.setTargetAtTime(0.0001, t + 1.5, 0.6);
      s.connect(g); out(g, dest, 0.5); s.start(t); s.stop(t + 3);
    },
    piano: function (dest, t, m, dur, v) {
      var f = mtof(m), g = ac.createGain(); env(g, t, 0.005, v, 1.8 + (72 - m) * 0.02);
      [[1, 1], [2, 0.35], [3, 0.12], [4.01, 0.05]].forEach(function (p) {
        var o = ac.createOscillator(); o.frequency.value = f * p[0]; o.detune.value = (Math.random() - 0.5) * 4;
        var pg = ac.createGain(); pg.gain.value = p[1];
        o.connect(pg); pg.connect(g); o.start(t); o.stop(t + 4);
      });
      out(g, dest, 0.4);
    },
    rhodes: function (dest, t, m, dur, v) {
      var f = mtof(m), car = ac.createOscillator(), mod = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain();
      car.frequency.value = f; mod.frequency.value = f;
      mg.gain.setValueAtTime(f * 1.4, t); mg.gain.setTargetAtTime(f * 0.1, t, 0.25);
      mod.connect(mg); mg.connect(car.frequency); car.connect(g);
      env(g, t, 0.005, v, 2.2);
      out(g, dest, 0.35); car.start(t); mod.start(t); car.stop(t + 3.5); mod.stop(t + 3.5);
    },
    pad: function (dest, t, m, dur, v) {
      var g = ac.createGain(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.4;
      env(g, t, Math.min(1.8, dur * 0.4), v, 1, 0.9, 2.2, t + dur);
      [-7, 7].forEach(function (dt) { var o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + dur + 2.5); });
      lp.connect(g); out(g, dest, 0.6);
    },
    organ: function (dest, t, m, dur, v) {
      var g = ac.createGain(); env(g, t, 0.12, v, 1, 1, 0.5, t + dur);
      [[1, 1], [2, 0.5], [3, 0.3], [4, 0.18], [0.5, 0.4]].forEach(function (p) { var o = ac.createOscillator(); o.frequency.value = mtof(m) * p[0]; var pg = ac.createGain(); pg.gain.value = p[1] * 0.4; o.connect(pg); pg.connect(g); o.start(t); o.stop(t + dur + 1); });
      out(g, dest, 0.7);
    },
    accordion: function (dest, t, m, dur, v) {
      var g = ac.createGain(), bp = ac.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 2400;
      var trem = ac.createOscillator(), tg = ac.createGain(); trem.frequency.value = 5.6; tg.gain.value = v * 0.18; trem.connect(tg); tg.connect(g.gain);
      env(g, t, 0.04, v, 0.3, 0.85, 0.15, t + dur * 0.95);
      [-9, 9, 1200].forEach(function (dt, i) { var o = ac.createOscillator(); o.type = i === 2 ? 'square' : 'sawtooth'; o.frequency.value = mtof(m) * (i === 2 ? 0.5 : 1); o.detune.value = i === 2 ? 0 : dt; var og = ac.createGain(); og.gain.value = i === 2 ? 0.25 : 0.5; o.connect(og); og.connect(bp); o.start(t); o.stop(t + dur + 0.4); });
      bp.connect(g); out(g, dest, 0.3); trem.start(t); trem.stop(t + dur + 0.4);
    },
    cello: function (dest, t, m, dur, v) {
      var g = ac.createGain(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
      var o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m);
      var vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = 5; vg.gain.value = 9; vib.connect(vg); vg.connect(o.detune);
      env(g, t, Math.min(0.6, dur * 0.3), v, 1, 0.85, 0.8, t + dur);
      o.connect(lp); lp.connect(g); out(g, dest, 0.55); o.start(t); vib.start(t); o.stop(t + dur + 1.2); vib.stop(t + dur + 1.2);
    },
    musicbox: function (dest, t, m, dur, v) {
      var g = ac.createGain(); env(g, t, 0.002, v, 1.3);
      [[1, 1], [4, 0.25], [6.2, 0.08]].forEach(function (p) { var o = ac.createOscillator(); o.frequency.value = mtof(m) * p[0]; var pg = ac.createGain(); pg.gain.value = p[1]; o.connect(pg); pg.connect(g); o.start(t); o.stop(t + 2); });
      out(g, dest, 0.55);
    },
    reed: function (dest, t, m, dur, v) {
      var g = ac.createGain(), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.8;
      var o = ac.createOscillator(); o.type = 'square'; o.frequency.value = mtof(m);
      var vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = 5.5; vg.gain.value = 14; vib.connect(vg); vg.connect(o.detune);
      env(g, t, 0.08, v, 0.5, 0.8, 0.3, t + dur);
      o.connect(bp); bp.connect(g); out(g, dest, 0.45); o.start(t); vib.start(t); o.stop(t + dur + 0.5); vib.stop(t + dur + 0.5);
    },
    choir: function (dest, t, m, dur, v) {
      var g = ac.createGain(); env(g, t, Math.min(1.2, dur * 0.4), v, 1, 0.9, 1.5, t + dur);
      var o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m);
      var o2 = ac.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = mtof(m); o2.detune.value = 12;
      [[650, 6, 1], [1100, 8, 0.5], [2600, 10, 0.15]].forEach(function (fm) { var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fm[0]; bp.Q.value = fm[1]; var fg = ac.createGain(); fg.gain.value = fm[2]; o.connect(bp); o2.connect(bp); bp.connect(fg); fg.connect(g); });
      out(g, dest, 0.8); o.start(t); o2.start(t); o.stop(t + dur + 2); o2.stop(t + dur + 2);
    },
    bass: function (dest, t, m, dur, v) {
      var g = ac.createGain(); env(g, t, 0.01, v, 0.9, 0.6, 0.2, t + dur * 0.9);
      var o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m);
      var s = ac.createOscillator(); s.frequency.value = mtof(m - 12); var sg = ac.createGain(); sg.gain.value = 0.6;
      o.connect(g); s.connect(sg); sg.connect(g); out(g, dest, 0.1); o.start(t); s.start(t); o.stop(t + dur + 0.5); s.stop(t + dur + 0.5);
    },
    glass: function (dest, t, m, dur, v) {
      var g = ac.createGain(); env(g, t, 0.01, v, 3);
      [[1, 1], [2.76, 0.4], [5.4, 0.2]].forEach(function (p) { var o = ac.createOscillator(); o.frequency.value = mtof(m) * p[0]; var pg = ac.createGain(); pg.gain.value = p[1]; o.connect(pg); pg.connect(g); o.start(t); o.stop(t + 4); });
      out(g, dest, 0.9);
    },
    kick: function (dest, t, m, dur, v) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g); out(g, dest, 0.05); o.start(t); o.stop(t + 0.4);
    },
    timpani: function (dest, t, m, dur, v) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(mtof(m) * 1.2, t); o.frequency.exponentialRampToValueAtTime(mtof(m), t + 0.1);
      g.gain.setValueAtTime(v, t); g.gain.setTargetAtTime(0.0001, t + 0.05, 0.5);
      var n = noise('brown', false), ng = ac.createGain(); ng.gain.setValueAtTime(v * 0.6, t); ng.gain.setTargetAtTime(0.0001, t, 0.3);
      o.connect(g); n.connect(ng); out(g, dest, 0.5); out(ng, dest, 0.5); o.start(t); o.stop(t + 2.5); n.start(t); n.stop(t + 1.5);
    },
    brush: function (dest, t, m, dur, v) {
      var n = noise('white', false), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 5000; bp.Q.value = 0.6;
      var g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.setTargetAtTime(0.0001, t + 0.03, 0.06);
      n.connect(bp); bp.connect(g); out(g, dest, 0.2); n.start(t); n.stop(t + 0.3);
    },
    tick: function (dest, t, m, dur, v) {
      var n = noise('white', false), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 8;
      var g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      n.connect(bp); bp.connect(g); out(g, dest, 0.2); n.start(t); n.stop(t + 0.06);
    },
    clang: function (dest, t, m, dur, v) {
      var g = ac.createGain(); env(g, t, 0.002, v, 1.2);
      [1, 2.4, 3.9, 5.2].forEach(function (r, i) { var o = ac.createOscillator(); o.type = i ? 'sine' : 'triangle'; o.frequency.value = mtof(m) * r; o.connect(g); o.start(t); o.stop(t + 1.5); });
      out(g, dest, 0.3);
    }
  };

  // ---------------------------------------------------------------- the score
  // chords: [root semitone above key, quality]. quality m | M | 7 | sus | dim
  var Q = { m: [0, 3, 7], M: [0, 4, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], sus: [0, 5, 7], dim: [0, 3, 6], add9: [0, 4, 7, 14] };
  var SCALES = { minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], phryg: [0, 1, 3, 5, 7, 8, 10] };
  var AUBADE_MOTIF = [[0, 4, 1], [1, 3, 1], [2, 2, 2], [4, 4, 1], [5, 5, 1], [6, 4, 2]];

  var SONGS = {
    aubade: { bpm: 66, meter: 4, key: 50, scale: 'minor', prog: [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']], bars: 2, parts: [
      { inst: 'pluck', type: 'arp', pat: [0, 1, 2, 3, 2, 1, 2, 1], step: 0.5, oct: 12, vel: 0.28 },
      { inst: 'pad', type: 'chord', oct: 0, vel: 0.05 },
      { inst: 'bass', type: 'root', beats: [0, 2.5], oct: -12, vel: 0.22 },
      { inst: 'piano', type: 'motif', motif: AUBADE_MOTIF, every: 4, oct: 24, vel: 0.13 }
    ], amb: ['wind'] },
    aubadeMajor: { bpm: 70, meter: 4, key: 50, scale: 'major', prog: [[0, 'M'], [7, 'M'], [9, 'm'], [5, 'M']], bars: 2, parts: [
      { inst: 'pluck', type: 'arp', pat: [0, 1, 2, 3, 2, 1, 2, 1], step: 0.5, oct: 12, vel: 0.3 },
      { inst: 'pad', type: 'chord', oct: 0, vel: 0.06 },
      { inst: 'bass', type: 'root', beats: [0, 2], oct: -12, vel: 0.22 },
      { inst: 'piano', type: 'motif', motif: AUBADE_MOTIF, every: 2, oct: 24, vel: 0.14 },
      { inst: 'harp', type: 'bells', density: 0.2, oct: 24, vel: 0.08 }
    ], amb: ['water', 'gulls'] },
    knock: { bpm: 50, meter: 4, key: 45, scale: 'phryg', prog: [[0, 'm'], [1, 'M']], bars: 4, parts: [
      { inst: 'cello', type: 'drone', oct: -12, vel: 0.09 },
      { inst: 'musicbox', type: 'bells', density: 0.12, oct: 24, vel: 0.07 },
      { inst: 'choir', type: 'chord', oct: 0, vel: 0.02 }
    ], amb: ['underwater'] },
    basin: { bpm: 58, meter: 4, key: 52, scale: 'minor', prog: [[0, 'm'], [5, 'm'], [8, 'M'], [7, 'M']], bars: 2, parts: [
      { inst: 'pluck', type: 'arp', pat: [0, 2, 1, 3], step: 1, oct: 12, vel: 0.24 },
      { inst: 'pad', type: 'chord', oct: 0, vel: 0.05 },
      { inst: 'glass', type: 'bells', density: 0.08, oct: 36, vel: 0.03 }
    ], amb: ['wind', 'sleigh', 'icesing'] },
    glass: { bpm: 84, meter: 3, key: 57, scale: 'minor', prog: [[0, 'm'], [5, 'm'], [7, 'M'], [0, 'm'], [8, 'M'], [5, 'm'], [7, '7'], [0, 'm']], bars: 1, parts: [
      { inst: 'accordion', type: 'melody', step: 1, density: 0.75, oct: 12, vel: 0.07, lp: true },
      { inst: 'bass', type: 'root', beats: [0], oct: -12, vel: 0.13 },
      { inst: 'accordion', type: 'waltzchord', oct: 0, vel: 0.035 },
      { inst: 'pad', type: 'chord', oct: -12, vel: 0.035 }
    ], muffle: 900, amb: ['wind', 'icesing', 'crowdfar'] },
    mild: { bpm: 92, meter: 3, key: 57, scale: 'minor', prog: [[0, 'm'], [1, 'M'], [0, 'm'], [10, 'M'], [8, 'M'], [7, 'M']], bars: 1, parts: [
      { inst: 'accordion', type: 'melody', step: 1, density: 0.8, oct: 12, vel: 0.06 },
      { inst: 'bass', type: 'root', beats: [0], oct: -12, vel: 0.14 },
      { inst: 'cello', type: 'drone', oct: -12, vel: 0.05 },
      { inst: 'timpani', type: 'drum', beats: [0], every: 4, note: 38, vel: 0.2 }
    ], muffle: 1100, amb: ['rain', 'icesing', 'crowdfar'] },
    underglass: { bpm: 52, meter: 4, key: 48, scale: 'minor', prog: [[0, 'm'], [8, 'M'], [5, 'm'], [7, 'M']], bars: 2, parts: [
      { inst: 'cello', type: 'drone', oct: -12, vel: 0.1 },
      { inst: 'piano', type: 'melody', step: 2, density: 0.45, oct: 24, vel: 0.12 },
      { inst: 'pad', type: 'chord', oct: 0, vel: 0.04 }
    ], amb: ['wind', 'icesing', 'crowdfar'] },
    candlewaltz: { bpm: 88, meter: 3, key: 55, scale: 'minor', prog: [[0, 'm'], [5, 'm'], [10, 'M'], [3, 'M'], [8, 'M'], [5, 'm'], [7, '7'], [0, 'm']], bars: 1, parts: [
      { inst: 'accordion', type: 'melody', step: 1, density: 0.8, oct: 12, vel: 0.1 },
      { inst: 'bass', type: 'root', beats: [0], oct: -12, vel: 0.18 },
      { inst: 'accordion', type: 'waltzchord', oct: 0, vel: 0.045 },
      { inst: 'brush', type: 'drum', beats: [1, 2], vel: 0.05 }
    ], amb: ['crowdnear'] },
    thawball: { bpm: 100, meter: 3, key: 57, scale: 'minor', prog: [[0, 'm'], [5, 'm'], [7, 'M'], [0, 'm'], [3, 'M'], [8, 'M'], [2, 'dim'], [7, '7']], bars: 1, parts: [
      { inst: 'accordion', type: 'melody', step: 0.5, density: 0.7, oct: 12, vel: 0.1 },
      { inst: 'bass', type: 'root', beats: [0], oct: -12, vel: 0.22 },
      { inst: 'piano', type: 'waltzchord', oct: 0, vel: 0.06 },
      { inst: 'brush', type: 'drum', beats: [0, 1, 2], vel: 0.06 },
      { inst: 'cello', type: 'drone', oct: -12, vel: 0.03 }
    ], amb: ['crowdnear', 'icesing'] },
    warden: { bpm: 60, meter: 4, key: 52, scale: 'minor', prog: [[0, 'm'], [10, 'M'], [8, 'M'], [7, 'm']], bars: 2, parts: [
      { inst: 'pluck', type: 'arp', pat: [0, 2, 1, 2, 3, 2, 1, 2], step: 0.5, oct: 0, vel: 0.26 },
      { inst: 'pluck', type: 'melody', step: 1, density: 0.35, oct: 12, vel: 0.2 },
      { inst: 'bass', type: 'root', beats: [0], oct: -12, vel: 0.12 }
    ], amb: ['stove', 'windin'] },
    saw: { bpm: 76, meter: 4, key: 47, scale: 'dorian', prog: [[0, 'm'], [0, 'm'], [10, 'M'], [5, 'M']], bars: 1, parts: [
      { inst: 'kick', type: 'drum', beats: [0, 2], vel: 0.35 },
      { inst: 'tick', type: 'drum', beats: [1, 3], vel: 0.08 },
      { inst: 'choir', type: 'melody', step: 2, density: 0.8, oct: 12, vel: 0.05 },
      { inst: 'cello', type: 'drone', oct: -12, vel: 0.07 }
    ], amb: ['stove', 'crowdnear'] },
    coldworks: { bpm: 96, meter: 4, key: 45, scale: 'phryg', prog: [[0, 'm'], [1, 'M'], [0, 'm'], [8, 'M']], bars: 2, parts: [
      { inst: 'kick', type: 'drum', beats: [0, 1.5, 2, 3.5], vel: 0.2 },
      { inst: 'bass', type: 'pulse', step: 0.5, oct: -12, vel: 0.1 },
      { inst: 'clang', type: 'bells', density: 0.12, oct: 24, vel: 0.03 },
      { inst: 'pad', type: 'chord', oct: -12, vel: 0.04 }
    ], amb: ['machine', 'wind', 'steam'] },
    ondine: { bpm: 48, meter: 4, key: 53, scale: 'major', prog: [[0, 'M'], [5, 'M'], [9, 'm'], [7, 'sus'], [7, 'M']], bars: 2, parts: [
      { inst: 'organ', type: 'chord', oct: 0, vel: 0.06 },
      { inst: 'organ', type: 'root', beats: [0], oct: -12, vel: 0.07 },
      { inst: 'choir', type: 'melody', step: 2, density: 0.5, oct: 12, vel: 0.035 }
    ], amb: ['tent', 'candles'] },
    needle: { bpm: 72, meter: 3, key: 64, scale: 'major', prog: [[0, 'M'], [5, 'M'], [7, 'M'], [0, 'M'], [9, 'm'], [5, 'M'], [7, '7'], [0, 'M']], bars: 1, parts: [
      { inst: 'musicbox', type: 'melody', step: 0.5, density: 0.65, oct: 12, vel: 0.1 },
      { inst: 'musicbox', type: 'root', beats: [0], oct: -12, vel: 0.08 },
      { inst: 'tick', type: 'drum', beats: [0, 1, 2], vel: 0.04 }
    ], amb: ['stove'] },
    tables: { bpm: 60, meter: 4, key: 50, scale: 'lydian', prog: [[0, 'M'], [2, 'M'], [0, 'M'], [7, 'M']], bars: 2, parts: [
      { inst: 'piano', type: 'root', beats: [0, 2], oct: -12, vel: 0.12 },
      { inst: 'piano', type: 'chordhit', beats: [1, 3], oct: 0, vel: 0.06 },
      { inst: 'piano', type: 'melody', step: 1, density: 0.5, oct: 12, vel: 0.1 },
      { inst: 'tick', type: 'drum', beats: [0, 1, 2, 3], vel: 0.05 }
    ], amb: ['clock'] },
    watchhouse: { bpm: 62, meter: 4, key: 55, scale: 'major', prog: [[0, 'M'], [9, 'm'], [5, 'M'], [7, 'M']], bars: 2, parts: [
      { inst: 'reed', type: 'melody', step: 1, density: 0.55, oct: 12, vel: 0.04 },
      { inst: 'pluck', type: 'arp', pat: [0, 1, 2, 1], step: 1, oct: 0, vel: 0.18 },
      { inst: 'pad', type: 'chord', oct: -12, vel: 0.03 }
    ], amb: ['stove', 'windin'] },
    magistrate: { bpm: 80, meter: 4, key: 60, scale: 'lydian', prog: [[0, 'M'], [2, 'M'], [4, 'm'], [2, 'M']], bars: 2, parts: [
      { inst: 'harp', type: 'arp', pat: [0, 2, 1, 3, 2, 0], step: 0.5, oct: 0, vel: 0.14 },
      { inst: 'pluck', type: 'melody', step: 1, density: 0.4, oct: 12, vel: 0.14 },
      { inst: 'bass', type: 'root', beats: [0, 3], oct: -12, vel: 0.1 }
    ], amb: ['wind', 'icesing'] },
    steam: { bpm: 74, meter: 4, key: 53, scale: 'dorian', prog: [[0, 'm7'], [5, '7'], [10, 'M'], [7, 'm7']], bars: 2, parts: [
      { inst: 'rhodes', type: 'chordhit', beats: [0, 1.5, 3], oct: 0, vel: 0.07 },
      { inst: 'bass', type: 'walk', step: 1, oct: -12, vel: 0.16 },
      { inst: 'brush', type: 'drum', beats: [1, 3], vel: 0.05 },
      { inst: 'rhodes', type: 'melody', step: 0.5, density: 0.35, oct: 12, vel: 0.05 }
    ], amb: ['steamroom'] },
    chestnut: { bpm: 90, meter: 3, key: 62, scale: 'major', prog: [[0, 'M'], [7, 'M'], [9, 'm'], [5, 'M']], bars: 1, parts: [
      { inst: 'musicbox', type: 'melody', step: 0.5, density: 0.55, oct: 12, vel: 0.07 },
      { inst: 'pluck', type: 'waltzchord', oct: 0, vel: 0.1 },
      { inst: 'bass', type: 'root', beats: [0], oct: -12, vel: 0.1 }
    ], amb: ['fire', 'wind', 'crowdfar'] },
    voices: { bpm: 56, meter: 4, key: 49, scale: 'lydian', prog: [[0, 'add9'], [4, 'm'], [9, 'm'], [7, 'M']], bars: 2, parts: [
      { inst: 'pad', type: 'chord', oct: 0, vel: 0.06 },
      { inst: 'piano', type: 'melody', step: 1.5, density: 0.4, oct: 24, vel: 0.1 },
      { inst: 'glass', type: 'bells', density: 0.1, oct: 36, vel: 0.03 }
    ], amb: ['wind', 'icesing'] },
    kitchen: { bpm: 64, meter: 3, key: 57, scale: 'major', prog: [[0, 'M'], [5, 'M'], [2, 'm'], [7, 'M']], bars: 2, parts: [
      { inst: 'musicbox', type: 'motif', motif: [[0, 4, 1], [1, 2, 1], [2, 0, 1], [3, 1, 1], [4, 2, 1], [5, 4, 1]], every: 2, oct: 12, vel: 0.1, detune: true },
      { inst: 'pad', type: 'chord', oct: 0, vel: 0.05 },
      { inst: 'harp', type: 'arp', pat: [0, 1, 2], step: 1, oct: 0, vel: 0.1 }
    ], amb: ['kettle'] },
    under: { bpm: 40, meter: 4, key: 41, scale: 'phryg', prog: [[0, 'm'], [1, 'M'], [10, 'm'], [0, 'm']], bars: 2, parts: [
      { inst: 'cello', type: 'drone', oct: -12, vel: 0.1 },
      { inst: 'choir', type: 'chord', oct: 12, vel: 0.025 },
      { inst: 'glass', type: 'bells', density: 0.2, oct: 36, vel: 0.04 },
      { inst: 'kick', type: 'drum', beats: [0, 0.4], vel: 0.18 }
    ], amb: ['underwater'] },
    break: { bpm: 70, meter: 4, key: 43, scale: 'minor', prog: [[0, 'm'], [1, 'M'], [8, 'M'], [7, 'M']], bars: 2, parts: [
      { inst: 'timpani', type: 'drum', beats: [0, 2.5], note: 31, vel: 0.35 },
      { inst: 'cello', type: 'chord', oct: -12, vel: 0.06 },
      { inst: 'choir', type: 'chord', oct: 12, vel: 0.03 },
      { inst: 'glass', type: 'bells', density: 0.1, oct: 36, vel: 0.03 }
    ], amb: ['water', 'rain', 'crack'] },
    shore: { bpm: 60, meter: 4, key: 55, scale: 'major', prog: [[0, 'M'], [7, 'M'], [9, 'm'], [5, 'M']], bars: 2, parts: [
      { inst: 'pluck', type: 'arp', pat: [0, 1, 2, 3, 2, 1], step: 0.5, oct: 0, vel: 0.22 },
      { inst: 'pad', type: 'chord', oct: 0, vel: 0.045 },
      { inst: 'cello', type: 'root', beats: [0], oct: -12, vel: 0.05 }
    ], amb: ['water', 'fire'] },
    silence: { bpm: 60, meter: 4, key: 40, scale: 'minor', prog: [[0, 'm']], bars: 4, parts: [{ inst: 'cello', type: 'drone', oct: -12, vel: 0.04 }], amb: ['underwater'] }
  };

  var SCENE_SONG = {
    title: 'aubade', dream: 'knock', crossing: 'basin', gate: 'glass', body: 'underglass', glass: 'glass',
    chandelier: 'candlewaltz', ballroom: 'thawball', hut: 'warden', cutters: 'saw', works: 'coldworks',
    chapel: 'ondine', mending: 'needle', booth: 'tables', watch: 'watchhouse', under: 'under', break: 'break',
    shore: 'shore', dawn: 'aubadeMajor', black: 'silence', fisher: 'magistrate', bath: 'steam', gull: 'chestnut',
    bench: 'voices', kitchen: 'kitchen'
  };
  var INTERIOR = { chandelier: 1, ballroom: 1, hut: 1, cutters: 1, chapel: 1, mending: 1, booth: 1, watch: 1, bath: 1, kitchen: 1 };

  function chordNotes(song, idx) {
    var c = song.prog[idx % song.prog.length];
    return Q[c[1]].map(function (n) { return song.key + c[0] + n; });
  }
  function scaleNote(song, deg, oct) {
    var sc = SCALES[song.scale], n = sc.length;
    var o = Math.floor(deg / n), d = ((deg % n) + n) % n;
    return song.key + sc[d] + o * 12 + oct;
  }

  function Player(song, name) {
    this.song = song; this.name = name;
    this.bus = ac.createGain(); this.bus.gain.value = 0.0001;
    var dest = this.bus;
    if (song.muffle) { var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = song.muffle; this.bus.connect(lp); lp.connect(musicBus); }
    else this.bus.connect(musicBus);
    this.dest = dest;
    this.beat = 0; this.t0 = now() + 0.15; this.alive = true; this.walk = 0; this.mel = 2;
    this.bus.gain.setTargetAtTime(1, now(), 1.2);
    var self = this;
    this.timer = setInterval(function () { self.schedule(); }, 90);
    this.schedule();
  }
  Player.prototype.stop = function () {
    this.alive = false;
    clearInterval(this.timer);
    this.bus.gain.setTargetAtTime(0.0001, now(), 0.9);
    var b = this.bus;
    setTimeout(function () { try { b.disconnect(); } catch (e) { /* gone */ } }, 5000);
  };
  Player.prototype.schedule = function () {
    if (!this.alive) return;
    var s = this.song, spb = 60 / s.bpm, horizon = now() + 0.5;
    while (this.t0 + this.beat * spb < horizon) {
      var b = this.beat, t = this.t0 + b * spb;
      var barLen = s.meter, bar = Math.floor(b / barLen), inBar = b - bar * barLen;
      var chordIdx = Math.floor(bar / s.bars), chord = chordNotes(s, chordIdx);
      var chordStart = inBar === 0 && bar % s.bars === 0;
      for (var p = 0; p < s.parts.length; p++) this.part(s.parts[p], t, b, bar, inBar, chord, chordStart, spb);
      this.beat += 0.5;
    }
  };
  Player.prototype.part = function (P, t, b, bar, inBar, chord, chordStart, spb) {
    var fn = INST[P.inst], d = this.dest, s = this.song, oct = P.oct || 0, v = P.vel;
    var onStep = function (step) { return Math.abs((b / step) - Math.round(b / step)) < 1e-6; };
    switch (P.type) {
      case 'arp':
        if (onStep(P.step)) { var i = Math.round(b / P.step) % P.pat.length, k = P.pat[i]; var n = chord[k % chord.length] + 12 * Math.floor(k / chord.length) + oct; fn(d, t, n, P.step * spb * 2, v * (0.8 + Math.random() * 0.3)); }
        break;
      case 'chord':
        if (chordStart) chord.forEach(function (n) { fn(d, t, n + oct, s.bars * s.meter * spb, v); });
        break;
      case 'chordhit':
        if (P.beats.some(function (x) { return Math.abs(x - inBar) < 1e-6; })) chord.forEach(function (n) { fn(d, t, n + oct, spb, v); });
        break;
      case 'waltzchord':
        if (inBar === 1 || inBar === 2) chord.slice(1).forEach(function (n) { fn(d, t, n + oct + 12, spb * 0.6, v); });
        break;
      case 'root':
        if (P.beats.some(function (x) { return Math.abs(x - inBar) < 1e-6; })) fn(d, t, chord[0] + oct, spb * 1.5, v);
        break;
      case 'walk':
        if (onStep(P.step)) { this.walk = (this.walk + (Math.random() < 0.5 ? 1 : 2)) % 4; var wn = [chord[0], chord[1], chord[2], chord[0] + 2][this.walk]; fn(d, t, wn + oct, spb, v); }
        break;
      case 'pulse':
        if (onStep(P.step)) fn(d, t, chord[0] + oct, P.step * spb, v * (inBar === 0 ? 1.4 : 1));
        break;
      case 'drone':
        if (chordStart) { fn(d, t, chord[0] + oct, s.bars * s.meter * spb, v); fn(d, t, chord[0] + 7 + oct, s.bars * s.meter * spb, v * 0.6); }
        break;
      case 'drum':
        if (P.every && bar % P.every !== 0) break;
        if (P.beats.some(function (x) { return Math.abs(x - inBar) < 1e-6; })) fn(d, t, P.note || 40, 0.3, v * (0.85 + Math.random() * 0.3));
        break;
      case 'melody':
        if (onStep(P.step) && Math.random() < P.density) {
          this.mel += Math.round((Math.random() - 0.5) * 3);
          if (this.mel < 0) this.mel = 1; if (this.mel > 9) this.mel = 8;
          var note = scaleNote(s, this.mel, oct);
          if (inBar === 0) { var ct = chord.map(function (c) { return c + oct; }); note = ct.reduce(function (a, c) { return Math.abs(c - note) < Math.abs(a - note) ? c : a; }, ct[0]); while (note < s.key + oct - 2) note += 12; }
          fn(d, t, note, P.step * spb * 1.6, v * (0.8 + Math.random() * 0.4));
        }
        break;
      case 'motif':
        var len = P.every * s.meter, pos = b % len;
        P.motif.forEach(function (mm) { if (Math.abs(mm[0] - pos) < 1e-6) fn(d, t, scaleNote(s, mm[1], oct) + (P.detune ? (Math.random() - 0.5) * 0.3 : 0), mm[2] * spb, v); });
        break;
      case 'bells':
        if (onStep(1) && Math.random() < P.density) fn(d, t, scaleNote(s, Math.floor(Math.random() * 8), oct), 2, v);
        break;
    }
  };

  function playSong(name) {
    if (!ac || !enabled) { songNow = name; return; }
    if (songNow === name && Player.cur && Player.cur.alive) return;
    songNow = name;
    if (Player.cur) Player.cur.stop();
    Player.cur = SONGS[name] ? new Player(SONGS[name], name) : null;
    setAmbience(SONGS[name] ? SONGS[name].amb : []);
  }

  // ---------------------------------------------------------------- ambience
  var ambLayers = [];
  function stopAmb() { ambLayers.forEach(function (f) { f(); }); ambLayers = []; }
  function loopNoise(kind, type, freq, q, gain, lfoRate, lfoDepth) {
    var n = noise(kind), f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 0.7;
    var g = ac.createGain(); g.gain.value = gain;
    n.connect(f); f.connect(g); g.connect(ambBus);
    var stops = [function () { try { n.stop(); } catch (e) { /* stopped */ } g.disconnect(); }];
    if (lfoRate) { var l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = lfoRate; lg.gain.value = lfoDepth; l.connect(lg); lg.connect(g.gain); l.start(); stops.push(function () { try { l.stop(); } catch (e) { /* stopped */ } }); }
    n.start();
    return function () { stops.forEach(function (s) { s(); }); };
  }
  function every(fn, min, max) {
    var alive = true, tm;
    (function loop() { tm = setTimeout(function () { if (!alive) return; fn(); loop(); }, min + Math.random() * (max - min)); })();
    return function () { alive = false; clearTimeout(tm); };
  }
  var AMB = {
    wind: function () { return loopNoise('pink', 'bandpass', 420, 0.6, 0.06, 0.08, 0.04); },
    windin: function () { return loopNoise('pink', 'lowpass', 300, 0.5, 0.025, 0.06, 0.015); },
    icesing: function () { return every(function () { SFX.sing(0.03 + Math.random() * 0.03); }, 5000, 14000); },
    crowdfar: function () { return loopNoise('pink', 'bandpass', 700, 1.2, 0.02, 0.3, 0.008); },
    crowdnear: function () { var a = loopNoise('pink', 'bandpass', 900, 0.9, 0.05, 0.4, 0.02); var b = every(function () { SFX.clink(0.05); }, 2500, 7000); return function () { a(); b(); }; },
    stove: function () { var a = loopNoise('brown', 'lowpass', 400, 0.5, 0.05); var b = every(function () { SFX.crackle(0.06); }, 300, 1800); return function () { a(); b(); }; },
    fire: function () { var a = loopNoise('brown', 'lowpass', 500, 0.5, 0.06); var b = every(function () { SFX.crackle(0.08); }, 200, 1200); return function () { a(); b(); }; },
    rain: function () { return loopNoise('white', 'highpass', 2500, 0.5, 0.035, 0.2, 0.01); },
    water: function () { return loopNoise('brown', 'lowpass', 600, 0.6, 0.12, 0.15, 0.08); },
    underwater: function () { var a = loopNoise('brown', 'lowpass', 220, 0.6, 0.25, 0.07, 0.1); var b = every(function () { SFX.bubbles(0.05); }, 1500, 5000); return function () { a(); b(); }; },
    machine: function () { var a = every(function () { SFX.thud(0.18); }, 700, 720); var b = loopNoise('brown', 'lowpass', 180, 0.8, 0.12); return function () { a(); b(); }; },
    steam: function () { return every(function () { SFX.steam(0.05); }, 4000, 9000); },
    steamroom: function () { var a = every(function () { SFX.steam(0.07); }, 5000, 11000); var b = loopNoise('brown', 'lowpass', 300, 0.5, 0.04); return function () { a(); b(); }; },
    tent: function () { return loopNoise('pink', 'lowpass', 250, 0.5, 0.03, 0.12, 0.02); },
    candles: function () { return loopNoise('pink', 'bandpass', 1800, 2, 0.006); },
    clock: function () { var k = 0; return every(function () { INST.tick(sfxBus, now(), 0, 0, (k++ % 2) ? 0.06 : 0.09); }, 1000, 1000); },
    kettle: function () { return loopNoise('white', 'bandpass', 3400, 12, 0.004, 0.1, 0.003); },
    gulls: function () { return every(function () { SFX.gull(0.05); }, 4000, 12000); },
    sleigh: function () { return every(function () { SFX.jingle(0.035); }, 380, 520); },
    crack: function () { return every(function () { SFX.crack(0.35); }, 3000, 8000); }
  };
  function setAmbience(list) {
    stopAmb();
    if (!ac || !enabled) return;
    (list || []).forEach(function (k) { if (AMB[k]) ambLayers.push(AMB[k]()); });
    if (C.audio._rain) ambLayers.push(AMB.rain());
  }

  // ---------------------------------------------------------------- effects
  function burst(kind, type, freq, q, gain, dur, t0) {
    var t = t0 || now(), n = noise(kind, false), f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    var g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 0.004); g.gain.setTargetAtTime(0.0001, t + 0.01, dur / 3);
    n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); n.stop(t + dur + 0.3);
    return f;
  }
  function tone(freq, t, dur, gain, type, dest) {
    var o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 0.01); g.gain.setTargetAtTime(0.0001, t + 0.02, dur / 3);
    o.connect(g); out(g, dest || sfxBus, 0.4); o.start(t); o.stop(t + dur + 0.5);
    return o;
  }
  var SFX = {
    sing: function (vol) {
      var t = now();
      for (var k = 0; k < 3; k++) {
        var o = ac.createOscillator(), g = ac.createGain(), st = t + k * 0.17;
        o.frequency.setValueAtTime(2400 + Math.random() * 1400, st);
        o.frequency.exponentialRampToValueAtTime(160 + Math.random() * 140, st + 0.55);
        g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime((vol || 0.06) / (k + 1), st + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, st + 0.65);
        o.connect(g); out(g, ambBus, 0.6); o.start(st); o.stop(st + 0.7);
      }
    },
    knock: function () { var t = now(); for (var i = 0; i < 3; i++) { burst('white', 'bandpass', 170, 3, 0.9, 0.12, t + i * 0.42); tone(90, t + i * 0.42, 0.12, 0.3); } },
    crack: function (v) {
      var t = now(); burst('white', 'highpass', 900, 0.7, v || 0.6, 0.8, t);
      var o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 280;
      o.type = 'sawtooth'; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(28, t + 1.6);
      g.gain.setValueAtTime((v || 0.6) * 0.35, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
      o.connect(lp); lp.connect(g); out(g, sfxBus, 0.6); o.start(t); o.stop(t + 1.8);
    },
    bell: function () { var t = now(); [1, 2.02, 2.76, 4.07, 5.4].forEach(function (r, i) { tone(146 * r, t, 5 - i * 0.6, 0.22 / (i + 1)); }); },
    breakbell: function () { var t = now(); for (var i = 0; i < 8; i++) [1, 2.6, 4.1].forEach(function (r, j) { tone(620 * r, t + i * 0.16, 0.25, 0.09 / (j + 1), 'triangle'); }); },
    dice: function () { var t = now(); for (var i = 0; i < 5; i++) burst('white', 'bandpass', 2400 + Math.random() * 2000, 6, 0.35, 0.05, t + i * 0.055 + Math.random() * 0.03); },
    success: function () { var t = now() + 0.25; [0, 4, 7, 12].forEach(function (s, i) { INST.harp(sfxBus, t + i * 0.07, 69 + s, 1, 0.12); }); },
    fail: function () { var t = now() + 0.25; [0, -1, -5].forEach(function (s, i) { INST.piano(sfxBus, t + i * 0.12, 57 + s, 1, 0.1); }); INST.cello(sfxBus, t, 38, 1.2, 0.06); },
    chime_task: function () { var t = now(); INST.musicbox(sfxBus, t, 79, 1, 0.08); INST.musicbox(sfxBus, t + 0.09, 84, 1, 0.07); },
    chime_clue: function () { var t = now(); INST.glass(sfxBus, t, 76, 1, 0.06); INST.glass(sfxBus, t + 0.12, 83, 1, 0.05); },
    chime_thought: function () { var t = now(); [0, 7, 14, 19].forEach(function (s, i) { INST.glass(sfxBus, t + i * 0.15, 62 + s, 1, 0.05); }); INST.pad(sfxBus, t, 50, 2.5, 0.04); },
    xp: function () { INST.harp(sfxBus, now(), 84, 0.5, 0.05); },
    level: function () { var t = now(); [0, 4, 7, 12, 16].forEach(function (s, i) { INST.harp(sfxBus, t + i * 0.08, 72 + s, 1, 0.1); }); },
    hurt: function () { var t = now(); INST.kick(sfxBus, t, 0, 0, 0.6); INST.cello(sfxBus, t, 36, 1, 0.08); INST.cello(sfxBus, t, 37, 1, 0.06); },
    hurtmo: function () { var t = now(); [48, 51, 54].forEach(function (m) { INST.pad(sfxBus, t, m, 1.5, 0.06); }); tone(110, t, 1.2, 0.12, 'triangle'); },
    heal: function () { var t = now(); [0, 4, 7].forEach(function (s, i) { INST.musicbox(sfxBus, t + i * 0.06, 72 + s, 1, 0.06); }); },
    footsteps: function () { var t = now(); for (var i = 0; i < 5; i++) { burst('white', 'bandpass', 900 + Math.random() * 500, 0.9, 0.22, 0.09, t + i * 0.38 + Math.random() * 0.04); burst('brown', 'lowpass', 300, 0.7, 0.3, 0.1, t + i * 0.38); } },
    door: function () {
      var t = now(), o = ac.createOscillator(), g = ac.createGain(), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 6;
      o.type = 'sawtooth'; o.frequency.setValueAtTime(120, t); o.frequency.linearRampToValueAtTime(190, t + 0.5); o.frequency.linearRampToValueAtTime(140, t + 0.8);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 0.1); g.gain.linearRampToValueAtTime(0.0001, t + 0.85);
      o.connect(bp); bp.connect(g); out(g, sfxBus, 0.3); o.start(t); o.stop(t + 0.9);
      burst('brown', 'lowpass', 200, 0.7, 0.7, 0.2, t + 0.95);
    },
    steam: function (v) { burst('white', 'highpass', 3000, 0.5, v || 0.12, 1.4); },
    splash: function () { var t = now(); burst('white', 'lowpass', 1800, 0.6, 0.6, 0.7, t); burst('brown', 'lowpass', 400, 0.6, 0.6, 1, t); SFX.bubbles(0.12); },
    bubbles: function (v) { var t = now(); for (var i = 0; i < 6; i++) { var o = ac.createOscillator(), g = ac.createGain(), st = t + i * 0.08 + Math.random() * 0.1; o.frequency.setValueAtTime(300 + Math.random() * 500, st); o.frequency.exponentialRampToValueAtTime(900 + Math.random() * 600, st + 0.06); g.gain.setValueAtTime(v || 0.05, st); g.gain.exponentialRampToValueAtTime(0.0001, st + 0.08); o.connect(g); g.connect(sfxBus); o.start(st); o.stop(st + 0.1); } },
    crackle: function (v) { burst('white', 'bandpass', 1500 + Math.random() * 2500, 2, v || 0.06, 0.02); },
    fire: function () { for (var i = 0; i < 6; i++) setTimeout(function () { SFX.crackle(0.1); }, i * 90 + Math.random() * 60); },
    accordion: function () { var t = now(); [57, 60, 64, 69].forEach(function (m) { INST.accordion(sfxBus, t, m, 1.6, 0.05); }); },
    paper: function () { var t = now(); for (var i = 0; i < 4; i++) burst('white', 'bandpass', 3500 + Math.random() * 2500, 0.8, 0.06, 0.12, t + i * 0.07); },
    pencil: function () { var t = now(); for (var i = 0; i < 7; i++) burst('white', 'highpass', 5000, 0.7, 0.04, 0.05, t + i * 0.09 + Math.random() * 0.03); },
    chisel: function () { var t = now(); for (var i = 0; i < 3; i++) { INST.clang(sfxBus, t + i * 0.45, 86, 0.3, 0.05); burst('white', 'highpass', 2500, 0.7, 0.2, 0.1, t + i * 0.45); } },
    saw: function () { var t = now(); for (var i = 0; i < 4; i++) { var f = burst('white', 'bandpass', 1200, 1.5, 0.12, 0.35, t + i * 0.5); f.frequency.linearRampToValueAtTime(2200, t + i * 0.5 + 0.35); } },
    clink: function (v) { var t = now(); tone(2600 + Math.random() * 800, t, 0.4, v || 0.05); tone(3900 + Math.random() * 600, t + 0.01, 0.3, (v || 0.05) * 0.5); },
    pour: function () { var t = now(); for (var i = 0; i < 12; i++) burst('white', 'bandpass', 700 + Math.random() * 600, 4, 0.05, 0.08, t + i * 0.07); },
    thud: function (v) { var t = now(); INST.kick(ambBus, t, 0, 0, v || 0.4); burst('brown', 'lowpass', 250, 0.5, (v || 0.4) * 0.5, 0.15, t); },
    gasp: function () { var t = now(), f = burst('pink', 'bandpass', 1400, 1, 0.3, 0.5, t); f.frequency.linearRampToValueAtTime(2200, t + 0.4); },
    heartbeat: function () { var t = now(); for (var i = 0; i < 4; i++) { INST.kick(sfxBus, t + i * 0.9, 0, 0, 0.4); INST.kick(sfxBus, t + i * 0.9 + 0.28, 0, 0, 0.25); } },
    whoosh: function () { var t = now(), f = burst('pink', 'bandpass', 300, 1.2, 0.25, 1.4, t); f.frequency.exponentialRampToValueAtTime(2400, t + 1.2); },
    gull: function (v) { var t = now(); for (var i = 0; i < 2; i++) { var o = ac.createOscillator(), g = ac.createGain(), st = t + i * 0.3; o.type = 'sawtooth'; o.frequency.setValueAtTime(1500, st); o.frequency.linearRampToValueAtTime(900, st + 0.25); var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 3; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(v || 0.04, st + 0.03); g.gain.linearRampToValueAtTime(0.0001, st + 0.28); o.connect(bp); bp.connect(g); out(g, ambBus, 0.6); o.start(st); o.stop(st + 0.3); } },
    jingle: function (v) { var t = now(); [2900, 3500, 4200].forEach(function (f, i) { tone(f * (0.97 + Math.random() * 0.06), t + i * 0.02, 0.25, (v || 0.04) / (i + 1)); }); },
    click: function () { INST.tick(sfxBus, now(), 0, 0, 0.05); },
    cheer: function () { var t = now(); for (var i = 0; i < 24; i++) burst('brown', 'lowpass', 300, 0.6, 0.25, 0.08, t + Math.random() * 1.6); },
    rope: function () { var t = now(), o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(95, t + 0.6); var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 8; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.08, t + 0.2); g.gain.linearRampToValueAtTime(0.0001, t + 0.7); o.connect(bp); bp.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.8); },
    adding: function () { var t = now(); INST.clang(sfxBus, t, 70, 0.1, 0.04); burst('white', 'bandpass', 1800, 3, 0.25, 0.08, t + 0.05); },
    act: function () { SFX.whoosh(); var t = now() + 0.3; [38, 45, 50].forEach(function (m) { INST.cello(sfxBus, t, m, 3, 0.06); }); INST.timpani(sfxBus, t, 38, 1, 0.3); }
  };

  // ---------------------------------------------------------------- voices
  var MAN = C.VOICE_MANIFEST || { files: [], lines: {} };
  var vo = null, voFile = -1, voTimer = null, voResolve = null, voWatch = null;
  function voEl() {
    if (vo) return vo;
    vo = new Audio();
    vo.preload = 'auto';
    return vo;
  }
  function voStop() {
    clearTimeout(voTimer); clearInterval(voWatch);
    if (vo) { try { vo.pause(); } catch (e) { /* ignore */ } }
    duck(false);
    if (voResolve) { var r = voResolve; voResolve = null; r(); }
  }
  function duck(on) {
    if (!ac) return;
    musicBus.gain.setTargetAtTime(on ? vol.music * 0.3 : vol.music, now(), 0.25);
    ambBus.gain.setTargetAtTime(on ? 0.45 : 0.9, now(), 0.25);
  }
  function voPlay(hash) {
    var rec = MAN.lines[hash];
    if (!rec || !enabled || vol.voice <= 0) return Promise.resolve(false);
    voStop();
    return new Promise(function (resolve) {
      voResolve = resolve;
      var el = voEl(), file = MAN.files[rec[0]], start = rec[1], dur = rec[2];
      el.volume = Math.min(1, vol.voice);
      var begin = function () {
        if (!voResolve) return;
        try { el.currentTime = start; } catch (e) { /* ignore */ }
        var p = el.play();
        if (p && p.catch) p.catch(function () { voStop(); });
        duck(true);
        voTimer = setTimeout(voStop, dur * 1000 + 120);
        voWatch = setInterval(function () { if (el.currentTime >= start + dur + 0.05) voStop(); }, 50);
      };
      if (voFile !== rec[0]) {
        voFile = rec[0];
        el.src = file;
        var ready = false;
        var go = function () { if (ready) return; ready = true; el.removeEventListener('canplay', go); begin(); };
        el.addEventListener('canplay', go);
        setTimeout(function () { if (!ready) { ready = true; voStop(); } }, 6000);
        el.load();
      } else begin();
    });
  }

  // ---------------------------------------------------------------- api
  C.audio = {
    enable: function (on) {
      enabled = !!on;
      if (enabled) {
        if (!ensure()) return;
        if (ac.state === 'suspended') ac.resume();
        master.gain.setTargetAtTime(0.85, now(), 0.4);
        var s = songNow; songNow = null;
        if (s) playSong(s);
        voEl();
        try { vo.muted = true; var p = vo.play(); if (p && p.catch) p.catch(function () {}); vo.pause(); vo.muted = false; } catch (e) { /* ignore */ }
      } else if (ac) {
        master.gain.setTargetAtTime(0.0001, now(), 0.2);
        if (Player.cur) { Player.cur.stop(); Player.cur = null; }
        stopAmb();
        voStop();
      }
    },
    scene: function (key, v) {
      sceneNow = key;
      var song = SCENE_SONG[key] || 'silence';
      if (key === 'glass' && v && v.act3) song = 'mild';
      C.audio._rain = !!(v && v.act3 && !INTERIOR[key] && key !== 'under' && key !== 'dawn' && key !== 'shore' && key !== 'kitchen');
      if (enabled && ac) {
        if (INTERIOR[key]) SFX.door(); else if (key !== 'title' && key !== 'dream' && key !== 'black' && key !== 'under' && key !== 'kitchen') SFX.footsteps();
      }
      playSong(song);
    },
    set: function (name) {
      // Legacy @music directive: only a few names still mean something.
      if (name === 'silence') playSong('silence');
      else if (name === 'ball') playSong('thawball');
    },
    sfx: function (name) { if (enabled && ac && SFX[name]) SFX[name](); },
    ui: function (name) { if (enabled && ac && SFX[name]) SFX[name](); },
    setVolume: function (k, v) { vol[k] = v; if (!ac) return; if (k === 'music') musicBus.gain.setTargetAtTime(v, now(), 0.2); if (k === 'sfx') sfxBus.gain.setTargetAtTime(v, now(), 0.2); if (k === 'voice' && vo) vo.volume = Math.min(1, v); },
    voice: { play: voPlay, stop: voStop, has: function (h) { return !!MAN.lines[h]; } },
    songs: Object.keys(SONGS),
    sfxNames: Object.keys(SFX)
  };
})();
