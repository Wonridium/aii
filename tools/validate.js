#!/usr/bin/env node
/* Validates the Candle Ice story scripts and plays thousands of random
 * playthroughs to find dead ends, missing nodes and unreachable scenes.
 *
 *   node tools/validate.js            static checks + 3000 random runs
 *   node tools/validate.js --runs 200 --verbose
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const RUNS = +(args[args.indexOf('--runs') + 1] || 0) || 3000;
const VERBOSE = args.includes('--verbose');

// ---------------------------------------------------------------- load
const sandbox = { window: {}, console, Math, JSON, Object, Array, String, Number, Proxy, Function, setTimeout, clearTimeout };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.document = { createElement: () => ({ getContext: () => ({}) }), addEventListener() {}, hidden: false };
sandbox.matchMedia = () => ({ matches: false });
sandbox.requestAnimationFrame = () => 0;
sandbox.addEventListener = () => {};
vm.createContext(sandbox);
function load(rel) { vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), sandbox, { filename: rel }); }

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]).filter((s) => s !== 'js/engine.js' && !/^https?:/.test(s));
scripts.forEach(load);
const C = sandbox.CANDLE;
const { nodes, errors } = C.parser.parse(C.sources, { skills: C.SKILLS, speakers: C.SPEAKERS });

const problems = [...errors];
const warnings = [];

// ---------------------------------------------------------------- static
const KNOWN_DIRS = new Set(['bg', 'title', 'clock', 'time', 'set', 'add', 'unset', 'health', 'morale', 'resethp', 'xp', 'thought', 'task', 'done', 'clue', 'align', 'attr', 'sig', 'act', 'music', 'sfx', 'weather', 'checkpoint', 'hub', 'pause', 'end', 'gameover', 'openfile', 'insert']);
const SCENES = new Set(C.painter.scenes);
const SCENES3D = new Set(C.scene3d.scenes);
const MUSIC = new Set(['dream', 'wind', 'glass', 'interior', 'ball', 'under', 'break', 'dawn', 'silence']);
const SFX = new Set(C.audio.sfxNames);
const ALIGNS = new Set(Object.keys(C.ALIGN));
const tasksAdded = new Set();
const tasksDone = new Set();
let words = 0;

function checkExpr(e, where) {
  try { new Function('__s', 'with(__s){return (' + e + ');}'); } catch (err) { problems.push(`${where}: bad expression {${e}}: ${err.message}`); }
}
function countWords(s) { words += s.split(/\s+/).filter(Boolean).length; }

for (const id in nodes) {
  const n = nodes[id];
  let exits = 0;
  for (const it of n.items) {
    if (it.cond) checkExpr(it.cond, id);
    if (it.t === 'choice') {
      exits++;
      countWords(it.text);
      if (it.ccond) checkExpr(it.ccond, id);
      if (!nodes[it.target]) problems.push(`${id}: choice -> missing node ${it.target}`);
      if (it.check) {
        if (!it.fail) problems.push(`${id}: check choice without fail target: ${it.text}`);
        else if (!nodes[it.fail]) problems.push(`${id}: check fail -> missing node ${it.fail}`);
        if (typeof it.check.diff === 'string') checkExpr(it.check.diff, id);
      } else if (it.fail) problems.push(`${id}: non-check choice has a fail target`);
    }
    if (it.t === 'cont' || it.t === 'jump') {
      exits++;
      if (!nodes[it.target]) problems.push(`${id}: ${it.t} -> missing node ${it.target}`);
    }
    if (it.t === 'line' || it.t === 'narr') {
      countWords(it.text);
      const inl = it.text.match(/\{\?([^|{}]+)\|/g) || [];
      inl.forEach((m) => checkExpr(m.slice(2, -1), id));
    }
    if (it.t === 'dir') {
      if (!KNOWN_DIRS.has(it.name)) problems.push(`${id}: unknown directive @${it.name}`);
      if (it.name === 'bg' && !SCENES.has(it.arg)) problems.push(`${id}: unknown 2D scene ${it.arg}`);
      if (it.name === 'bg' && !SCENES3D.has(it.arg)) problems.push(`${id}: unknown 3D scene ${it.arg}`);
      if (it.name === 'insert' && !SCENES3D.has(it.arg)) problems.push(`${id}: unknown 3D insert ${it.arg}`);
      if (it.name === 'insert' && !SCENES.has(it.arg)) problems.push(`${id}: unknown 2D insert ${it.arg}`);
      if (it.name === 'music' && !MUSIC.has(it.arg)) problems.push(`${id}: unknown music ${it.arg}`);
      if (it.name === 'sfx' && !SFX.has(it.arg)) problems.push(`${id}: unknown sfx ${it.arg}`);
      if (it.name === 'thought' && !C.THOUGHTS[it.arg]) problems.push(`${id}: unknown thought ${it.arg}`);
      if (it.name === 'align' && !ALIGNS.has(it.arg.split(/\s+/)[0])) problems.push(`${id}: unknown alignment ${it.arg}`);
      if (it.name === 'task') tasksAdded.add(it.arg.split(/\s+/)[0]);
      if (it.name === 'done') tasksDone.add(it.arg);
      if (it.name === 'set') { const m = /^(\w+)\s*(?:=\s*(.+))?$/.exec(it.arg); if (!m) problems.push(`${id}: bad @set ${it.arg}`); else if (m[2]) checkExpr(m[2], id); }
      if (it.name === 'add' && !/^\w+\s+-?\d+$/.test(it.arg)) problems.push(`${id}: bad @add ${it.arg}`);
      if (it.name === 'end' || it.name === 'gameover') exits++;
    }
  }
  if (!exits) warnings.push(`${id}: no exits (relies on hub fallback)`);
}
tasksDone.forEach((t) => { if (!tasksAdded.has(t)) warnings.push(`@done ${t} but task never added`); });

// reachability (static)
const reach = new Set();
const stack = ['start', 'go_health', 'go_morale'];
while (stack.length) {
  const id = stack.pop();
  if (reach.has(id) || !nodes[id]) continue;
  reach.add(id);
  for (const it of nodes[id].items) {
    if (it.t === 'choice') { stack.push(it.target); if (it.fail) stack.push(it.fail); }
    if (it.t === 'cont' || it.t === 'jump') stack.push(it.target);
  }
}
for (const id in nodes) if (!reach.has(id)) warnings.push(`unreachable node: ${id}`);

// ---------------------------------------------------------------- simulation
function parseTime(s) { const p = String(s).split(':').map(Number); let t = p[0] * 60 + (p[1] || 0); if (p[0] < 12) t += 1440; return t; }

function simulate(seed, policy) {
  let rs = seed;
  const rand = () => { rs = (rs * 1664525 + 1013904223) % 4294967296; return rs / 4294967296; };
  const S = { v: {}, seen: {}, chosen: {}, picked: {}, checks: {}, attrs: { REASON: 2, SOUL: 2, FLESH: 2, NERVE: 2 }, sig: null, learned: {}, hp: 4, mo: 4, clock: 19 * 60 + 38, th: { unlocked: {}, slots: [null, null, null], done: {} }, tasks: {}, clues: {}, align: { mutualist: 0, actuarian: 0, hearther: 0, unpriced: 0 }, hub: null };
  const tm = (k) => { let m = 0; S.th.slots.forEach((s) => { if (s) { const T = C.THOUGHTS[s.id]; m += (T.during && T.during[k]) || 0; } }); Object.keys(S.th.done).forEach((id) => { const T = C.THOUGHTS[id]; m += (T.after && T.after[k]) || 0; }); return m; };
  const skill = (k) => Math.max(1, S.attrs[C.SKILLS[k].attr] + (S.learned[k] || 0) + (S.sig === k ? 1 : 0) + tm(k));
  const H = {
    skill, pass: (k, d) => skill(k) + 6 >= d, seen: (id) => S.seen[id] || 0, thought: (id) => !!S.th.done[id],
    researching: (id) => S.th.slots.some((s) => s && s.id === id), known: (id) => !!S.th.unlocked[id], t: parseTime,
    align: (k) => S.align[k] || 0, topalign: () => { let b = '', bv = 0; for (const k in S.align) if (S.align[k] > bv) { bv = S.align[k]; b = k; } return b; },
    attr: (k) => S.attrs[k], clue: (id) => !!S.clues[id], task: (id) => (S.tasks[id] ? (S.tasks[id].done ? 2 : 1) : 0), chosen: (id) => !!S.chosen[id], Math
  };
  const scope = new Proxy({}, { has: (t, k) => typeof k === 'string', get: (t, k) => { if (typeof k !== 'string') return undefined; if (k in H) return H[k]; if (k === 'time') return S.clock; if (k === 'hp') return S.hp; if (k === 'mo') return S.mo; if (k === 'undefined') return undefined; const v = S.v[k]; return v === undefined ? 0 : v; } });
  const ev = (e) => new Function('__s', 'with(__s){return (' + e + ');}')(scope);
  const tick = () => {
    S.th.slots.forEach((s, i) => { if (s && S.clock - s.start >= C.THOUGHTS[s.id].time) { S.th.slots[i] = null; S.th.done[s.id] = true; } });
    // research any unlocked thought (policy: eager)
    for (const id in S.th.unlocked) {
      if (S.th.done[id] || S.th.slots.some((s) => s && s.id === id)) continue;
      const i = S.th.slots.indexOf(null);
      if (i < 0) break;
      if (policy.thoughts && rand() < 0.8) S.th.slots[i] = { id, start: S.clock };
    }
  };
  let node = 'start';
  const trail = [];
  for (let step = 0; step < 4000; step++) {
    const n = nodes[node];
    if (!n) return { end: 'missing:' + node, trail };
    S.seen[node] = (S.seen[node] || 0) + 1;
    trail.push(node);
    let jump = null, cont = null, stop = null;
    for (const it of n.items) {
      if (it.t === 'choice') continue;
      if (it.cond && !ev(it.cond)) continue;
      if (it.t === 'dir') {
        const a = it.arg;
        let m;
        switch (it.name) {
          case 'set': m = /^(\w+)\s*(?:=\s*(.+))?$/.exec(a); S.v[m[1]] = m[2] !== undefined ? ev(m[2]) : true; break;
          case 'add': m = a.split(/\s+/); S.v[m[0]] = (+S.v[m[0]] || 0) + +m[1]; break;
          case 'unset': delete S.v[a]; break;
          case 'clock': S.clock = parseTime(a); tick(); break;
          case 'time': S.clock += +a; tick(); break;
          case 'attr': m = a.split(/\s+/); S.attrs[m[0]] = Math.max(1, Math.min(6, S.attrs[m[0]] + +m[1])); break;
          case 'sig': S.sig = a; break;
          case 'resethp': S.hp = 2 + S.attrs.FLESH; S.mo = 2 + S.attrs.SOUL; break;
          case 'health': S.hp = Math.min(2 + S.attrs.FLESH, S.hp + +a); if (S.hp <= 0) { jump = 'go_health'; } break;
          case 'morale': S.mo = Math.min(2 + S.attrs.SOUL + (S.th.done.closer ? 1 : 0), S.mo + +a); if (S.mo <= 0) { jump = 'go_morale'; } break;
          case 'thought': S.th.unlocked[a] = true; tick(); break;
          case 'task': m = /^(\w+)\s+(.+)$/.exec(a); S.tasks[m[1]] = S.tasks[m[1]] || { done: false }; break;
          case 'done': if (S.tasks[a]) S.tasks[a].done = true; break;
          case 'clue': m = /^(\w+)\s+(.+)$/.exec(a); S.clues[m[1]] = true; break;
          case 'align': m = a.split(/\s+/); S.align[m[0]] += +m[1] || 1; break;
          case 'hub': S.hub = node; break;
          case 'end': stop = 'end'; break;
          case 'gameover': stop = 'gameover:' + a; break;
          default: break;
        }
        if (jump || stop) break;
        continue;
      }
      if (it.t === 'jump') { jump = it.target; break; }
      if (it.t === 'cont') { cont = it.target; break; }
    }
    if (stop) return { end: stop, trail, S };
    if (jump) { node = jump; continue; }
    const choices = n.items.filter((it) => it.t === 'choice' && (!it.cond || ev(it.cond)) && (!it.ccond || ev(it.ccond)) && !(!it.sticky && S.chosen[it.id]) && !(it.check && it.check.red && S.checks[it.id]) && !(it.check && !it.check.red && S.checks[it.id] && S.checks[it.id].fail != null && skill(it.check.skill) <= S.checks[it.id].fail));
    if (choices.length) {
      // prefer choices not yet taken, and avoid endless sticky loops
      let pool = choices.filter((c) => !S.chosen[c.id] && !S.picked[c.id] && !(S.seen[c.target] > 3));
      if (!pool.length) pool = choices;
      const c = pool[Math.floor(rand() * pool.length)];
      if (!c.sticky) S.chosen[c.id] = true;
      else S.picked[c.id] = true; // track for preference only
      if (c.check) {
        const d = typeof c.check.diff === 'string' ? Math.round(ev(c.check.diff)) : c.check.diff;
        const a = 1 + Math.floor(rand() * 6), b = 1 + Math.floor(rand() * 6);
        const ok = a + b === 12 || (a + b !== 2 && a + b + skill(c.check.skill) >= d);
        if (c.check.red) S.checks[c.id] = { red: true, ok };
        else if (ok) S.checks[c.id] = { ok: true };
        else S.checks[c.id] = { fail: skill(c.check.skill) };
        node = ok ? c.target : c.fail;
      } else node = c.target;
      continue;
    }
    if (cont) { node = cont; continue; }
    if (S.hub && S.hub !== node) { node = S.hub; continue; }
    return { end: 'deadend:' + node, trail, S };
  }
  return { end: 'loop', trail, S };
}

const endings = {};
const visited = new Set();
const deadends = {};
const verdicts = {};
const evac = {};
let sample = null;
for (let i = 0; i < RUNS; i++) {
  const r = simulate(1234 + i * 7919, { thoughts: true });
  r.trail.forEach((n) => visited.add(n));
  const key = r.end.split(':')[0] === 'deadend' || r.end.split(':')[0] === 'missing' ? r.end : r.end.split(':')[0];
  endings[key] = (endings[key] || 0) + 1;
  if (r.end.startsWith('deadend') || r.end.startsWith('missing') || r.end === 'loop') { deadends[r.end] = (deadends[r.end] || 0) + 1; if (!sample) sample = r.trail.slice(-12); }
  if (r.S && r.S.v.verdict) verdicts[r.S.v.verdict] = (verdicts[r.S.v.verdict] || 0) + 1;
  if (r.S && r.S.v.evac) evac[r.S.v.evac] = (evac[r.S.v.evac] || 0) + 1;
}
const never = Object.keys(nodes).filter((id) => !visited.has(id));

// ---------------------------------------------------------------- report
console.log(`Nodes: ${Object.keys(nodes).length}   Words: ~${words.toLocaleString()}`);
if (problems.length) { console.log(`\nPROBLEMS (${problems.length}):`); problems.forEach((p) => console.log('  ✗ ' + p)); }
if (warnings.length) { console.log(`\nWarnings (${warnings.length}):`); warnings.slice(0, VERBOSE ? 999 : 40).forEach((w) => console.log('  · ' + w)); }
console.log(`\nSimulated ${RUNS} playthroughs. Endings:`, endings);
console.log('Verdicts:', verdicts, ' Evacuation tiers:', evac);
if (Object.keys(deadends).length) { console.log('Dead ends:', deadends); console.log('Sample trail:', sample.join(' > ')); }
console.log(`Nodes never visited in simulation: ${never.length}` + (never.length ? '\n  ' + never.slice(0, VERBOSE ? 999 : 60).join(', ') : ''));
process.exit(problems.length || Object.keys(deadends).length ? 1 : 0);
