#!/usr/bin/env node
/* Bundles the game into single files:
 *   dist/candle-ice.html   standalone page (open it straight from disk)
 *   dist/artifact.html     the same page without the <html>/<head>/<body> shell,
 *                          for hosts that wrap the page themselves
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const html = read('index.html');

const css = read('css/style.css');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
const js = scripts.map((src) => `<script>/* ${src} */\n${read(src).replace(/<\/script/gi, '<\\/script')}\n</script>`).join('\n');

const title = /<title>[\s\S]*?<\/title>/.exec(html)[0];
const desc = /<meta name="description"[^>]*>/.exec(html)[0];
const fonts = [...html.matchAll(/<link rel="(?:preconnect|stylesheet)" href="https:\/\/fonts[^>]*>/g)].map((m) => m[0]).join('\n');
const body = /<!--BODY-->([\s\S]*?)<!--\/BODY-->/.exec(html)[1].trim();

const standalone = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${title}
${desc}
${fonts}
<style>
${css}
</style>
</head>
<body>
${body}
${js}
</body>
</html>
`;

const artifact = `${title}
${fonts}
<style>
${css}
html, body { height: 100%; }
</style>
${body}
${js}
`;

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/candle-ice.html'), standalone);
fs.writeFileSync(path.join(ROOT, 'dist/artifact.html'), artifact);
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + ' KB';
console.log(`dist/candle-ice.html  ${kb(standalone)}\ndist/artifact.html    ${kb(artifact)}`);
