# Nyquist Motion Lab

Open **index.html** directly in a modern browser. Everything is embedded in the file; no server, installation, internet connection, CDN, or external assets are required. WebGL must be available for the 3D scene.

## Explore

- Drag either view to orbit both cameras; scroll to zoom.
- Shift-drag or right-drag to pan. Touch supports orbit and two-finger pinch zoom.
- Use **Stadium**, **Top view**, and **Propeller** to change the camera.
- With the scene focused, use arrow keys to rotate, +/− to zoom, Home to reset the view, and Space to pause/play.
- Adjust motion frequency and sampling rate, or try **Clear motion**, **Backward**, **Frozen**, and **Nyquist limit**.
- **Step sample** pauses and advances to the next exact capture time. **Reset** rewinds the simulation. Playback speed scales simulation time without changing the sampling relationship.
- Toggle directional shadows and propeller phase guides. The views stack on narrow screens. Reduced-motion preferences start playback paused.

## What it demonstrates

The left/top view shows actual forward motion. The right/bottom view holds each camera exposure until the next exposure. One runner lap and one marked propeller revolution each take `1 / f` simulation seconds. The blade colors distinguish a full revolution.

- Nyquist frequency: `f_N = f_s / 2`.
- To resolve this fundamental cycle unambiguously, use `f_s > 2 f`.
- The apparent signed frequency is `f_alias = f − f_s floor(f / f_s + 1/2)`, folded into `[-f_s/2, f_s/2)`. Negative values indicate backward phase progression.
- At `f_s = 2 f`, the half-cycle direction is ambiguous. With the chart's zero initial phase, all sine samples are zero, illustrating why equality does not guarantee amplitude/phase recovery.
- The graph plots `sin(2π f t)`, its apparent alias, and sample points. Samples beyond the current cursor are dimmed. It is a fundamental-phase illustration, not an interpolation of the full 3D pose.

The articulated runner has six gait cycles per lap and additional shape harmonics. Resolving its entire motion requires more bandwidth than resolving the lap frequency alone. A real display also has its own refresh-rate limits.

## Implementation

Procedural WebGL meshes, an articulated runner, a two-color rotating propeller, orbit/pan/zoom controls, a two-pass directional shadow map with 3×3 filtering, and a Canvas 2D signal plot. All CSS, shaders, geometry, and JavaScript are inline in index.html. No third-party libraries are used.
