# Open Lab · Engineering Demo Lab

One portal for eight interactive VLSI, signal-processing, and control-systems experiments.

**Website:** https://mark-chen0220.github.io/engineering-demo-lab/

**Repository:** https://github.com/Mark-Chen0220/engineering-demo-lab

## Experiments

- [CMOS Euler Explorer](demos/cmos-euler/) — transistor networks, Euler paths, and CMOS layout.
- [CMOS Latch-up Lab](demos/cmos-latchup/) — CMOS cross-section and parasitic feedback.
- [Noise Averaging Lab](demos/noise-averaging/) — independent noise and averaging.
- [Nyquist Motion Lab](demos/nyquist-motion/) — sampled motion and aliasing.
- [Oversampling ADC](demos/oversampling-adc/) — an interactive first-order sigma-delta converter.
- [Natural Frequency & Damping](natural-frequency.html) — second-order poles and step response.
- [Pole–Zero Bode Studio](bode/) — real poles, zeros, magnitude, and phase.
- [Nyquist Plotter](nyquist/) — a transfer function's response in the complex plane.

The portal supports category filters, text search, an embedded experiment viewer, direct full-page links, and shareable URLs such as `?lab=oversampling-adc`. Only the selected experiment loads, so the portal does not run several WebGL scenes at once.

## Local preview

From this folder:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/. No package installation or build step is required. Serve over HTTP to use the Bode and Nyquist JavaScript modules; the self-contained HTML demos also work independently when opened as local files.

## Repository layout

```text
index.html                 Shared portal and experiment viewer
assets/                    Portal CSS, JavaScript, catalog, and favicon
demos/                     Five migrated VLSI / signal labs
bode/                      Pole–Zero Bode Studio
nyquist/                   Nyquist Plotter
natural-frequency.html     Browser-only second-order explorer
natural_frequency_explorer.py  Original local Python app
build_site.py              Rebuilds natural-frequency.html and the legacy control gallery
control-systems.html       Original control-systems gallery
scripts/                   Static validation and deployment helpers
docs/                      Migration notes and original control README
```

The five VLSI / signal demo directories retain their original code, preview images, and notes. Existing control page routes remain valid. The Git history starts with the original `control-systems-demos` repository, which remains available independently on GitHub.

## Adding a demo

1. Add its files under `demos/<slug>/`, with an `index.html` entry point.
2. Add an entry to `assets/catalog.js` with a unique ID, title, category, path, source path, and topic tags.
3. Add an illustration in `assets/portal.js`, or reuse an appropriate existing illustration.
4. Update the category counts and total count in `index.html` if the collection changes.
5. Run `python scripts/validate_site.py`, then commit and push to `main`.

To regenerate the second-order browser demo from the Python app, run `python build_site.py`. This updates `natural-frequency.html` and `control-systems.html`; it intentionally preserves the shared `index.html` portal.

## GitHub Pages

Publishing source: **Deploy from a branch → main → /(root)**. The `.nojekyll` marker serves the files as a static site. Pushes to `main` update the website. All URLs and assets are relative to the repository base path.

The site has no server-side runtime, analytics, sign-in, or external JavaScript dependencies. The optional source and reference links go to external sites. Educational models carry their own assumptions and limits in each lab.

## Migration scope

This collection contains demo code and its supporting assets. Course textbooks, homework, exam material, and review documents remain in their original course folders. The duplicate stand-alone Python source from the control course folder is preserved locally under `.local/migration/`, which is excluded from Git and Pages. Empty hosting scaffold directories contain no demo code and are not published.
