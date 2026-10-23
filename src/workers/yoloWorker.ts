import * as ort from "onnxruntime-web/wasm";
import { parseDetections } from "../utils/detection";

// The JS runtime and WASM binaries must be the same version. Single threading
// works on ordinary Vercel pages without requiring cross-origin isolation.
ort.env.wasm.wasmPaths = `${self.location.origin}/vision/`;
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;

const SIZE = 640;
const PLANE_SIZE = SIZE * SIZE;
const pixels = new Float32Array(3 * PLANE_SIZE);
let session: ort.InferenceSession | null = null;
let modelType: "yolo26" | "yolov8" = "yolo26";
let processing = false;

async function initModel() {
  for (const model of ["yolo26", "yolov8"] as const) {
    try {
      session = await ort.InferenceSession.create(`/models/${model}n.onnx`, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
      modelType = model;
      self.postMessage({ type: "READY" });
      return;
    } catch {
      // Try the bundled fallback once, then surface a recoverable UI error.
    }
  }
  self.postMessage({ type: "ERROR" });
}

void initModel();

self.onmessage = async (event: MessageEvent) => {
  if (!session || processing) return;
  const { rgbaBuffer, imageRect = [0, 0, 1, 1] } = event.data;
  if (
    !(rgbaBuffer instanceof ArrayBuffer) ||
    rgbaBuffer.byteLength !== PLANE_SIZE * 4
  )
    return;
  processing = true;
  const started = performance.now();
  const rgba = new Uint8Array(rgbaBuffer);
  for (let i = 0; i < PLANE_SIZE; i++) {
    pixels[i] = rgba[i * 4] / 255;
    pixels[PLANE_SIZE + i] = rgba[i * 4 + 1] / 255;
    pixels[PLANE_SIZE * 2 + i] = rgba[i * 4 + 2] / 255;
  }

  const input = new ort.Tensor("float32", pixels, [1, 3, SIZE, SIZE]);
  let outputs: Record<string, ort.Tensor> | null = null;
  try {
    outputs = await session.run({ [session.inputNames[0]]: input });
    const tensor = outputs[session.outputNames[0]];
    const result = parseDetections(
      tensor.data as Float32Array,
      tensor.dims,
      modelType,
      imageRect,
    );
    self.postMessage({
      type: "RESULT",
      ...result,
      latency: Math.round(performance.now() - started),
    });
  } catch {
    self.postMessage({ type: "ERROR" });
  } finally {
    input.dispose();
    if (outputs) Object.values(outputs).forEach((tensor) => tensor.dispose());
    processing = false;
  }
};
