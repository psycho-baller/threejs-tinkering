# GPGPU Particle Crowd Simulation

A real-time Three.js / React crowd study that renders 524,288 glowing particles as a group of procedural human figures. Particle positions are simulated on the GPU with floating-point framebuffer ping-pong, curl-noise motion, mouse interaction, and bloom post-processing.

## Features

- 524,288 particles rendered from a 512 x 1024 position texture
- GPU simulation pass with double-buffered render targets
- Procedural crowd target generation in a Web Worker
- Central standout figure with higher luminance and motion detail
- Presets for structured crowd forms, fluid drift, dissolution, and a spiral vortex
- Live controls for chaos, curl noise, return speed, particle size, and mouse repulsion
- Color palette switching and cinematic bloom/noise post-processing
- Runtime capability check for supported floating-point render targets

## Tech Stack

- React 19
- Vite 6
- TypeScript
- Three.js
- @react-three/fiber
- @react-three/drei
- @react-three/postprocessing
- Tailwind CSS

## Requirements

- Node.js 20 or newer
- A browser with WebGL 2 support and floating-point or half-float color buffer render targets
- A discrete GPU or high-performance integrated GPU is recommended

No API key or backend service is required.

## Run Locally

```bash
npm install
npm run dev
```

The development server runs on port 3000 by default:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Type-check and build the production bundle
npm run preview  # Preview the production build locally
npm run lint     # Run TypeScript without emitting files
npm run clean    # Remove generated build/server artifacts
```

## Project Structure

```text
src/
  App.tsx                         # HUD, presets, sliders, and palette state
  components/
    Scene.tsx                     # React Three Fiber canvas, controls, post-processing
    GPGPUParticles.tsx           # GPU capability checks, FBO setup, simulation loop
  shaders/
    simulationShader.ts           # Position simulation and curl-noise motion
    renderShader.ts               # Particle rendering, coloring, sizing, alpha
  utils/
    proceduralHuman.ts            # Procedural crowd and figure target generation
  workers/
    crowdTextureWorker.ts         # Off-main-thread texture data generation
```

## Interaction

- Drag to orbit around the crowd.
- Move the cursor over the scene to repel nearby particles.
- Use the left controls to switch presets and tune simulation uniforms.
- Use the info button to inspect the GPGPU architecture notes.
- Use "Explode & Reshuffle" to reset particles into the dispersed starting field.

## Build

```bash
npm run build
```

The production build is emitted to `dist/`.
