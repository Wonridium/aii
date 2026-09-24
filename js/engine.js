/* CANDLE ICE — runtime: state, checks, dialogue feed, panels, saves. */
(function () {
  'use strict';
  var C = window.CANDLE;
  var SAVE_KEY = 'candle-ice-save-v1';
  var SET_KEY = 'candle-ice-settings-v1';

  // ---------------------------------------------------------------- storage
  function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }
  function load(key) { try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function drop(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } }

  var settings = Object.assign({ pace: 'flow', sound: false, gfx: '3d', voice: 'inner' }, load(SET_KEY) || {});
  settings.vols = Object.assign({ music: 0.75, sfx: 0.9, voice: 1 }, settings.vols || {});

  // ---------------------------------------------------------------- parse
  var parsed = C.parser.parse(C.sources, { skills: C.SKILLS, speakers: C.SPEAKERS });
  var NODES = parsed.nodes;
  if (parsed.errors.length) console.warn('Script errors:\n' + parsed.errors.join('\n'));

  // ---------------------------------------------------------------- state
  var S;
  function newState() {
    return {
      v: {}, seen: {}, chosen: {}, checks: {},
      attrs: { REASON: 2, SOUL: 2, FLESH: 2, NERVE: 2 }, sig: null, learned: {},
      xp: 0, lvl: 0, pts: 0, hp: 4, mo: 4,
      clock: 19 * 60 + 38,
      th: { unlocked: {}, order: [], slots: [null, null, null], done: {} },
      tasks: {}, taskOrder: [], clues: {}, clueOrder: [],
      align: { mutualist: 0, actuarian: 0, hearther: 0, unpriced: 0 },
      node: null, hub: null, cont: null, bg: 'dream', title: '', music: null, weather: null,
      log: [], ended: false
    };
  }

  function thoughtMod(k) {
    var m = 0;
    S.th.slots.forEach(function (s) {
      if (!s) return;
      var T = C.THOUGHTS[s.id];
      if (T.during && T.during[k]) m += T.during[k];
    });
    Object.keys(S.th.done).forEach(function (id) {
      var T = C.THOUGHTS[id];
      if (T.after && T.after[k]) m += T.after[k];
    });
    return m;
  }
  function skillVal(k) {
    var sk = C.SKILLS[k];
    if (!sk) return 0;
    return Math.max(1, S.attrs[sk.attr] + (S.learned[k] || 0) + (S.sig === k ? 1 : 0) + thoughtMod(k));
  }
  function hpMax() { return 2 + S.attrs.FLESH; }
  function moMax() {
    var b = 0;
    Object.keys(S.th.done).forEach(function (id) { b += C.THOUGHTS[id].moBonus || 0; });
    return 2 + S.attrs.SOUL + b;
  }

  function parseTime(s) {
    var p = String(s).split(':').map(Number);
    var t = p[0] * 60 + (p[1] || 0);
    if (p[0] < 12) t += 1440;
    return t;
  }
  function fmtTime(t) {
    t = ((t % 1440) + 1440) % 1440;
    return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
  }

  // ---------------------------------------------------------------- expressions
  var H = {
    skill: function (k) { return skillVal(k); },
    pass: function (k, d) { return skillVal(k) + 6 >= d; },
    seen: function (id) { return S.seen[id] || 0; },
    thought: function (id) { return !!S.th.done[id]; },
    researching: function (id) { return S.th.slots.some(function (s) { return s && s.id === id; }); },
    known: function (id) { return !!S.th.unlocked[id]; },
    t: parseTime,
    align: function (k) { return S.align[k] || 0; },
    topalign: function () {
      var best = null, bv = 0;
      Object.keys(S.align).forEach(function (k) { if (S.align[k] > bv) { bv = S.align[k]; best = k; } });
      return best || '';
    },
    attr: function (k) { return S.attrs[k]; },
    clue: function (id) { return !!S.clues[id]; },
    task: function (id) { return S.tasks[id] ? (S.tasks[id].done ? 2 : 1) : 0; },
    chosen: function (id) { return !!S.chosen[id]; },
    Math: Math
  };
  var scope = new Proxy({}, {
    has: function (t, k) { return typeof k === 'string'; },
    get: function (t, k) {
      if (typeof k !== 'string') return undefined;
      if (Object.prototype.hasOwnProperty.call(H, k)) return H[k];
      if (k === 'time') return S.clock;
      if (k === 'hp') return S.hp;
      if (k === 'mo') return S.mo;
      if (k === 'undefined') return undefined;
      var v = S.v[k];
      return v === undefined ? 0 : v;
    }
  });
  var fcache = {};
  function ev(expr) {
    var f = fcache[expr];
    if (!f) {
      try {
        // eslint-disable-next-line no-new-func
        f = fcache[expr] = new Function('__s', 'with(__s){return (' + expr + ');}');
      } catch (e) { console.error('Bad expression:', expr, e); return false; }
    }
    try { return f(scope); } catch (e2) { console.error('Expression failed:', expr, e2); return false; }
  }

  // ---------------------------------------------------------------- text
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function interp(s) {
    s = s.replace(/\{\?([^|{}]+)\|([^|{}]*)(?:\|([^{}]*))?\}/g, function (_, e, a, b) { return ev(e) ? a : (b || ''); });
    s = s.replace(/\{=([^{}]+)\}/g, function (_, e) { return String(ev(e)); });
    return s;
  }
  function smart(s) {
    return s
      .replace(/(^|[\s(\[—–\/-])"/g, '$1“').replace(/"/g, '”')
      .replace(/(^|[\s(\[—–\/-])'/g, '$1‘').replace(/'/g, '’');
  }
  function fmt(s) {
    s = esc(interp(s));
    s = smart(s);
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return s;
  }
  function plain(s) { return interp(s).replace(/\*/g, ''); }

  // ---------------------------------------------------------------- DOM
  var $ = function (id) { return document.getElementById(id); };
  var feed, choicesEl, stage;

  function skillColor(k) { return 'var(--' + C.SKILLS[k].attr.toLowerCase() + ')'; }

  function entryHTML(e) {
    if (e.k === 'narr') return '<p>' + e.h + '</p>';
    if (e.k === 'doc') return '<p>' + e.h + '</p>';
    if (e.k === 'sys') return '<p>' + e.h + '</p>';
    if (e.k === 'roll') return e.h;
    if (e.k === 'act') return e.h;
    var sk = C.SKILLS[e.spk];
    var sp = C.SPEAKERS[e.spk] || {};
    var name = sk ? sk.name.toUpperCase() : sp.name;
    var style = sk ? ' style="color:' + skillColor(e.spk) + '"' : '';
    return '<p><span class="spk"' + style + '>' + esc(name) + '</span>' +
      (e.label ? ' <span class="lbl">[' + esc(e.label) + ']</span>' : '') +
      ' <span class="dash">–</span> <span class="tx">' + e.h + '</span></p>';
  }
  function entryClass(e) {
    var c = 'entry ' + e.k;
    if (e.k === 'line') {
      var sp = C.SPEAKERS[e.spk];
      if (C.SKILLS[e.spk]) c += ' skill';
      if (sp && sp.cls) c += ' ' + sp.cls;
    }
    if (e.old) c += ' old';
    return c;
  }
  function renderEntry(e, instant) {
    var div = document.createElement('div');
    div.className = entryClass(e);
    div.innerHTML = entryHTML(e);
    if (!instant && !reduceMotion) div.classList.add('fresh');
    if (e.k === 'sys' && e.open) {
      div.classList.add('clickable');
      div.tabIndex = 0;
      div.addEventListener('click', function () { openPanel(e.open); });
    }
    feed.appendChild(div);
    scrollFeed();
    return div;
  }
  function scrollFeed() {
    var box = $('scroll');
    box.scrollTop = box.scrollHeight;
  }
  function addEntry(e, instant) {
    S.log.push(e);
    if (S.log.length > 160) S.log.shift();
    return renderEntry(e, instant);
  }
  function markOld() {
    S.log.forEach(function (e) { e.old = true; });
    var nodes = feed.querySelectorAll('.entry:not(.old)');
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.add('old');
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- pacing
  var skipWait = null;
  var fastUntilChoice = false;
  function wait(ms) {
    if (fastUntilChoice || ms <= 0) return Promise.resolve();
    return new Promise(function (res) {
      var t = setTimeout(done, ms);
      function done() { clearTimeout(t); skipWait = null; res(); }
      skipWait = done;
    });
  }
  var clickResolve = null;
  function waitClick() {
    if (fastUntilChoice) return Promise.resolve();
    return new Promise(function (res) {
      choicesEl.innerHTML = '';
      var b = document.createElement('button');
      b.className = 'continue';
      b.textContent = 'Continue';
      b.addEventListener('click', function () { clickResolve = null; choicesEl.innerHTML = ''; res(); });
      choicesEl.appendChild(b);
      clickResolve = function () { clickResolve = null; choicesEl.innerHTML = ''; res(); };
    });
  }
  function paceFor(e) {
    if (settings.pace === 'instant') return 0;
    var len = (e.h || '').replace(/<[^>]+>/g, '').length;
    return Math.min(1700, 260 + len * 9);
  }
  var lastDelay = 0;
  // ---------------------------------------------------------------- voices
  var VOICED = { 'THE COLD': 1, FELIKS: 1, SARRE: 1, 'YOUR MOTHER': 1 };
  function fnv(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(36);
  }
  function voiceHash(spk, raw) {
    if (!(C.SKILLS[spk] || VOICED[spk]) || /\{[?=]/.test(raw)) return null;
    return fnv(spk + '|' + raw);
  }
  var voicing = null, voiceWaiting = false;
  function voiceOn() { return settings.sound && settings.voice !== 'off' && settings.pace !== 'instant' && C.audio && C.audio.voice; }
  function voiceStop() { voicing = null; if (C.audio && C.audio.voice) C.audio.voice.stop(); }
  function waitVoice() {
    var p = voicing;
    voicing = null;
    if (!p) return Promise.resolve();
    if (fastUntilChoice) { voiceStop(); return Promise.resolve(); }
    return new Promise(function (res) {
      var done = false;
      voiceWaiting = true;
      function fin() { if (done) return; done = true; voiceWaiting = false; skipWait = null; res(); }
      skipWait = function () { C.audio.voice.stop(); fin(); };
      p.then(function (played) { if (played === false) fin(); else setTimeout(fin, 220); });
    });
  }
  async function say(e) {
    if (settings.pace === 'click' && S.log.length && lastDelay > 0) {
      await waitClick();
      voiceStop();
    } else {
      await wait(lastDelay);
      await waitVoice();
    }
    addEntry(e);
    lastDelay = paceFor(e);
    if (e.vh && voiceOn() && !fastUntilChoice && C.audio.voice.has(e.vh)) {
      voicing = C.audio.voice.play(e.vh);
      if (settings.pace === 'flow') lastDelay = Math.min(lastDelay, 600);
    }
  }

  // ---------------------------------------------------------------- toasts & HUD
  function sfx(name) { if (C.audio && settings.sound) C.audio.sfx(name); }
  var TOAST_SFX = { task: 'chime_task', 'task done': 'chime_task', clue: 'chime_clue', thought: 'chime_thought', xp: 'xp', level: 'level', hurt: 'hurt', hurtmo: 'hurtmo', heal: 'heal', healmo: 'heal' };
  var xpPending = 0, xpTimer = null;
  function toast(kind, text, open) {
    if (TOAST_SFX[kind]) sfx(TOAST_SFX[kind]);
    var box = $('toasts');
    var max = window.innerWidth < 820 ? 2 : 4;
    while (box.children.length >= max) box.removeChild(box.firstChild);
    var d = document.createElement('div');
    d.className = 'toast ' + kind;
    d.innerHTML = text;
    if (open) {
      d.classList.add('clickable');
      d.addEventListener('click', function () { openPanel(open); });
    }
    box.appendChild(d);
    setTimeout(function () { d.classList.add('out'); }, 4200);
    setTimeout(function () { d.remove(); }, 5000);
  }

  function candleSVG(lit, kind) {
    return '<svg viewBox="0 0 14 34" class="candle ' + kind + (lit ? ' lit' : '') + '" aria-hidden="true">' +
      '<path class="flame" d="M7 1 C9.6 5 10 8 7 11.5 C4 8 4.4 5 7 1Z"/>' +
      '<rect class="wick" x="6.5" y="11" width="1" height="3"/>' +
      '<rect class="wax" x="3" y="13.5" width="8" height="20" rx="1"/></svg>';
  }
  function renderHUD() {
    var hm = hpMax(), mm = moMax();
    if (S.hp > hm) S.hp = hm;
    if (S.mo > mm) S.mo = mm;
    var h = '', m = '';
    for (var i = 0; i < hm; i++) h += candleSVG(i < S.hp, 'hp');
    for (var j = 0; j < mm; j++) m += candleSVG(j < S.mo, 'mo');
    $('hpC').innerHTML = h;
    $('moC').innerHTML = m;
    $('hpC').setAttribute('aria-label', 'Health ' + S.hp + ' of ' + hm);
    $('moC').setAttribute('aria-label', 'Morale ' + S.mo + ' of ' + mm);
    $('clock').textContent = fmtTime(S.clock);
    $('locName').textContent = S.title || '';
    $('ptsBadge').hidden = !(S.pts > 0);
    $('ptsBadge').textContent = S.pts;
  }

  // ---------------------------------------------------------------- effects
  function advance(n) {
    S.clock += n;
    checkThoughts();
    renderHUD();
  }
  function checkThoughts() {
    S.th.slots.forEach(function (s, i) {
      if (!s) return;
      var T = C.THOUGHTS[s.id];
      if (S.clock - s.start >= T.time) {
        S.th.slots[i] = null;
        S.th.done[s.id] = true;
        addEntry({ k: 'sys', h: '<span class="spk">THE DRAWER</span> <span class="dash">–</span> Thought internalized: <em>' + esc(T.name) + '</em>. <span class="hint">Open the Drawer to read it.</span>', open: 'drawer' });
        toast('thought', 'Thought internalized<br><b>' + esc(T.name) + '</b>', 'drawer');
      }
    });
  }
  function addXp(n) {
    S.xp += n;
    xpPending += n;
    clearTimeout(xpTimer);
    xpTimer = setTimeout(function () { toast('xp', '+' + xpPending + ' experience'); xpPending = 0; }, 900);
    while (S.xp >= (S.lvl + 1) * 100) {
      S.lvl++;
      S.pts++;
      toast('level', 'Level up — a skill point to spend in <b>Your File</b>', 'file');
    }
  }
  function changeHp(n) {
    var before = S.hp;
    S.hp = Math.max(0, Math.min(hpMax(), S.hp + n));
    if (S.hp !== before) {
      toast(n < 0 ? 'hurt' : 'heal', (n < 0 ? 'Health ' : 'Health +') + (S.hp - before));
      if (n < 0) flash('hurt');
    }
    renderHUD();
  }
  function changeMo(n) {
    var before = S.mo;
    S.mo = Math.max(0, Math.min(moMax(), S.mo + n));
    if (S.mo !== before) {
      toast(n < 0 ? 'hurtmo' : 'healmo', (n < 0 ? 'Morale ' : 'Morale +') + (S.mo - before));
      if (n < 0) flash('hurtmo');
    }
    renderHUD();
  }
  function flash(kind) {
    var f = $('flash');
    f.className = kind;
    void f.offsetWidth;
    f.classList.add('on');
  }

  async function dir(name, arg) {
    var m;
    switch (name) {
      case 'bg': S.bg = arg; setBg(arg); break;
      case 'title': S.title = interp(arg); renderHUD(); break;
      case 'clock': S.clock = parseTime(arg); renderHUD(); break;
      case 'time': advance(+arg); break;
      case 'set':
        m = /^(\w+)\s*(?:=\s*(.+))?$/.exec(arg);
        if (m) S.v[m[1]] = m[2] !== undefined ? ev(m[2]) : true;
        break;
      case 'add':
        m = arg.split(/\s+/);
        S.v[m[0]] = (+S.v[m[0]] || 0) + (+m[1]);
        break;
      case 'unset': delete S.v[arg]; break;
      case 'health': changeHp(+arg); if (S.hp <= 0) { await run('go_health'); return 'stop'; } break;
      case 'morale': changeMo(+arg); if (S.mo <= 0) { await run('go_morale'); return 'stop'; } break;
      case 'resethp': S.hp = hpMax(); S.mo = moMax(); renderHUD(); break;
      case 'xp': addXp(+arg); break;
      case 'thought':
        if (!S.th.unlocked[arg] && C.THOUGHTS[arg]) {
          S.th.unlocked[arg] = true;
          S.th.order.push(arg);
          toast('thought', 'New thought<br><b>' + esc(C.THOUGHTS[arg].name) + '</b>', 'drawer');
          addEntry({ k: 'sys', h: '<span class="spk">THE DRAWER</span> <span class="dash">–</span> A new thought: <em>' + esc(C.THOUGHTS[arg].name) + '</em>. <span class="hint">Open the Drawer to consider it.</span>', open: 'drawer' });
        }
        break;
      case 'task':
        m = /^(\w+)\s+(.+)$/.exec(arg);
        if (m && !S.tasks[m[1]]) {
          S.tasks[m[1]] = { text: m[2], done: false };
          S.taskOrder.push(m[1]);
          toast('task', 'Task added<br><b>' + esc(m[2]) + '</b>', 'docket');
        }
        break;
      case 'done':
        if (S.tasks[arg] && !S.tasks[arg].done) {
          S.tasks[arg].done = true;
          toast('task done', 'Task complete<br><b>' + esc(S.tasks[arg].text) + '</b>', 'docket');
        }
        break;
      case 'clue':
        m = /^(\w+)\s+(.+)$/.exec(arg);
        if (m && !S.clues[m[1]]) {
          S.clues[m[1]] = m[2];
          S.clueOrder.push(m[1]);
          toast('clue', 'Evidence entered', 'docket');
        }
        break;
      case 'align':
        m = arg.split(/\s+/);
        S.align[m[0]] = (S.align[m[0]] || 0) + (+m[1] || 1);
        break;
      case 'attr':
        m = arg.split(/\s+/);
        S.attrs[m[0]] = Math.max(1, Math.min(6, S.attrs[m[0]] + (+m[1])));
        renderHUD();
        break;
      case 'sig': S.sig = arg; break;
      case 'act': await actCard(arg); break;
      case 'music': S.music = arg; if (C.audio) C.audio.set(arg); break;
      case 'sfx': sfx(arg); break;
      case 'weather': S.weather = arg; if (C.weather) C.weather.set(arg); break;
      case 'checkpoint': lastDelay = 0; store(SAVE_KEY + '-cp', JSON.parse(JSON.stringify(S))); break;
      case 'hub': S.hub = S.node; break;
      case 'pause': await wait(+arg || 900); break;
      case 'end': S.ended = true; endScreen(); return 'stop';
      case 'gameover': S.ended = true; gameOver(arg); return 'stop';
      case 'openfile': openPanel('file'); break;
      default: console.warn('Unknown directive @' + name);
    }
    return null;
  }

  // ---------------------------------------------------------------- scenes
  var bgKey = null;
  var use3d = false;
  function paintScene(key) {
    if (use3d && C.scene3d && C.scene3d.ok) C.scene3d.show(key, S ? S.v : {});
    else if (C.painter) C.painter.show(key);
  }
  function setBg(key) {
    if (key === bgKey) return;
    bgKey = key;
    paintScene(key);
    if (C.audio && C.audio.scene) C.audio.scene(key, S ? S.v : {});
  }
  function setGraphics(mode) {
    settings.gfx = mode;
    store(SET_KEY, settings);
    var want3d = mode === '3d' && C.scene3d;
    if (want3d && !C.scene3d.ok) want3d = C.scene3d.init($('view3d'));
    use3d = !!want3d;
    $('view3d').hidden = !use3d;
    $('paintA').hidden = $('paintB').hidden = use3d;
    if (bgKey) paintScene(bgKey);
  }

  // ---------------------------------------------------------------- running nodes
  var runToken = 0;
  var pendingLabel = null;
  var running = false;

  async function run(id) {
    var token = ++runToken;
    running = true;
    var node = NODES[id];
    if (!node) {
      console.error('Missing node', id);
      addEntry({ k: 'sys', h: 'The page is torn here. (Missing scene: ' + esc(id) + ')' });
      return;
    }
    S.node = id;
    S.seen[id] = (S.seen[id] || 0) + 1;
    var jump = null, cont = null;
    for (var i = 0; i < node.items.length; i++) {
      if (token !== runToken) return;
      var it = node.items[i];
      if (it.t === 'choice') continue;
      if (it.cond && !ev(it.cond)) continue;
      if (it.t === 'dir') {
        var r = await dir(it.name, it.arg);
        if (r === 'stop') return;
        continue;
      }
      if (it.t === 'narr') { await say({ k: 'narr', h: fmt(it.text) }); continue; }
      if (it.t === 'line') {
        if (it.pass != null && !H.pass(it.spk, it.pass)) continue;
        var e = { k: it.spk === 'DOC' ? 'doc' : 'line', spk: it.spk, h: fmt(it.text) };
        if (e.k === 'doc') sfx('paper');
        else e.vh = voiceHash(it.spk, it.text);
        if (it.pass != null) e.label = C.DIFFICULTY(it.pass) + ': Success';
        else if (pendingLabel && pendingLabel.skill === it.spk) e.label = pendingLabel.label;
        if (e.k === 'line' && C.SKILLS[it.spk]) pendingLabel = null;
        await say(e);
        continue;
      }
      if (it.t === 'jump') { jump = it.target; break; }
      if (it.t === 'cont') { cont = it.target; break; }
    }
    if (token !== runToken) return;
    if (jump) return run(jump);
    pendingLabel = null;
    await wait(Math.min(lastDelay, 500));
    lastDelay = 0;
    fastUntilChoice = false;
    S.cont = cont;
    present();
  }

  function visibleChoices(node) {
    return node.items.filter(function (it) {
      if (it.t !== 'choice') return false;
      if (it.cond && !ev(it.cond)) return false;
      if (it.ccond && !ev(it.ccond)) return false;
      if (!it.sticky && S.chosen[it.id]) return false;
      if (it.check && it.check.red && S.checks[it.id]) return false;
      return true;
    });
  }
  function diffOf(chk) { return typeof chk.diff === 'string' ? Math.round(ev(chk.diff)) : chk.diff; }
  function chance(sv, d) {
    var n = 0;
    for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) {
      var s = a + b;
      if (s === 12 || (s !== 2 && s + sv >= d)) n++;
    }
    return n / 36;
  }

  function present() {
    running = false;
    var node = NODES[S.node];
    choicesEl.innerHTML = '';
    if (S.ended) return;
    var list = visibleChoices(node);
    if (list.length) {
      var ol = document.createElement('ol');
      ol.className = 'choice-list';
      list.forEach(function (it, i) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.className = 'choice';
        var html = '<span class="num">' + (i + 1) + '.</span> <span class="dash">–</span> ';
        var locked = false;
        if (it.check) {
          var d = diffOf(it.check);
          var sv = skillVal(it.check.skill);
          var rec = S.checks[it.id];
          locked = !it.check.red && rec && rec.fail != null && sv <= rec.fail;
          var auto = rec && rec.ok;
          var nm = C.SKILLS[it.check.skill].name;
          html += '<span class="ck ' + (it.check.red ? 'red' : 'white') + '" style="--sc:' + skillColor(it.check.skill) + '">[' +
            esc(nm) + ' – ' + C.DIFFICULTY(d) + ' ' + d + ']</span> ';
          if (!auto && !locked) html += '<span class="pct">' + Math.round(chance(sv, d) * 100) + '%</span> ';
          if (locked) html += '<span class="lock">Locked — raise ' + esc(nm) + ' to retry</span> ';
          b.title = (it.check.red ? 'Red check: one attempt only.' : 'White check: can be retried once the skill improves.') +
            ' ' + nm + ' ' + sv + ' + 2d6 vs ' + d + '.';
        }
        html += '<span class="ct">' + fmt(it.text) + '</span>';
        b.innerHTML = html;
        if (locked) b.disabled = true;
        else b.addEventListener('click', function () { choose(it); });
        li.appendChild(b);
        ol.appendChild(li);
      });
      choicesEl.appendChild(ol);
    } else if (S.cont) {
      var c = document.createElement('button');
      c.className = 'continue';
      c.textContent = 'Continue';
      var target = S.cont;
      c.addEventListener('click', function () { go(target); });
      choicesEl.appendChild(c);
    } else if (S.hub && S.hub !== S.node) {
      var back = document.createElement('button');
      back.className = 'continue';
      back.textContent = 'Step back';
      var hub = S.hub;
      back.addEventListener('click', function () { go(hub); });
      choicesEl.appendChild(back);
    }
    save();
    var first = choicesEl.querySelector('button:not([disabled])');
    if (first && !isTouch) first.focus({ preventScroll: true });
  }
  var isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  var busy = false;
  async function go(target) {
    if (busy) return;
    busy = true;
    voiceStop();
    sfx('click');
    snapshotLast();
    markOld();
    choicesEl.innerHTML = '';
    busy = false;
    await run(target);
  }

  async function choose(it) {
    if (busy) return;
    busy = true;
    voiceStop();
    sfx('click');
    snapshotLast();
    markOld();
    choicesEl.innerHTML = '';
    var said = plain(it.text).trim();
    var bracket = /^\[.*\]$/.test(said);
    addEntry({ k: 'line', spk: 'YOU', h: bracket ? '<span class="act">' + fmt(it.text) + '</span>' : fmt(it.text) });
    var target = it.target;
    if (it.check) {
      var rec = S.checks[it.id];
      if (rec && rec.ok) {
        target = it.target;
      } else {
        var ok = await roll(it.check);
        if (it.check.red) S.checks[it.id] = { red: true, ok: ok };
        else if (ok) S.checks[it.id] = { ok: true };
        else S.checks[it.id] = { fail: skillVal(it.check.skill) };
        if (ok && !it.sticky) S.chosen[it.id] = true;
        if (it.check.red && !it.sticky) S.chosen[it.id] = true;
        target = ok ? it.target : (it.fail || it.target);
      }
    } else if (!it.sticky) {
      S.chosen[it.id] = true;
    }
    lastDelay = 350;
    busy = false;
    await run(target);
  }

  var DIE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  async function roll(chk) {
    var d = diffOf(chk);
    var sv = skillVal(chk.skill);
    var a = 1 + Math.floor(Math.random() * 6);
    var b = 1 + Math.floor(Math.random() * 6);
    var ok = (a + b === 12) || (a + b !== 2 && a + b + sv >= d);
    sfx('dice');
    var nm = C.SKILLS[chk.skill].name.toUpperCase();
    var label = C.DIFFICULTY(d) + ': ' + (ok ? 'Success' : 'Failure');
    var h = '<div class="rollcard ' + (ok ? 'ok' : 'bad') + (chk.red ? ' red' : '') + '">' +
      '<span class="dice"><span class="die">' + DIE[a - 1] + '</span><span class="die">' + DIE[b - 1] + '</span></span>' +
      '<span class="rtx"><b style="color:' + skillColor(chk.skill) + '">' + nm + '</b> ' + esc(label) +
      '<small>' + a + ' + ' + b + ' + ' + nm.charAt(0) + nm.slice(1).toLowerCase() + ' ' + sv + ' = ' + (a + b + sv) + ' against ' + d +
      (a + b === 12 ? ' — double six' : a + b === 2 ? ' — snake eyes' : '') + '</small></span></div>';
    await wait(250);
    addEntry({ k: 'roll', h: h });
    sfx(ok ? 'success' : 'fail');
    pendingLabel = { skill: chk.skill, label: label };
    return ok;
  }

  // ---------------------------------------------------------------- saves
  function save() { if (S && !S.ended) store(SAVE_KEY, S); }
  var lastSnap = null;
  function snapshotLast() {
    lastSnap = JSON.parse(JSON.stringify(S));
    store(SAVE_KEY + '-last', lastSnap);
  }
  function restore(state) {
    S = Object.assign(newState(), state);
    S.ended = false;
    feed.innerHTML = '';
    S.log.forEach(function (e) { renderEntry(e, true); });
    bgKey = null;
    setBg(S.bg);
    if (C.audio) C.audio.set(S.music);
    if (C.weather) C.weather.set(S.weather);
    renderHUD();
    present();
  }

  // ---------------------------------------------------------------- overlays
  function actCard(arg) {
    var m = /^"([^"]*)"\s*"([^"]*)"$/.exec(arg) || [null, arg, ''];
    addEntry({ k: 'act', h: '<div class="acthead"><span>' + esc(m[1]) + '</span>' + esc(m[2]) + '</div>' }, true);
    fastUntilChoice = false;
    return new Promise(function (res) {
      var el = $('actcard');
      el.innerHTML = '<div class="actin"><div class="actno">' + esc(m[1]) + '</div><div class="actname">' + esc(m[2]) + '</div><div class="acthint">Click to continue</div></div>';
      el.hidden = false;
      voiceStop();
      sfx('act');
      requestAnimationFrame(function () { el.classList.add('on'); });
      var done = false;
      function close() {
        if (done) return;
        done = true;
        el.classList.remove('on');
        setTimeout(function () { el.hidden = true; res(); }, reduceMotion ? 0 : 500);
      }
      el.onclick = close;
      el.onkeydown = close;
      setTimeout(close, 4200);
    });
  }

  function examinerType() {
    var v = S.v;
    var first = {
      misadventure: 'The Merciful Examiner',
      self: 'The Exact Examiner',
      unlawful: 'The Crown’s Hammer',
      open: 'The Open Examiner',
      service: 'The Examiner of the Fifth Line'
    }[v.verdict] || 'The Examiner';
    var second = [];
    if (S.th.done.clean) second.push('Clean as frost');
    if ((v.thaw || 0) >= 5) second.push('Thawed');
    else if ((v.thaw || 0) <= 0) second.push('Still frozen');
    if (v.danced) second.push('Danced on the grave');
    if (v.went_under) second.push('Went under the ice');
    if (v.brother_entered) second.push('Entered his brother into the record');
    return { title: first, notes: second };
  }

  function endScreen() {
    var t = examinerType();
    var v = S.v;
    var alignTop = H.topalign();
    var el = $('endcard');
    var verdictName = {
      misadventure: 'Misadventure', self: 'Self-inflicted', unlawful: 'Unlawful killing',
      open: 'Open verdict', service: 'Died in the service of the Glass'
    }[v.verdict] || '—';
    var lives = v.evac === 3 ? 'Every soul off the ice.' : (v.dead ? v.dead + ' drowned when the Glass went down.' : '—');
    el.innerHTML = '<div class="endin">' +
      '<div class="endkicker">The Last Line</div>' +
      '<h2>' + esc(t.title) + '</h2>' +
      (t.notes.length ? '<p class="endnotes">' + t.notes.map(esc).join(' · ') + '</p>' : '') +
      '<dl class="endstats">' +
      '<dt>Ruling on Ailo Sarre</dt><dd>' + esc(verdictName) + (v.ilse_entered === false ? ' <em>(not entered by the clerk)</em>' : '') + '</dd>' +
      '<dt>The Glass</dt><dd>' + esc(lives) + '</dd>' +
      '<dt>Ilse Varga</dt><dd>' + esc((v.ilse || 0) >= 4 ? 'Calls you Aurel.' : (v.ilse || 0) >= 2 ? 'Still your clerk.' : 'Requested a transfer.') + '</dd>' +
      '<dt>Thoughts internalized</dt><dd>' + (Object.keys(S.th.done).map(function (k) { return esc(C.THOUGHTS[k].name); }).join(', ') || 'None') + '</dd>' +
      '<dt>Leaning</dt><dd>' + (alignTop ? esc(C.ALIGN[alignTop].name) + ' — ' + esc(C.ALIGN[alignTop].motto) : 'None in particular. The Office approves.') + '</dd>' +
      '<dt>Hours on the ice</dt><dd>' + fmtTime(S.clock) + ', dawn</dd>' +
      '</dl>' +
      '<div class="endbtns"><button id="endRead">Read the transcript</button><button id="endAgain">Begin again</button></div>' +
      '<p class="endcredit">CANDLE ICE — an inquest in one night. Written and built after <em>Disco Elysium</em> (ZA/UM, 2019), with gratitude.</p>' +
      '</div>';
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add('on'); });
    drop(SAVE_KEY);
    $('endRead').onclick = function () { el.classList.remove('on'); el.hidden = true; };
    $('endAgain').onclick = function () { el.classList.remove('on'); el.hidden = true; newGame(); };
  }

  function gameOver(arg) {
    var m = /^"([^"]*)"\s*"([^"]*)"$/.exec(arg) || [null, arg, ''];
    var el = $('endcard');
    el.innerHTML = '<div class="endin over">' +
      '<div class="endkicker">The ice closes</div>' +
      '<h2>' + esc(m[1]) + '</h2>' +
      '<p class="endnotes">' + esc(m[2]) + '</p>' +
      '<div class="endbtns"><button id="goLast">Return to your last choice</button><button id="goAct">Restart the act</button><button id="goTitle">Title</button></div></div>';
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add('on'); });
    function close() { el.classList.remove('on'); el.hidden = true; }
    $('goLast').onclick = function () {
      var st = lastSnap || load(SAVE_KEY + '-last');
      close();
      if (st) restore(st); else newGame();
    };
    $('goAct').onclick = function () {
      var st = load(SAVE_KEY + '-cp');
      close();
      if (st) restore(st); else newGame();
    };
    $('goTitle').onclick = function () { close(); showTitle(); };
  }

  // ---------------------------------------------------------------- panels
  function openPanel(kind) {
    var ov = $('overlay');
    var body = $('panelBody');
    ov.hidden = false;
    ov.dataset.kind = kind;
    document.querySelectorAll('.tab').forEach(function (t) { t.setAttribute('aria-selected', t.dataset.panel === kind ? 'true' : 'false'); });
    if (kind === 'file') body.innerHTML = fileHTML();
    else if (kind === 'drawer') body.innerHTML = drawerHTML();
    else if (kind === 'docket') body.innerHTML = docketHTML();
    else if (kind === 'menu') body.innerHTML = menuHTML();
    wirePanel(kind);
    requestAnimationFrame(function () { ov.classList.add('on'); });
  }
  function closePanel() {
    var ov = $('overlay');
    ov.classList.remove('on');
    ov.hidden = true;
    renderHUD();
    if (!S.ended && !busy && !running && S.node && $('title').hidden) present();
  }

  function fileHTML() {
    var h = '<header class="phead"><div class="pkicker">Inquest Office of Aubade · Personnel</div><h2>Aurel Anselm Marrow</h2>' +
      '<p class="psub">Examiner, Third Bench · 29 years’ service · 4,106 Last Lines entered</p></header>';
    var need = (S.lvl + 1) * 100;
    h += '<div class="xpline"><span>Level ' + S.lvl + '</span><span class="xpbar"><i style="width:' +
      Math.round(((S.xp - S.lvl * 100) / 100) * 100) + '%"></i></span><span>' + S.xp + ' / ' + need + ' xp</span>' +
      (S.pts ? '<span class="ptsfree">' + S.pts + ' skill point' + (S.pts > 1 ? 's' : '') + ' to spend</span>' : '') + '</div>';
    h += '<div class="vitals"><span>Health ' + S.hp + ' / ' + hpMax() + '</span><span>Morale ' + S.mo + ' / ' + moMax() + '</span></div>';
    h += '<div class="attrgrid">';
    C.ATTR_ORDER.forEach(function (a) {
      var A = C.ATTRS[a];
      h += '<section class="attr" style="--ac:var(--' + a.toLowerCase() + ')"><h3><span>' + A.name + '</span><b>' + S.attrs[a] + '</b></h3><p class="ablurb">' + A.blurb + '</p><ul>';
      C.SKILL_ORDER.filter(function (k) { return C.SKILLS[k].attr === a; }).forEach(function (k) {
        var sk = C.SKILLS[k];
        var tm = thoughtMod(k);
        var canUp = S.pts > 0 && (S.learned[k] || 0) < 2;
        h += '<li><details><summary><span class="sn">' + sk.name + (S.sig === k ? ' <i class="sig" title="Signature skill">signature</i>' : '') + '</span>' +
          '<span class="sv">' + skillVal(k) + (tm ? '<small>' + (tm > 0 ? '+' : '') + tm + '</small>' : '') + '</span>' +
          (canUp ? '<button class="up" data-skill="' + k + '" aria-label="Raise ' + sk.name + '">+</button>' : '') +
          '</summary><p>' + sk.desc + '</p></details></li>';
      });
      h += '</ul></section>';
    });
    h += '</div>';
    h += '<section class="aligns"><h3>Political leanings</h3><ul>';
    Object.keys(C.ALIGN).forEach(function (k) {
      var n = S.align[k] || 0;
      h += '<li><span>' + C.ALIGN[k].name + '</span><span class="ab">' + '■'.repeat(Math.min(n, 8)) + '<i>' + '□'.repeat(Math.max(0, 4 - Math.min(n, 4))) + '</i></span><small>' + C.ALIGN[k].motto + '</small></li>';
    });
    h += '</ul></section>';
    return h;
  }

  function drawerHTML() {
    var h = '<header class="phead"><div class="pkicker">The Drawer</div><h2>Thoughts too cold to handle</h2>' +
      '<p class="psub">Put a thought in a drawer and let time work on it. While it sets, it may cost you something. Once internalized, it stays.</p></header>';
    h += '<div class="slots">';
    S.th.slots.forEach(function (s, i) {
      if (s) {
        var T = C.THOUGHTS[s.id];
        var left = Math.max(0, T.time - (S.clock - s.start));
        h += '<div class="slot full"><div class="sname">' + esc(T.name) + '</div><div class="sleft">' + left + ' min left</div>' +
          effectsHTML(T.during, 'While setting') + '<button class="forget" data-slot="' + i + '">Take it out</button></div>';
      } else {
        h += '<div class="slot empty"><div class="sname">Empty drawer</div></div>';
      }
    });
    h += '</div>';
    var avail = S.th.order.filter(function (id) {
      return !S.th.done[id] && !S.th.slots.some(function (s) { return s && s.id === id; });
    });
    var free = S.th.slots.indexOf(null) >= 0;
    h += '<h3 class="subh">Unconsidered</h3>';
    if (!avail.length) h += '<p class="empty-note">Nothing waiting. Talk to people. Listen to yourself.</p>';
    avail.forEach(function (id) {
      var T = C.THOUGHTS[id];
      h += '<article class="thought"><h4>' + esc(T.name) + '</h4><p>' + esc(T.problem) + '</p>' +
        effectsHTML(T.during, 'While setting') + effectsHTML(T.after, 'Once internalized') +
        '<p class="ttime">Takes ' + T.time + ' minutes</p>' +
        (free ? '<button class="research" data-id="' + id + '">Put it in the Drawer</button>' : '<p class="empty-note">All drawers are full.</p>') + '</article>';
    });
    var done = Object.keys(S.th.done);
    h += '<h3 class="subh">Internalized</h3>';
    if (!done.length) h += '<p class="empty-note">Nothing yet.</p>';
    done.forEach(function (id) {
      var T = C.THOUGHTS[id];
      h += '<article class="thought done"><h4>' + esc(T.name) + '</h4>' +
        T.solution.split('\n\n').map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
        effectsHTML(T.after, 'Effect') + '</article>';
    });
    return h;
  }
  function effectsHTML(fx, label) {
    if (!fx || !Object.keys(fx).length) return '';
    return '<p class="fx"><span>' + label + ':</span> ' + Object.keys(fx).map(function (k) {
      var n = fx[k];
      return '<b style="color:' + skillColor(k) + '">' + C.SKILLS[k].name + ' ' + (n > 0 ? '+' : '−') + Math.abs(n) + '</b>';
    }).join(', ') + '</p>';
  }

  function docketHTML() {
    var h = '<header class="phead"><div class="pkicker">Docket 4417 · The Glass</div><h2>In re: Ailo Sarre, Warden</h2>' +
      '<p class="psub">' + fmtTime(S.clock) + ' · The Basin, Aubade</p></header>';
    h += '<h3 class="subh">Tasks</h3><ul class="tasks">';
    if (!S.taskOrder.length) h += '<li class="empty-note">No open tasks.</li>';
    S.taskOrder.slice().sort(function (a, b) { return (S.tasks[a].done ? 1 : 0) - (S.tasks[b].done ? 1 : 0); }).forEach(function (id) {
      var t = S.tasks[id];
      h += '<li class="' + (t.done ? 'done' : '') + '"><span class="box">' + (t.done ? '✓' : '') + '</span>' + esc(t.text) + '</li>';
    });
    h += '</ul><h3 class="subh">Evidence entered</h3><ol class="clues">';
    if (!S.clueOrder.length) h += '<li class="empty-note">Nothing entered.</li>';
    S.clueOrder.forEach(function (id) { h += '<li>' + esc(S.clues[id]) + '</li>'; });
    h += '</ol>';
    return h;
  }

  var hasVoices = !!(C.VOICE_MANIFEST && C.VOICE_MANIFEST.files && C.VOICE_MANIFEST.files.length);
  function volRow(k, label) {
    var v = settings.vols[k];
    return '<label class="vol"><span>' + label + '</span><input type="range" min="0" max="100" step="5" data-vol="' + k + '" value="' + Math.round(v * 100) + '" aria-label="' + label + ' volume"></label>';
  }
  function applyVolumes() {
    if (!C.audio || !C.audio.setVolume) return;
    ['music', 'sfx', 'voice'].forEach(function (k) { C.audio.setVolume(k, settings.vols[k]); });
  }
  function menuHTML() {
    var p = settings.pace;
    return '<header class="phead"><div class="pkicker">Settings</div><h2>How the night is read</h2></header>' +
      '<fieldset class="opt"><legend>Text pace</legend>' +
      '<label><input type="radio" name="pace" id="paceFlow" value="flow"' + (p === 'flow' ? ' checked' : '') + '> Flowing — lines arrive one after another (click to hurry)</label>' +
      '<label><input type="radio" name="pace" id="paceClick" value="click"' + (p === 'click' ? ' checked' : '') + '> By hand — press Continue for every line</label>' +
      '<label><input type="radio" name="pace" id="paceInstant" value="instant"' + (p === 'instant' ? ' checked' : '') + '> All at once</label>' +
      '</fieldset>' +
      '<fieldset class="opt"><legend>Sound</legend><label><input type="checkbox" id="soundOpt"' + (settings.sound ? ' checked' : '') + '> Music, ambience and effects (made in your browser)</label>' +
      '<label><input type="checkbox" id="voiceOpt"' + (settings.voice !== 'off' ? ' checked' : '') + (hasVoices ? '' : ' disabled') + '> Voice the sixteen skills and the dead' + (hasVoices ? '' : ' <em>(voice files not found)</em>') + '</label>' +
      volRow('music', 'Music') + volRow('sfx', 'Effects') + volRow('voice', 'Voices') + '</fieldset>' +
      '<fieldset class="opt"><legend>Pictures</legend>' +
      '<label><input type="radio" name="gfx" value="3d"' + (settings.gfx !== '2d' ? ' checked' : '') + (C.scene3d ? '' : ' disabled') + '> Painted in 3D (needs WebGL)</label>' +
      '<label><input type="radio" name="gfx" value="2d"' + (settings.gfx === '2d' ? ' checked' : '') + '> Flat sketches (lighter on old machines)</label></fieldset>' +
      '<div class="menubtns"><button id="mUndo">Undo last choice</button><button id="mAct">Restart this act</button><button id="mTitle">Save &amp; quit to title</button></div>' +
      '<p class="keys">Keys: <kbd>1</kbd>–<kbd>9</kbd> choose · <kbd>Space</kbd> continue or hurry · <kbd>F</kbd> file · <kbd>D</kbd> drawer · <kbd>J</kbd> docket · <kbd>Esc</kbd> close</p>' +
      '<p class="keys">The game saves itself at every choice, in this browser only.</p>';
  }

  function wirePanel(kind) {
    var body = $('panelBody');
    if (kind === 'file') {
      body.querySelectorAll('button.up').forEach(function (b) {
        b.addEventListener('click', function (ev2) {
          ev2.preventDefault();
          var k = b.dataset.skill;
          if (S.pts > 0 && (S.learned[k] || 0) < 2) {
            S.learned[k] = (S.learned[k] || 0) + 1;
            S.pts--;
            save();
            openPanel('file');
          }
        });
      });
    }
    if (kind === 'drawer') {
      body.querySelectorAll('button.research').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = S.th.slots.indexOf(null);
          if (i < 0) return;
          S.th.slots[i] = { id: b.dataset.id, start: S.clock };
          save();
          openPanel('drawer');
        });
      });
      body.querySelectorAll('button.forget').forEach(function (b) {
        b.addEventListener('click', function () {
          S.th.slots[+b.dataset.slot] = null;
          save();
          openPanel('drawer');
        });
      });
    }
    if (kind === 'menu') {
      body.querySelectorAll('input[name=pace]').forEach(function (r) {
        r.addEventListener('change', function () { settings.pace = r.value; store(SET_KEY, settings); });
      });
      $('soundOpt').addEventListener('change', function (e) {
        settings.sound = e.target.checked;
        store(SET_KEY, settings);
        if (C.audio) C.audio.enable(settings.sound);
        syncSoundBtn();
      });
      $('voiceOpt').addEventListener('change', function (e) {
        settings.voice = e.target.checked ? 'inner' : 'off';
        store(SET_KEY, settings);
        if (!e.target.checked) voiceStop();
      });
      body.querySelectorAll('input[data-vol]').forEach(function (r) {
        r.addEventListener('input', function () {
          settings.vols[r.dataset.vol] = +r.value / 100;
          store(SET_KEY, settings);
          applyVolumes();
        });
      });
      body.querySelectorAll('input[name=gfx]').forEach(function (r) {
        r.addEventListener('change', function () { setGraphics(r.value); });
      });
      $('mUndo').addEventListener('click', function () {
        var st = lastSnap || load(SAVE_KEY + '-last');
        closePanel();
        if (st) restore(st);
      });
      $('mAct').addEventListener('click', function () {
        var st = load(SAVE_KEY + '-cp');
        closePanel();
        if (st) restore(st);
      });
      $('mTitle').addEventListener('click', function () { save(); closePanel(); showTitle(); });
    }
  }

  function syncSoundBtn() {
    var b = $('soundBtn');
    b.setAttribute('aria-pressed', settings.sound ? 'true' : 'false');
    b.textContent = settings.sound ? 'Sound on' : 'Sound off';
  }

  // ---------------------------------------------------------------- title
  function showTitle() {
    var t = $('title');
    t.hidden = false;
    $('app').classList.add('titlemode');
    window.dispatchEvent(new Event('resize'));
    var has = !!load(SAVE_KEY);
    $('btnContinue').hidden = !has;
    bgKey = 'title';
    paintScene('title');
    if (C.audio && C.audio.scene) C.audio.scene('title', {});
    requestAnimationFrame(function () { t.classList.add('on'); });
  }
  function hideTitle() {
    var t = $('title');
    t.classList.remove('on');
    t.hidden = true;
    $('app').classList.remove('titlemode');
    window.dispatchEvent(new Event('resize'));
  }
  function newGame() {
    drop(SAVE_KEY);
    drop(SAVE_KEY + '-cp');
    drop(SAVE_KEY + '-last');
    S = newState();
    feed.innerHTML = '';
    choicesEl.innerHTML = '';
    bgKey = null;
    hideTitle();
    renderHUD();
    lastDelay = 0;
    run('start');
  }

  // ---------------------------------------------------------------- input
  function onKey(e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    var ov = $('overlay');
    if (e.key === 'Escape') { if (!ov.hidden) closePanel(); return; }
    if (!$('title').hidden || !$('endcard').hidden) return;
    if (!ov.hidden) return;
    if (!$('actcard').hidden) return;
    if (/^[1-9]$/.test(e.key)) {
      var btns = choicesEl.querySelectorAll('button.choice');
      var b = btns[+e.key - 1];
      if (b && !b.disabled) { e.preventDefault(); b.click(); }
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      if (e.target && e.target.tagName === 'BUTTON' && e.key === 'Enter') return;
      if (skipWait) { e.preventDefault(); if (!voiceWaiting) fastUntilChoice = true; skipWait(); return; }
      if (clickResolve) { e.preventDefault(); clickResolve(); return; }
      var c = choicesEl.querySelector('button.continue');
      if (c) { e.preventDefault(); c.click(); }
      return;
    }
    var k = e.key.toLowerCase();
    if (k === 'f') openPanel('file');
    else if (k === 'd') openPanel('drawer');
    else if (k === 'j') openPanel('docket');
  }

  // ---------------------------------------------------------------- boot
  function boot(data) {
    feed = $('feed');
    choicesEl = $('choices');
    stage = $('stage');
    if (C.painter) C.painter.init($('paintA'), $('paintB'));
    if (C.scene3d) C.scene3d.onlost = function () { setGraphics('2d'); };
    setGraphics(settings.gfx || '3d');
    if (C.weather) C.weather.init($('weather'));
    document.addEventListener('keydown', onKey);
    $('scroll').addEventListener('click', function (e) {
      if (e.target.closest('button') || e.target.closest('.clickable')) return;
      if (skipWait) { if (!voiceWaiting) fastUntilChoice = true; skipWait(); }
    });
    document.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        if ($('overlay').hidden || $('overlay').dataset.kind !== t.dataset.panel) openPanel(t.dataset.panel);
        else closePanel();
      });
    });
    $('closePanel').addEventListener('click', closePanel);
    $('overlay').addEventListener('click', function (e) { if (e.target === $('overlay')) closePanel(); });
    $('btnNew').addEventListener('click', function () {
      if (C.audio) C.audio.enable(settings.sound);
      newGame();
    });
    $('btnContinue').addEventListener('click', function () {
      var st = load(SAVE_KEY);
      if (C.audio) C.audio.enable(settings.sound);
      hideTitle();
      if (st) restore(st); else newGame();
    });
    $('soundBtn').addEventListener('click', function () {
      settings.sound = !settings.sound;
      store(SET_KEY, settings);
      if (C.audio) C.audio.enable(settings.sound);
      syncSoundBtn();
    });
    syncSoundBtn();
    applyVolumes();

    if (window.claude && window.claude.hot && window.claude.hot.snapshot) {
      try { window.claude.hot.snapshot(function () { return { S: S }; }); } catch (e) { /* ignore */ }
    }
    S = newState();
    renderHUD();
    if (data && data.S && data.S.node) {
      hideTitle();
      restore(data.S);
    } else {
      showTitle();
    }
  }

  C.engine = { NODES: NODES, errors: parsed.errors, fmtTime: fmtTime };

  function start(data) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { boot(data); });
    else boot(data);
  }
  var hot = window.claude && window.claude.hot;
  if (hot && hot.ready) hot.ready(start);
  else start((hot && hot.data) || {});
})();
