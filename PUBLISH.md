# Publish step (batch mode)

This repo was built and verified locally under the owner's 2026-09-22 batch-mode
instruction (GitHub Actions minutes low). It has not been pushed. When the
how-to series is published in one batch, create and push it with:

```
gh repo create toclocoinc/lattice-grid-howto-save-and-restore-grid-state \
  --public \
  --description "How to save and restore a grid's state with Lattice Grid" \
  --homepage https://toclocoinc.github.io/lattice-grid-howto-save-and-restore-grid-state/
```

Then push this local repo's `main` to it, and enable Pages from the `main`
branch root (the checked-in `.github/workflows/pages.yml` publishes on every
push to `main`, so pushing is the only remaining step).

- **Description:** How to save and restore a grid's state with Lattice Grid
- **Homepage:** https://toclocoinc.github.io/lattice-grid-howto-save-and-restore-grid-state/
- **Topics:** `lattice-grid`, `data-grid`, `javascript`, `how-to`

Site page this repo's README links back to (also not yet pushed, committed
locally on branch `howto/save-and-restore-grid-state` of the site repo):
https://www.latticegrid.dev/docs/how-to/save-and-restore-grid-state/
