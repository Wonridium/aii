#!/usr/bin/env node
/* Lists every line the game voices (the sixteen skills and the dead), with
 * the hash the engine uses to find its audio, as JSON on stdout.
 *
 *   node tools/dump_lines.js > lines.json
 *
 * The hash is FNV-1a (32-bit, base 36) of `SPEAKER|raw text`, exactly as
 * js/engine.js computes it. Lines with inline conditions ({?...} or {=...})
 * change from play to play, so they are left unvoiced.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const sandbox = { console, Math, JSON, Object, Array, String, Number, Proxy, Function };
sandbox.window = sandbox;
vm.createContext(sandbox);
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1])
  .filter((s) => /^(js\/(data|parser)\.js|story\/)/.test(s));
const fileOf = {};
scripts.forEach((rel) => {
  const before = (sandbox.CANDLE && sandbox.CANDLE.sources) ? sandbox.CANDLE.sources.length : 0;
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), sandbox, { filename: rel });
  const after = sandbox.CANDLE.sources ? sandbox.CANDLE.sources.length : 0;
  for (let i = before; i < after; i++) fileOf[i] = path.basename(rel, '.js');
});
const C = sandbox.CANDLE;

const VOICED = new Set(['THE COLD', 'FELIKS', 'SARRE', 'YOUR MOTHER']);
function fnv(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}

// Turn a line of script into something a speech engine reads well.
function speakable(spk, raw) {
  let t = raw;
  if (!C.SKILLS[spk]) {
    // The dead speak only their quoted (or italic) words; the rest is stage direction.
    const q = /"/.test(t) ? [...t.matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [...t.matchAll(/\*([^*]+)\*/g)].map((m) => m[1]);
    if (q.length) t = q.join(' ... ');
  }
  t = t.replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]/g, '$1')
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
    .replace(/\s*[—–]\s*/g, ' — ')
    .replace(/^\s*—\s*/, '').replace(/\s*—\s*$/, '.')
    .replace(/…/g, '...')
    .replace(/,\s*([,.!?])/g, '$1')
    .replace(/^,\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return t;
}

// Parse each source separately so we know which story file a line came from.
const out = [];
const seen = new Set();
C.sources.forEach((src, i) => {
  const { nodes } = C.parser.parse([src], { skills: C.SKILLS, speakers: C.SPEAKERS, partial: true });
  for (const id in nodes) {
    for (const it of nodes[id].items) {
      if (it.t !== 'line') continue;
      if (!(C.SKILLS[it.spk] || VOICED.has(it.spk))) continue;
      if (/\{[?=]/.test(it.text)) continue;
      const hash = fnv(it.spk + '|' + it.text);
      if (seen.has(hash)) continue;
      seen.add(hash);
      const text = speakable(it.spk, it.text);
      if (!/[A-Za-z]/.test(text)) continue;
      out.push({ hash, spk: it.spk, attr: C.SKILLS[it.spk] ? C.SKILLS[it.spk].attr : it.spk, file: fileOf[i] || 'misc', node: id, text });
    }
  }
});
process.stdout.write(JSON.stringify(out, null, 1));
process.stderr.write(out.length + ' voiced lines, ' + out.reduce((n, l) => n + l.text.split(/\s+/).length, 0) + ' words\n');
