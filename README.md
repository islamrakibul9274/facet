# Facet — Matter in Motion

An interactive digital sculpture studio exploring form, light, and movement.

**[Open the live studio](https://antigravity-obsidian.vercel.app)**

## The experience

- **Four sculptural forms:** Monolith (a beveled cube with a mineral inlay), Prism (a cut crystal), Continuum (an endless knot), and Helix (a twisted, fluted column).
- **Four mineral finishes:** Obsidian, Jade, Amethyst, and Amber, lit with a self-contained reflection studio.
- **Controlled motion:** drag to rotate, pause the sculpture, adjust its speed, or reset the view. Idle motion uses elapsed time for consistent behavior across refresh rates.
- **Optional presence:** enable the camera to have the sculpture follow your movement. The YOLO models detect people, not faces or identity. Frames are processed in a local Web Worker and are never uploaded.
- **Accessible controls:** keyboard shortcuts, labeled buttons, visible focus, a native modal, and reduced motion support. Reduced motion starts with animation paused; you can explicitly play it.
- **Responsive layout:** a desktop studio and a scrollable mobile layout, with adaptive sculpture framing and a capped rendering resolution.

The scene uses local studio lights and requires no remote HDRI assets. The camera model and matching ONNX runtime load only when presence is enabled. Camera or tracking failures stop the stream and show a recoverable error. Hiding the preview keeps tracking connected; turning off the camera stops it.

## Development

Requires Node.js 24 or later and npm.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No environment variables are needed.

The `predev` and `prebuild` scripts copy the installed ONNX runtime's matching WASM files into `public/vision/`. These generated files are ignored by Git and served from the app's own origin.

## Checks

```sh
npm run lint
npm test
npm run build
```

Regression tests cover person-only detection in both models, letterbox coordinate mapping, malformed detections, camera shutdown, stale worker results, and playback state. The bundled primary model has also been loaded and run with the WASM backend to confirm its output contract.

## Controls

| Control         | Action                          |
| --------------- | ------------------------------- |
| Drag            | Rotate the view                 |
| `1`–`4`         | Select a form                   |
| `Space`         | Play / pause                    |
| `R`             | Reset the view                  |
| Enable presence | Opt in to local camera tracking |

Camera access requires HTTPS or localhost. Permission is requested only after selecting **Enable presence**. Camera frames remain on the device. The model recognizes a person in the frame and uses their bounding-box center to guide the sculpture.

## Stack and deployment

Next.js 16, React 19, React Three Fiber, Drei, Three.js, Zustand, Tailwind CSS 4, and ONNX Runtime Web.

The GitHub repository is connected to the existing Vercel project **antigravity-obsidian**, with `main` as its production branch. Pushing `main` triggers production deployment. Vercel runs `npm run build`, including runtime asset preparation.

Created by [Rakibul Islam Rumel](https://github.com/islamrakibul9274).
