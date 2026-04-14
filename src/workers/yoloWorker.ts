// src/workers/yoloWorker.ts
import * as ort from "onnxruntime-web";

ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";

let session: ort.InferenceSession | null = null;

async function initModel() {
  try {
    session = await ort.InferenceSession.create("/models/yolov8n.onnx", {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
    // Let the main thread know we are ready!
    self.postMessage({ type: "READY" });
  } catch (e) {
    self.postMessage({ type: "ERROR", error: e });
  }
}

initModel();

self.onmessage = async (event) => {
  // If model isn't ready, tell the hook to try again
  if (!session) {
    self.postMessage({ type: "RETRY" });
    return;
  }

  const { imageBuffer } = event.data;
  const float32Data = new Float32Array(imageBuffer.length);
  for (let i = 0; i < imageBuffer.length; i++) {
    float32Data[i] = imageBuffer[i] / 255.0;
  }

  const inputTensor = new ort.Tensor("float32", float32Data, [1, 3, 640, 640]);

  try {
    const outputs = await session.run({ images: inputTensor });
    const output = outputs.output0.data as Float32Array;
    
    let maxConf = 0;
    let bestBox = [0.5, 0.5];

    // 8400 boxes, check person class (index 4)
    for (let col = 0; col < 8400; col++) {
      const conf = output[4 * 8400 + col]; 
      if (conf > maxConf) {
        maxConf = conf;
        bestBox = [output[col] / 640, output[8400 + col] / 640];
      }
    }

    self.postMessage({
      type: "RESULT",
      detections: maxConf > 0.45 ? [maxConf] : [],
      position: bestBox
    });

  } catch (e) {
    self.postMessage({ type: "ERROR" });
  }
};