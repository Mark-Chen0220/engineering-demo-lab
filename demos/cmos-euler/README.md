# CMOS Studio — Euler Explorer

Open **index.html** in a desktop browser. It is the complete application: HTML,
CSS, JavaScript, the logic engine, the Euler-search worker, and Three.js are all
embedded. No installation, build, server, CDN, or internet connection is needed.
The reference link in the footer is optional and opens an external lecture PDF.

## Enter a function

- `Y = !(A*B + C*D)` — AOI22.
- `Y = ~((A+B)*(C+D))` — OAI22.
- `(AB+C)'` — AOI21 with implicit multiplication and postfix inversion.
- `AOI321` or `OAI221` — expand a standard gate shorthand into sequential inputs.
- `F = !((A+B*C)*(D+E))` — nested series/parallel logic.
- `Y = !(!A*B + C)` — explicit local inverters supply complemented inputs.
- `Y = !({enable} * (clk + reset_n))` — named signals.

The result updates 550 ms after typing stops. **Generate CMOS** and
**Ctrl+Enter** generate immediately. An assignment specifies the exact output.
A bare expression without a top-level NOT is automatically inverted, so `AB+C`
means `Y = !(A*B+C)`. This interpretation is stated in the inspector.

AND: `*`, `&`, `&&`, `·`, `∧`, or juxtaposition. OR: `+`, `|`, `||`, `∨`.
NOT: `!`, `~`, `¬`, or postfix `'` / `′`. NOT binds before AND, then OR.
Parentheses can override precedence. Consecutive uppercase letters such as `ABC`
are individual inputs. Wrap a multi-letter uppercase name in braces, e.g.
`{CLK}`. Lowercase/mixed-case words such as `enable` and names such as `A1`
are single inputs. Signals are case-sensitive. Constants and XOR are outside
this AOI/OAI editor's grammar.

## Explore the circuit

- **CMOS schematic:** complementary pull-up and pull-down transistor networks,
  named internal nets, ON/OFF channels, separate input inverters, fit and zoom.
- **Euler graphs:** transistor edges and diffusion-net vertices, with vertex
  degrees. Click an edge or a gate chip to inspect a traversal step.
- **3D stick layout:** embedded Three.js/WebGL model. Drag to orbit, scroll to
  zoom, click a gate to inspect, or use the layer slider. When the canvas has
  keyboard focus, arrow keys orbit, `+` / `-` zoom, and Home resets the camera.
- **Truth table:** paginated in blocks of 64 rows. Click a row to apply it.
- **Input switches:** update ideal Boolean connectivity and output state.
- **Play / Step:** trace transistor occurrences in the displayed trails.
- **Export schematic:** portable SVG. **CSV:** full truth table for up to 12
  inputs. **SPICE topology:** an un-sized subcircuit with explicit bulk nets and
  input inverter instances. Supply your process models, sizes, sources, and
  analyses before using that topology for electrical simulation.

## Euler results and limits

The pull-down implements the complement of the output: AND → series, OR →
parallel. The pull-up swaps series and parallel. Each literal occurrence has a
distinct transistor ID, even when its gate signal is repeated. IDs start at P0
and N0. The common-trail search matches gate labels and maintains separate edge
identities; it does not assume repeated occurrences have the same pairing.

Every generated network is connected. A network has an Euler trail precisely
when it has 0 or 2 odd-degree vertices. Otherwise, an augmented Hierholzer
algorithm produces a minimum independent trail cover with `oddVertices / 2`
trails. `//` denotes a required diffusion break between those independent
trails. The minimum count is per network; no claim of a globally optimal
combined broken-row layout is made.

Common-trail search runs in a local Blob worker, using joint depth-first search,
remaining-graph parity/connectivity pruning, and memoized states. The budget is
1.5 seconds or 180,000 states. Results distinguish:

- **COMMON:** a verified shared gate-label sequence exists.
- **BREAKS:** parity proves at least one row cannot be continuous.
- **NO MATCH:** exhaustive search finished without a common sequence for the
  generated topology.
- **LIMIT:** the budget was reached; existence remains unknown.
- **UNAVAILABLE:** the browser blocked or could not start the worker;
  independent exact trail covers remain usable.

The interactive limits are 64 literal occurrences, 20 unique inputs, and 128
levels of expression nesting. There is no Boolean minimization or topology
rewriting. The 3D view is a conceptual stick diagram: it omits contacts, wells,
metal routing, transistor sizing, and process design rules. Matching diffusion
net labels still require their appropriate interconnect. Separate input
inverters are included in the schematic and count, not in the compound-gate
Euler rows. This is an ideal-switch teaching tool, not an analog simulator or
fabrication-ready layout generator. WebGL failure leaves the 2D views available.

## Verification

Run `node verify.cjs` (Node.js 18+; no packages). In restricted Windows setups,
use `node --preserve-symlinks --preserve-symlinks-main verify.cjs`.

The deterministic suite validates 425 expressions, 4,498 input vectors, and 189
comparisons with an independent exhaustive common-Euler enumerator. It checks
both rail-connectivity functions, exclusive output drive, minimum trail covers,
edge identity and continuity, complemented inputs, parsing and limits, 64-edge
search, embedded-script syntax, and absence of external application assets.

Browser QA additionally exercised auto generation, pMOS/nMOS graph updates,
AOI321 parity failure, complemented-input inverters, simulation switches,
truth-table selection, Euler stepping, SVG download, and Three.js rendering
with the layer slider. Preview images are included as optional documentation.
Browser QA used a local HTTP server because the verification browser permits
only HTTP(S) URLs; direct `file://` opening was not verified in that browser.

## References and license

- Euler layout method: [UCSB ECE124D lecture 4](https://bears.ece.ucsb.edu/class/ece124d/lecture4.pdf).
- [Three.js installation guidance](https://threejs.org/manual/pages/installation.html).
- Three.js 0.160.1, MIT, copyright three.js authors. The complete MIT notice is
  retained inside index.html. A classic-script build is embedded for direct
  offline file opening; its upstream deprecation notice may appear in the
  developer console and does not affect operation.
- Embedded upstream library SHA-256 before insertion:
  `170c6789f43217c96b3170f4b42fafe135de7f7cd48497a4218f9757ee1d49fa`.

The app's own code and documentation may be freely used, modified, and shared.
