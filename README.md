# How to save and restore a grid's state

Sorts and resizes a twelve-row task list, then saves the arrangement with `grid.state.get()` and
brings it back with `grid.state.apply()`. The saved state goes to both `localStorage` and the
page's own URL (as a hash), so reloading the page or reopening the saved link restores the same
sort and column widths without re-fetching or re-configuring anything.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-save-and-restore-grid-state/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/save-and-restore-grid-state/

## The snippet

```js
document.getElementById('save').addEventListener('click', () => {
  const state = grid.state.get();
  const encoded = encodeURIComponent(JSON.stringify(state));
  localStorage.setItem('lattice-howto-state', encoded);
  location.hash = encoded;
});

document.getElementById('restore').addEventListener('click', () => {
  const encoded = location.hash.slice(1) || localStorage.getItem('lattice-howto-state');
  grid.state.apply(JSON.parse(decodeURIComponent(encoded)));
});
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
