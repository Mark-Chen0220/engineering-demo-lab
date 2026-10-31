# Demo consolidation · 2026-10-31

The collection was assembled from the VLSI course and Automatic Control course folders into the sibling folder **Engineering-Demo-Lab**.

## Demo paths

- `CMOS-Euler-Explorer/` → `demos/cmos-euler/`
- `CMOS-Latchup-Lab/` → `demos/cmos-latchup/`
- `Noise-Averaging-Lab/` → `demos/noise-averaging/`
- `Nyquist-Motion-Lab/` → `demos/nyquist-motion/`
- `Oversampling-ADC-Lab/` → `demos/oversampling-adc/`
- `control-systems-demos/` → the new repository root, preserving its Git history and the `bode/`, `nyquist/`, and `natural-frequency.html` routes.

The portal replaces the original control-only gallery at `index.html`. That gallery is retained at `control-systems.html`. The control build script now writes the latter file so it cannot overwrite the shared portal. The original control README is retained in this directory.

The stand-alone `natural_frequency_explorer.py` in the Automatic Control course folder was byte-identical to the tracked repository version. Its duplicate is retained under the ignored local migration directory. The empty `second-order-explorer` hosting scaffold contained no additional demo code.

Books, course PDFs, homework, exams, the midterm study guide and its source images, and Word/PDF review documents were outside the interactive demo scope and were left in the course folders.

The original control repository on GitHub is retained. This repository uses a new remote and publishes the combined portal.
