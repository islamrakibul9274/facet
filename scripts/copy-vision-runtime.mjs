import { copyFile, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Serve matching ONNX assets from our own origin. No third-party runtime fetches.
const root = new URL("../", import.meta.url);
const runtime = new URL("node_modules/onnxruntime-web/", root);
const { version } = JSON.parse(
  await readFile(new URL("package.json", runtime), "utf8"),
);
const destination = new URL("public/vision/", root);
await mkdir(destination, { recursive: true });
for (const name of [
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.wasm",
]) {
  await copyFile(new URL(`dist/${name}`, runtime), new URL(name, destination));
}
console.log(
  `Prepared on-device vision runtime ${version} in ${fileURLToPath(destination)}`,
);
