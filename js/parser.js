/* CANDLE ICE — script parser.
 *
 * Script format (one directive or line per row):
 *   == node_id                         start a node
 *   // comment
 *   > narration
 *   SPEAKER: text                      dialogue; SPEAKER is a skill or a registered speaker
 *   SKILL(10): text                    passive check: shown only if skill + 6 >= 10
 *   @directive args                    effects (@set, @add, @bg, @time, @thought, ...)
 *   @if expr / @elif expr / @else / @endif   conditional blocks
 *   ?{expr} <any line>                 conditional line
 *   * text -> target                   choice (disappears once taken)
 *   + text -> target                   sticky choice (always offered)
 *   * {expr} text -> target            conditional choice
 *   * [SKILL 10] text -> ok | fail     white check (retry after the skill rises)
 *   * [SKILL 10 red] text -> ok | fail red check (one attempt)
 *   -> target                          CONTINUE button
 *   => target                          immediate jump
 */
(function (root) {
  'use strict';

  var SPEAKER_RE = /^([A-Z][A-Z .'\-]*?)(?:\((\d+)\))?:\s*(.*)$/;

  function parse(sources, registry) {
    var nodes = {};
    var errors = [];
    sources.forEach(function (src) {
      var lines = src.split(/\r?\n/);
      var node = null;
      var stack = [];
      function blockCond() {
        if (!stack.length) return null;
        return stack.map(function (s) { return '(' + s.cur + ')'; }).join('&&');
      }
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line.indexOf('//') === 0) continue;
        var m;
        if ((m = /^==\s*([\w.]+)\s*$/.exec(line))) {
          if (node && stack.length) errors.push(node.id + ': unclosed @if');
          if (nodes[m[1]]) errors.push('Duplicate node: ' + m[1]);
          node = nodes[m[1]] = { id: m[1], items: [], choiceCount: 0 };
          stack = [];
          continue;
        }
        if (!node) { errors.push('Text outside any node: ' + line); continue; }
        if ((m = /^@if\s+(.+)$/.exec(line))) { stack.push({ raws: [m[1]], cur: m[1] }); continue; }
        if ((m = /^@elif\s+(.+)$/.exec(line))) {
          var s1 = stack[stack.length - 1];
          if (!s1) { errors.push(node.id + ': @elif without @if'); continue; }
          s1.cur = s1.raws.map(function (r) { return '!(' + r + ')'; }).join('&&') + '&&(' + m[1] + ')';
          s1.raws.push(m[1]);
          continue;
        }
        if (/^@else\s*$/.test(line)) {
          var s2 = stack[stack.length - 1];
          if (!s2) { errors.push(node.id + ': @else without @if'); continue; }
          s2.cur = s2.raws.map(function (r) { return '!(' + r + ')'; }).join('&&');
          continue;
        }
        if (/^@endif\s*$/.test(line)) {
          if (!stack.length) errors.push(node.id + ': @endif without @if');
          stack.pop();
          continue;
        }
        var cond = blockCond();
        if ((m = /^\?\{([^}]*)\}\s*(.*)$/.exec(line))) {
          cond = cond ? cond + '&&(' + m[1] + ')' : m[1];
          line = m[2];
        }
        var item = parseLine(line, node, errors, registry);
        if (item) {
          item.cond = cond;
          node.items.push(item);
        }
      }
      if (node && stack.length) errors.push(node.id + ': unclosed @if at end of file');
    });
    return { nodes: nodes, errors: errors };
  }

  function parseLine(line, node, errors, registry) {
    var m;
    if ((m = /^@(\w+)\s*(.*)$/.exec(line))) return { t: 'dir', name: m[1], arg: m[2].trim() };
    if ((m = /^->\s*([\w.]+)\s*$/.exec(line))) return { t: 'cont', target: m[1] };
    if ((m = /^=>\s*([\w.]+)\s*$/.exec(line))) return { t: 'jump', target: m[1] };
    if ((m = /^([*+])\s+(.*)$/.exec(line))) {
      var rest = m[2];
      var ccond = null;
      var check = null;
      if (rest.charAt(0) === '{') {
        var e = rest.indexOf('}');
        ccond = rest.slice(1, e);
        rest = rest.slice(e + 1).trim();
      }
      var cm = /^\[([A-Z]+)\s+(\{[^}]*\}|\d+)(?:\s+(red|white))?\]\s*(.*)$/.exec(rest);
      if (cm && registry.skills[cm[1]]) {
        check = {
          skill: cm[1],
          diff: cm[2].charAt(0) === '{' ? cm[2].slice(1, -1) : +cm[2],
          red: cm[3] === 'red'
        };
        rest = cm[4];
      }
      var am = /^(.*?)\s*->\s*([\w.]+)(?:\s*\|\s*([\w.]+))?\s*$/.exec(rest);
      if (!am) { errors.push(node.id + ': malformed choice: ' + line); return null; }
      var idx = node.choiceCount++;
      return {
        t: 'choice', id: node.id + '#' + idx, sticky: m[1] === '+',
        ccond: ccond, check: check, text: am[1], target: am[2], fail: am[3] || null
      };
    }
    if ((m = /^>\s?(.*)$/.exec(line))) return { t: 'narr', text: m[1] };
    if ((m = SPEAKER_RE.exec(line))) {
      var spk = m[1].trim();
      if (registry.skills[spk] || registry.speakers[spk]) {
        return { t: 'line', spk: spk, pass: m[2] ? +m[2] : null, text: m[3] };
      }
    }
    errors.push(node.id + ': unrecognised line: ' + line);
    return { t: 'narr', text: line };
  }

  var api = { parse: parse };
  if (root.CANDLE) root.CANDLE.parser = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
