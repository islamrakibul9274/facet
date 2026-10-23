export type DetectionBox = [number, number, number, number];
export type ModelType = "yolo26" | "yolov8";
const SIZE = 640;
const THRESHOLD = 0.4;

/** Select only the strongest person and undo the input frame's letterboxing. */
export function parseDetections(
  data: Float32Array,
  dims: readonly number[],
  model: ModelType,
  imageRect: readonly number[] = [0, 0, 1, 1],
) {
  let confidence = THRESHOLD;
  let box: DetectionBox | null = null;
  const validScore = (score: number) =>
    Number.isFinite(score) && score > confidence && score <= 1;
  if (model === "yolo26") {
    if (dims.length !== 3 || dims[2] !== 6 || dims[1] * 6 > data.length)
      throw new Error("Unsupported tracking model");
    for (let i = 0; i < dims[1]; i++) {
      const offset = i * 6;
      const score = data[offset + 4];
      if (Math.round(data[offset + 5]) !== 0 || !validScore(score)) continue;
      const candidate = [
        data[offset],
        data[offset + 1],
        data[offset + 2],
        data[offset + 3],
      ];
      if (
        candidate.some((value) => !Number.isFinite(value)) ||
        candidate[2] <= candidate[0] ||
        candidate[3] <= candidate[1]
      )
        continue;
      confidence = score;
      box = candidate.map((value) => value / SIZE) as DetectionBox;
    }
  } else {
    const count = dims[2];
    const classes = dims[1] - 4;
    if (
      dims.length !== 3 ||
      !count ||
      classes < 1 ||
      dims[1] * count > data.length
    )
      throw new Error("Unsupported tracking model");
    for (let i = 0; i < count; i++) {
      const score = data[4 * count + i];
      if (!validScore(score)) continue;
      let isPerson = true;
      for (let cls = 1; cls < classes; cls++) {
        if (data[(4 + cls) * count + i] > score) {
          isPerson = false;
          break;
        }
      }
      if (!isPerson) continue;
      const x = data[i],
        y = data[count + i],
        width = data[2 * count + i],
        height = data[3 * count + i];
      if (
        ![x, y, width, height].every(Number.isFinite) ||
        width <= 0 ||
        height <= 0
      )
        continue;
      confidence = score;
      box = [
        (x - width / 2) / SIZE,
        (y - height / 2) / SIZE,
        (x + width / 2) / SIZE,
        (y + height / 2) / SIZE,
      ];
    }
  }
  if (box) {
    const [left, top, width, height] = imageRect;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    box = [
      clamp((box[0] - left) / width),
      clamp((box[1] - top) / height),
      clamp((box[2] - left) / width),
      clamp((box[3] - top) / height),
    ];
    if (
      box.some((value) => !Number.isFinite(value)) ||
      box[2] <= box[0] ||
      box[3] <= box[1]
    )
      box = null;
  }
  return {
    acquired: box !== null,
    confidence: box ? Math.round(confidence * 100) : 0,
    position: box
      ? ([(box[0] + box[2]) / 2, (box[1] + box[3]) / 2] as [number, number])
      : ([0.5, 0.5] as [number, number]),
    box,
  };
}
