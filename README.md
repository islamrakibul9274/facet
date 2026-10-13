# Facet — Interactive 3D Glass Sculpture

> A real-time interactive optical study merging on-device computer vision with physical volcanic glass simulation and WebGL shaders.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Facet_Online-38bdf8?style=for-the-badge&logo=vercel)](https://facet-glass.vercel.app/)
[![Next.js 16](https://img.shields.io/badge/Next.js_16-Turbopack-white?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![YOLO26n](https://img.shields.io/badge/Vision_Engine-YOLO26n_WASM-emerald?style=for-the-badge)](https://github.com/ultralytics/ultralytics)

---

## 🌐 Live Application

Experience the live interactive 3D sculpture in your browser:

* **Primary Production URL:** [https://facet-glass.vercel.app/](https://facet-glass.vercel.app/)
* **Alternative Mirror:** [https://facet-interactive.vercel.app/](https://facet-interactive.vercel.app/)
* **Legacy Alias:** [https://antigravity-obsidian.vercel.app/](https://antigravity-obsidian.vercel.app/)

> **Tip**: Grant camera access to enable real-time spatial YOLO26 tracking. When camera access is disabled or unavailable, the system automatically falls back to smooth cursor/mouse parallax orientation.

---

## Overview

**Facet** explores the intersection of physical light transmission, generative shaders, and spatial awareness. The 3D glass sculpture responds continuously to your presence through real-time on-device face tracking—interpolating motion smoothly at 60 FPS without dropping frames or sending any video data over the network.

---

## Key Features

### 1. Real-Time Vision Engine (YOLO26n WASM)
- **Zero-Copy Transferable Pipeline**: Image buffers are passed directly to the background Web Worker via `ArrayBuffer` transfer, removing main-thread serialization overhead.
- **Throttled Inference & Fluid 60 FPS Motion**: Inference runs at ~16 FPS to keep the CPU/GPU cool and the webcam feed silky smooth, while the Three.js physics loop smoothly interpolates coordinates at 60 FPS using Exponential Moving Average (EMA) damping.
- **Flexible Hardware Constraints**: Robust fallback camera constraints prevent macOS camera hardware timeouts (`Timeout starting video source`).
- **Cursor Parallax Fallback**: Smooth mouse interaction whenever the camera is offline or denied.

### 2. Physical Volcanic Glass Materials & Geometries
- **Multi-Layer Optical Structure**:
  1. *Obsidian Core*: Deep volcanic physical mesh (`metalness: 0.94`, `roughness: 0.08`).
  2. *Internal Light Veins*: Multi-frequency procedural GLSL wave flow.
  3. *Glass Envelope*: Refractive transmission glass (`ior: 1.6`, `thickness: 0.3`, `transmission: 0.95`).
- **Four Geometries**:
  - **Cube**: Beveled obsidian block
  - **Crystal**: Architectural icosahedron with faceted dispersion
  - **Torus**: Continuous hyper-reflective knot
  - **Pillar**: Monumental beveled prism
- **Four Color Palettes**:
  - **Obsidian**: Cool cyan highlight on volcanic black glass
  - **Amethyst**: Soft smoke plum
  - **Emerald**: Forest jade
  - **Amber**: Warm cognac champagne

### 3. Clean Modern UI
- Responsive layout designed for mobile, tablet, and widescreen displays.
- Floating command dock with unified heights, zero overflow, and comfortable padding.
- Contained color swatches with inset active rings that stay strictly within bounds.
- Subtle, optional camera preview with hairline face tracking frame.
- Unobtrusive sound feedback via Web Audio API.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **3D & Shaders**: Three.js, [React Three Fiber](https://r3f.docs.pmnd.rs/), React Three Drei, Postprocessing
- **Computer Vision**: [ONNX Runtime Web](https://onnxruntime.ai/), YOLO26n End-to-End
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: Tailwind CSS v4, Lucide Icons

---

## Local Setup

```bash
# Clone
git clone https://github.com/islamrakibul9274/facet.git
cd facet

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Author

**Rakibul Islam Rumel**
- GitHub: [@islamrakibul9274](https://github.com/islamrakibul9274)