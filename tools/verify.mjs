/**
 * Load the demo in a real headless browser and check that it works.
 *
 * Serves the project locally and drives it with the same minimal Chrome
 * driver the grid's own test suite uses (tools/browser.js), so this needs no
 * dependency beyond Chrome itself.
 *
 * Checks:
 *   - the library arrived and left the LatticeGrid global behind;
 *   - all 12 tasks land in the grid (grid.rows.matchCount(), not a DOM count);
 *   - sorting by owner and resizing the Owner column, then clicking "Save",
 *     writes a state string to both localStorage and location.hash;
 *   - reloading the page (a fresh navigation with that hash still in the URL)
 *     restores the same sort order and the same column width, read back
 *     through grid.state.get() rather than the DOM;
 *   - nothing logged a console error or threw while the page ran.
 *
 * Exits non-zero on any failure, so it can gate a deployment.
 *
 * Usage: node tools/verify.mjs
 */

import { startServer } from './serve.mjs';
import { Browser, available } from './browser.js';

if (!available()) {
  console.log('No headless browser on this machine; skipping verify.mjs.');
  process.exit(0);
}

const { server, port } = await startServer();
const browser = new Browser();

try {
  await browser.start();

  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__errs = [];
      addEventListener('error', (e) => window.__errs.push(String(e.message || e)));
      addEventListener('unhandledrejection', (e) => window.__errs.push('unhandledrejection: ' + String(e.reason)));
      const origError = console.error.bind(console);
      console.error = (...args) => { window.__errs.push('console.error: ' + args.map(String).join(' ')); origError(...args); };
    `,
  });

  await browser.open(`http://127.0.0.1:${port}/`);
  await new Promise((r) => setTimeout(r, 500));

  const failures = [];

  const hasGrid = await browser.evaluate(`typeof LatticeGrid !== 'undefined' && typeof LatticeGrid.createGrid === 'function'`);
  if (!hasGrid) failures.push('LatticeGrid.createGrid was not found on the page');

  const taskCount = await browser.evaluate(`window.__demoGrid.rows.matchCount()`);
  if (taskCount !== 12) failures.push(`expected 12 tasks (grid.rows.matchCount()), grid reports ${taskCount}`);

  // Sort by owner, resize the Owner column, then Save.
  await browser.evaluate(`window.__demoGrid.sort.set([{ col: 'owner', dir: 'asc' }])`);
  await browser.evaluate(`window.__demoGrid.columns.resize('owner', 220)`);
  await new Promise((r) => setTimeout(r, 200));
  await browser.evaluate(`document.getElementById('save').click()`);
  await new Promise((r) => setTimeout(r, 200));

  const stored = await browser.evaluate(`localStorage.getItem('lattice-howto-state')`);
  if (!stored) failures.push('Save did not write anything to localStorage');

  const hashAfterSave = await browser.evaluate(`location.hash`);
  if (hashAfterSave.length < 2) failures.push('Save did not write anything to the URL hash');

  const ownerWidthBefore = await browser.evaluate(
    `window.__demoGrid.state.get().columns.find((c) => c.id === 'owner').width`
  );
  if (ownerWidthBefore !== 220) failures.push(`expected the Owner column to be 220px before reload, grid state reports ${ownerWidthBefore}`);

  // A fresh navigation to the same URL, hash included: the page's own load
  // handler reads the hash and calls grid.state.apply() with no click needed.
  const urlWithHash = `http://127.0.0.1:${port}/${hashAfterSave}`;
  await browser.open(urlWithHash);
  await new Promise((r) => setTimeout(r, 500));

  const sortAfterReload = await browser.evaluate(`JSON.stringify(window.__demoGrid.state.get().sort)`);
  if (!sortAfterReload.includes('"owner"')) failures.push(`expected the sort to be restored by owner after reload, grid state reports ${sortAfterReload}`);

  const ownerWidthAfterReload = await browser.evaluate(
    `window.__demoGrid.state.get().columns.find((c) => c.id === 'owner').width`
  );
  if (ownerWidthAfterReload !== 220) failures.push(`expected the Owner column to still read 220px after reload, grid state reports ${ownerWidthAfterReload}`);

  const firstOwnerAfterReload = await browser.evaluate(
    `document.querySelector('.lat-row:not([data-pinned]) .lat-cell[data-col="owner"]')?.textContent`
  );
  const owners = ['Amara', 'Ben', 'Carla', 'Dev', 'Elin', 'Faisal', 'Grace', 'Hugo', 'Ines', 'Jonas', 'Keiko', 'Liam'];
  const expectedFirst = [...owners].sort()[0];
  if (firstOwnerAfterReload !== expectedFirst) {
    failures.push(`expected the first row after reload to be sorted by owner (${expectedFirst}), grid shows ${firstOwnerAfterReload}`);
  }

  const errors = await browser.evaluate('window.__errs');
  if (errors.length) failures.push(`console/window errors: ${errors.join(' | ')}`);

  if (failures.length) {
    console.error('FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(
      'OK: 12 tasks loaded, saved a sort-by-owner + 220px Owner column to localStorage and the ' +
      'URL hash, and a fresh page load at that URL restored both through grid.state.get(). 0 console errors.'
    );
  }
} finally {
  await browser.close();
  server.close();
}
