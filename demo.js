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
