#!/usr/bin/env node
/* Browser smoke test: plays the real page with random choices and reports
 * any runtime errors. Requires Playwright (global install is fine).
 *
 *   node tools/smoke.js [--runs 3] [--shots dir] [--file dist/candle-ice.html]
 */
'use strict';
const path = require('path');
let pw;
try { pw = require('playwright'); } catch (e) { pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); }

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const RUNS = +opt('--runs', 3);
const SHOTS = opt('--shots', null);
const FILE = path.resolve(__dirname, '..', opt('--file', 'index.html'));

(async () => {
  const browser = await pw.chromium.launch();
  let failures = 0;
  for (let r = 0; r < RUNS; r++) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.addInitScript(() => { try { localStorage.setItem('candle-ice-settings-v1', JSON.stringify({ pace: 'instant', sound: false })); } catch (e) {} });
    await page.goto('file://' + FILE);
    await page.waitForTimeout(400);
    if (SHOTS && r === 0) await page.screenshot({ path: path.join(SHOTS, 'title.png') });
    await page.click('#btnNew');
    let steps = 0, ending = null, shot = 0, idleSince = 0;
    while (steps < 2500) {
      steps++;
      if (await page.isVisible('#actcard')) { await page.click('#actcard', { timeout: 2000 }).catch(() => {}); await page.waitForTimeout(550); continue; }
      if (await page.isVisible('#endcard')) {
        const txt = await page.textContent('#endcard');
        ending = /The ice closes/.test(txt) ? 'gameover' : 'end';
        if (SHOTS && r === 0) await page.screenshot({ path: path.join(SHOTS, 'end.png') });
        break;
      }
      const btns = await page.$$('#choices button:not([disabled])');
      if (!btns.length) {
        if (!idleSince) idleSince = Date.now();
        if (Date.now() - idleSince > 6000) { const n = await page.evaluate(() => (document.querySelector('#feed').lastElementChild || {}).textContent); errors.push('stuck after: ' + (n || '').slice(0, 90)); break; }
        await page.waitForTimeout(60);
        continue;
      }
      idleSince = 0;
      const b = btns[Math.floor(Math.random() * btns.length)];
      await b.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(15);
      if (SHOTS && r === 0 && [12, 60, 140].includes(steps)) await page.screenshot({ path: path.join(SHOTS, 'play' + (shot++) + '.png') });
    }
    const title = await page.textContent('#locName');
    console.log(`run ${r + 1}: ${ending || 'no ending'} after ${steps} clicks (last scene: ${title})`);
    if (errors.length) { failures++; console.log('  ' + [...new Set(errors)].slice(0, 12).join('\n  ')); }
    await page.close();
  }
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
