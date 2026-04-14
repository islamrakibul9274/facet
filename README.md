-----

# ⬛ ANTIGRAVITY // Obsidian Neural Node

A high-performance, interactive 3D application merging real-time computer vision with high-end WebGL shaders. This project features a custom 3-layer glassmorphism architecture, browser-based AI face tracking, and a highly optimized render loop for a dynamic physical interface that reacts instantly to user presence.

## 🚀 Live Links

  * **Production Application (Vercel):** [https://antigravity-obsidian.vercel.app/](https://antigravity-obsidian.vercel.app/)

-----

## ✨ Key Features

### 🧠 AI & Performance Features

  * **Real-Time Edge AI:** On-device computer vision using a quantized YOLOv8 model executing entirely in a background Web Worker via WebAssembly.
  * **Silent State Updates:** A custom architecture that bypasses destructive React re-renders, feeding AI tracking data directly into the Three.js 60FPS render loop via Zustand.
  * **Interactive Neural Tracking:** The 3D obsidian node physically tracks, tilts, and locks onto the user's facial coordinates in real-time without lagging the UI thread.

### 💎 3D & Shader Features

  * **3-Layer Glassmorphism Architecture:** A deeply nested material system prioritizing high-end reflections and depth.
  * **The Obsidian Core:** A perfectly reflective, pitch-black inner physical mesh acting as a deep mirror inside the glass.
  * **Reactive Data Shell:** Custom mathematical shaders that draw razor-sharp white borders in idle state, and ignite into a liquid **Light Blue to Deep Blue** HDR plasma wave upon detection.
  * **Cinematic Post-Processing:** Integrated HDR Bloom, Vignette, and Sporadic Glitch effects precisely synchronized to the AI's detection state.

-----

## 💻 Tech Stack

**Frontend & Framework:**

  * Next.js 15 (App Router & Turbopack)
  * React.js & TypeScript
  * Tailwind CSS (UI & Typography)
  * Zustand (Global State Management)

**3D Engine & Post-Processing:**

  * Three.js & React Three Fiber
  * React Three Drei
  * `@react-three/postprocessing`

**Computer Vision:**

  * ONNX Runtime Web (`onnxruntime-web`)
  * YOLOv8n (Quantized Neural Network)

-----

## 🛠 Local Setup Instructions

### 1. Prerequisites

  * Node.js (v18 or higher)
  * A modern browser with WebGL and Camera support

### 2. Clone the Repository

```bash
git clone [https://github.com/islamrakibul9274/antigravity-obsidian.git](https://github.com/islamrakibul9274/antigravity-obsidian.git)
cd antigravity-obsidian
```

### 3. Install Dependencies

```bash
npm install
```

### 4\. Neural Model Configuration

Ensure the quantized AI model is correctly placed so the Web Worker can locate it:
Create a `models` folder inside your `public` directory and place your `.onnx` file there:
`public/models/yolov8n.onnx`

### 5\. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result. *Note: You must grant camera permissions for the neural tracking to initialize.*

-----

## ⚙️ Production Deployment

This application is fully optimized for static deployment on Vercel. The ONNX model is served as a static asset for fast loading. **Note:** Modern browsers require a secure `https://` connection (provided automatically by Vercel) to grant webcam access for the YOLOv8 tracking engine.

-----

## 👤 Author

**Rakibul Islam Rumel**

  * GitHub: [@islamrakibul9274](https://www.google.com/search?q=https://github.com/islamrakibul9274)

-----

```
```