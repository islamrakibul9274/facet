// src/workers/yoloWorker.ts
// Optimized YOLO26n Background Worker with Zero-Allocation Tensor Pipeline

import * as ort from "onnxruntime-web";

ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";
ort.env.wasm.numThreads = 2;

let session: ort.InferenceSession | null = null;
let modelType: "yolo26" | "yolov8" = "yolo26";

// Pre-allocated tensor buffer to eliminate Garbage Collection pauses
const float32Data = new Float32Array(1 * 3 * 640 * 640);

async function initModel() {
  try {
    session = await ort.InferenceSession.create("/models/yolo26n.onnx", {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
    modelType = "yolo26";
    self.postMessage({ type: "READY", model: "YOLO26n" });
  } catch (err) {
    try {
      session = await ort.InferenceSession.create("/models/yolov8n.onnx", {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
      modelType = "yolov8";
      self.postMessage({ type: "READY", model: "YOLOv8n" });
    } catch (fallbackErr) {
      self.postMessage({ type: "ERROR", error: fallbackErr });
    }
  }
}

initModel();

self.onmessage = async (event: MessageEvent) => {
  if (!session) {
    self.postMessage({ type: "RETRY" });
    return;
  }

  const { rgbaBuffer } = event.data;
  if (!rgbaBuffer) return;

  const tStart = performance.now();
  const rgba = new Uint8Array(rgbaBuffer);

  // Convert RGBA uint8 -> RGB float32 [0..1] in planar format (1, 3, 640, 640)
  // R channel: [0 .. 409599]
  // G channel: [409600 .. 819199]
  // B channel: [819200 .. 1228799]
  const planeSize = 640 * 640;
  const gOffset = planeSize;
  const bOffset = planeSize * 2;

  for (let i = 0; i < planeSize; i++) {
    const src = i * 4;
    float32Data[i] = rgba[src] / 255.0;
    float32Data[gOffset + i] = rgba[src + 1] / 255.0;
    float32Data[bOffset + i] = rgba[src + 2] / 255.0;
  }

  const inputTensor = new ort.Tensor("float32", float32Data, [1, 3, 640, 640]);

  try {
    const outputs = await session.run({ images: inputTensor });
    const output = outputs.output0.data as Float32Array;
    const tEnd = performance.now();
    const latency = Math.round(tEnd - tStart);

    let maxConf = 0;
    let bestBox: [number, number, number, number] | null = null;
    let bestCenter: [number, number] = [0.5, 0.5];

    if (modelType === "yolo26") {
      // YOLO26 End-to-End candidates: [1, 300, 6] -> [x1, y1, x2, y2, score, class_id]
      const numDetections = 300;
      for (let i = 0; i < numDetections; i++) {
        const offset = i * 6;
        const conf = output[offset + 4];
        const classId = Math.round(output[offset + 5]);

        // Class 0 = Person in COCO
        if (conf > 0.30 && (classId === 0 || conf > maxConf)) {
          if (conf > maxConf) {
            maxConf = conf;
            const x1 = Math.max(0, Math.min(640, output[offset]));
            const y1 = Math.max(0, Math.min(640, output[offset + 1]));
            const x2 = Math.max(0, Math.min(640, output[offset + 2]));
            const y2 = Math.max(0, Math.min(640, output[offset + 3]));

            bestBox = [x1 / 640, y1 / 640, x2 / 640, y2 / 640];
            bestCenter = [(x1 + x2) / (2 * 640), (y1 + y2) / (2 * 640)];
          }
        }
      }
    } else {
      // YOLOv8 legacy: 8400 boxes
      for (let col = 0; col < 8400; col++) {
        const conf = output[4 * 8400 + col];
        if (conf > maxConf) {
          maxConf = conf;
          const cx = output[col];
          const cy = output[8400 + col];
          const w = output[2 * 8400 + col];
          const h = output[3 * 8400 + col];

          const x1 = Math.max(0, (cx - w / 2) / 640);
          const y1 = Math.max(0, (cy - h / 2) / 640);
          const x2 = Math.min(1, (cx + w / 2) / 640);
          const y2 = Math.min(1, (cy + h / 2) / 640);

          bestBox = [x1, y1, x2, y2];
          bestCenter = [cx / 640, cy / 640];
        }
      }
    }

    const hasTarget = maxConf > 0.32;

    self.postMessage({
      type: "RESULT",
      acquired: hasTarget,
      confidence: Math.round(maxConf * 100),
      position: bestCenter,
      box: hasTarget ? bestBox : null,
      latency,
    });
  } catch (err) {
    self.postMessage({ type: "ERROR", error: err });
  }
};