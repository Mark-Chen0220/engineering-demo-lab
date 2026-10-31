# Oversampling ADC · Signal Lab

Open **index.html** in a modern browser. Everything is embedded in this single file; no installation, internet connection, build step, or local server is needed. WebGL hardware acceleration enables the 3D board.

## Explore

- Click any block, floating label, or left rail item to open that block's controls.
- Drag to orbit; scroll or pinch to zoom; right-drag or Shift-drag to pan.
- Use **Move** to drag blocks on the board, or **Rotate** to turn them. Wires follow the blocks.
- Double-click a block to focus the camera. Use **Perspective**, **Top view**, **Explode**, or **Auto orbit** to inspect the model.
- Each block has its own sliders and numeric inputs. The clock also has an oversampling ratio selector.
- **Space** toggles playback. **Step** pauses and advances exactly one sample. **R** resets the camera. **O / G / T** select orbit, move, or rotate. **1–8** select blocks.
- **Reset this block** restores its parameters and physical position.
- **Export data** downloads the current capture as CSV, including input, loop error, integrator state, quantizer decisions, and decimated PCM samples.

## Behavioral model

The scene implements a discrete-time, first-order sigma-delta ADC:

1. Sample an input waveform and optional Gaussian noise.
2. Subtract the previous feedback DAC output.
3. Integrate the error, with adjustable gain, leakage, and state limit.
4. Quantize to 1–4 bits and convert that code through an adjustable feedback DAC.
5. Apply a causal low-pass filter, then decimate by M.
6. Quantize the filtered output to an 8–24-bit signed PCM storage word.

OSR = fs / (2B). Output rate = fs / M. OSR and M are independent. The digital filter is a normalized Blackman-windowed sinc FIR or a moving average. Its finite attenuation and group delay are represented in the computed output.

At 1× playback speed, 0.05 simulated seconds pass per real second. Captures begin with 4,096 precomputed samples so both plots immediately show useful data. Parameter changes restart this capture. CSV export retains up to 16,384 recent modulator samples. The spectrum is a 4,096-point Hann-windowed FFT of the quantizer output, displayed in dBFS relative to Vref peak.

The model is for interactive learning. It does not model transistor behavior, analog anti-alias filtering, device noise spectra, metastability, or clock jitter. PCM word width is storage precision, not measured ADC effective resolution. Animated packets illustrate direction; their spacing and speed do not represent every clock sample. Soft contact shadows are approximated procedurally.

Architecture reference: [Analog Devices MT-022: Sigma-Delta ADC Basics](https://www.analog.com/media/en/training-seminars/tutorials/MT-022.pdf).

## Implementation

Vanilla HTML, CSS, and JavaScript, a compact inline WebGL renderer, and Canvas 2D plots. No third-party libraries, fonts, assets, CDN calls, or runtime network requests. The reference link is optional reading. If WebGL is unavailable, the controls, simulation, plots, and CSV export remain usable.

Verified with numerical checks for DC pulse density, sine reconstruction with filter delay, decimation cadence, unity DC filter gain, overload counting, and multibit operation; browser checks cover block inspection, slider changes, dragging, rotation, camera views, and responsive layout.
