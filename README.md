# How to save and restore a grid's state

Sorts and resizes a twelve-row task list, then saves the arrangement with `grid.state.get()` and
brings it back with `grid.state.apply()`. The saved state goes to both `localStorage` and the
page's own URL (as a hash), so reloading the page or reopening the saved link restores the same
sort and column widths without re-fetching or re-configuring anything.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-save-and-restore-grid-state/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/save-and-restore-grid-state/

## The full source

Two files: `index.html` loads the grid and declares the mount point, `demo.js` configures and creates it. Copy both as they are below and it runs.

### index.html

```html
<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>How to save and restore a grid's state</title>
    <meta
      name="description"
      content="Sort a twelve-row task list, resize a column, then save the arrangement to localStorage and to the page's own URL. Reload, or reopen the link, and the same sort and widths come back. Built with Lattice Grid loaded by script tag, no install and no build."
    />
    <link rel="icon" href="data:," />
    <!--
      The grid's stylesheet, from jsDelivr. The address names the exact
      release, 1.68.2, and carries the hash of the file it expects, so the
      page can never quietly pick up a different build than the one it was
      checked against.
    -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.css"
      integrity="sha384-mcpd7S8C5nz58bZDAXdYH6rzezEhfN7B4u2SlW426dSe20GnkxTu4TygyOILnCth"
      crossorigin="anonymous"
    />
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #f4f6f9; color: #131a24; }
      header { padding: 1.5rem 1.5rem 0.5rem; max-width: 960px; margin: 0 auto; }
      header p { color: #4a5568; }
      header a { color: #2d6bff; }
      main { max-width: 960px; margin: 0 auto; padding: 0 1.5rem 2.5rem; }
      #toolbar { margin: 0 0 0.75rem; display: flex; gap: 0.5rem; }
      #toolbar button { font: inherit; padding: 0.4rem 0.75rem; border: 1px solid #ccd3dc; border-radius: 4px; background: #fff; cursor: pointer; }
      #grid { height: 300px; }
      #stat { font-size: 0.9rem; color: #4a5568; margin: 0.75rem 0 0; }
    </style>
  </head>
  <body>
    <header>
      <h1>How to save and restore a grid's state</h1>
      <p>
        Sort the task list below by owner or priority, drag a column edge to resize it, then click
        "Save". The arrangement goes to localStorage and into this page's own URL, so reloading the
        page, or opening the saved link again, brings the same sort and widths straight back. Read
        the <a href="https://www.latticegrid.dev/docs/how-to/save-and-restore-grid-state/">full how-to</a>
        on latticegrid.dev.
      </p>
    </header>
    <main>
      <div id="toolbar">
        <button id="save" type="button">Save</button>
        <button id="restore" type="button">Restore</button>
      </div>
      <div id="grid"></div>
      <p id="stat">Sort a column or resize one, then Save. State is not data: a saved state describes
        the arrangement, never the rows underneath it.</p>
    </main>

    <!--
      The library, as a classic script tag. No npm install, no bundler, no
      type="module": the file runs as it arrives and leaves the LatticeGrid
      global behind.
    -->
    <script
      src="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.js"
      integrity="sha384-vCzLyFYn0T0lz/vkdH4x0JpJZkOazZgI2LiGui7lm5uerdZd0Z46G9hr3Aq1FFPS"
      crossorigin="anonymous"
    ></script>
    <script src="./demo.js"></script>
  </body>
</html>
```

### demo.js

```js
/**
 * Save a grid's sort, filter, column order and widths, and grouping, then
 * bring the same arrangement back, in two places: localStorage, and the
 * page's own URL so a link reopens the same view.
 *
 * `grid.state.get()` captures the arrangement as a plain, JSON-safe object.
 * `grid.state.apply(state)` puts it back. Neither one touches the rows: a
 * saved state describes how the data is shown, not the data itself, so
 * applying an old state to a grid loaded with new rows still works.
 */

// Tied to toclocoinc.github.io only; has no effect anywhere else and needs
// no key at all to run this page from a local copy.
LatticeGrid.setLicence(
  'LG1.eyJ2IjoxLCJwIjoibGF0dGljZS1ncmlkIiwidCI6IlRPQ0xPQ08gSW5jIC0gcHVibGljIGRlbW9zIiwiZSI6IjIwMzAtMDEtMDEiLCJkIjpbInRvY2xvY29pbmMuZ2l0aHViLmlvIl19.9De42ua3aCGpiMB6EVRP7Tv-upUlDI-0T07rlSPzvCrsqg8t4YJi7SRnStEpAg48uzmcG7il1fR_TfwkUE7iCA'
);

const TASKS = [
  { id: 'T01', task: 'Draft proposal', owner: 'Amara', priority: 'High', days: 2 },
  { id: 'T02', task: 'Review contract', owner: 'Ben', priority: 'Medium', days: 1 },
  { id: 'T03', task: 'Update pricing page', owner: 'Carla', priority: 'Low', days: 3 },
  { id: 'T04', task: 'Fix login bug', owner: 'Dev', priority: 'High', days: 1 },
  { id: 'T05', task: 'Onboard new hire', owner: 'Elin', priority: 'Medium', days: 4 },
  { id: 'T06', task: 'Write release notes', owner: 'Faisal', priority: 'Low', days: 1 },
  { id: 'T07', task: 'Renew certificate', owner: 'Grace', priority: 'High', days: 1 },
  { id: 'T08', task: 'Audit permissions', owner: 'Hugo', priority: 'Medium', days: 2 },
  { id: 'T09', task: 'Plan Q3 roadmap', owner: 'Ines', priority: 'Low', days: 5 },
  { id: 'T10', task: 'Migrate database', owner: 'Jonas', priority: 'High', days: 3 },
  { id: 'T11', task: 'Design new logo', owner: 'Keiko', priority: 'Low', days: 4 },
  { id: 'T12', task: 'Customer interviews', owner: 'Liam', priority: 'Medium', days: 2 },
];

const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  columnDefaults: { sort: true, resizable: true },
  columns: [
    { field: 'task', title: 'Task', layout: { flex: 1, min: 160 } },
    { field: 'owner', title: 'Owner', layout: { width: 110 } },
    { field: 'priority', title: 'Priority', layout: { width: 100 } },
    { field: 'days', title: 'Days', type: 'number', layout: { width: 90 } },
  ],
  rows: TASKS,
});
window.__demoGrid = grid; // read by tools/verify.mjs

const STORAGE_KEY = 'lattice-howto-state';
const stat = document.getElementById('stat');

document.getElementById('save').addEventListener('click', () => {
  const state = grid.state.get();
  const encoded = encodeURIComponent(JSON.stringify(state));
  localStorage.setItem(STORAGE_KEY, encoded);
  location.hash = encoded;
  stat.textContent = 'Saved: sort, column order and widths, filters and grouping, to localStorage and to this page’s URL. Reload, or reopen the link, to bring it back.';
});

function restoreFrom(encoded, source) {
  if (!encoded) {
    stat.textContent = 'Nothing saved yet.';
    return;
  }
  const state = JSON.parse(decodeURIComponent(encoded));
  const report = grid.state.apply(state);
  const skipped = report.skipped.length ? `; skipped ${report.skipped.map((s) => s.key).join(', ')}` : '';
  stat.textContent = `Restored from ${source}${skipped}.`;
}

document.getElementById('restore').addEventListener('click', () => {
  const fromHash = location.hash.slice(1);
  restoreFrom(fromHash || localStorage.getItem(STORAGE_KEY), fromHash ? 'the URL' : 'localStorage');
});

// A saved link restores itself on load, with no click needed.
if (location.hash.length > 1) restoreFrom(location.hash.slice(1), 'the URL');
```

`grid.state.get()` captures sort, column order and widths, filters and grouping as a plain,
JSON-safe object; it never touches the rows. `grid.state.apply(state)` puts an arrangement back
and never throws: a saved state written against a different column set applies as much of itself
as still makes sense and reports what it skipped. Because a state describes how the grid is shown
rather than a copy of its data, restoring one to a grid loaded with different rows still works.

## Two things to know

- **State is not data.** Saving a grid's arrangement is not a substitute for saving the rows
  themselves; a state applied to an empty or different grid just arranges whatever is there.
- **Version a saved state.** `grid.state.get()` stamps its result with the state format it was
  written in, so a state saved by an older page still applies field by field against a newer one,
  with anything it can no longer use reported rather than silently dropped.

## Running it yourself

Open `index.html` in a browser, or serve the folder with any static file server. The grid loads
from jsDelivr by script tag, so there is no install and no build step. It runs keyless on
`localhost`; the licence key in `demo.js` is bound to `toclocoinc.github.io` and has no effect
anywhere else.

## Licence

MIT, see [LICENSE](./LICENSE). Lattice Grid itself is licensed separately per domain:
https://www.latticegrid.dev/pricing/
