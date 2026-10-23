import test from "node:test";
import assert from "node:assert/strict";
import { parseDetections } from "../src/utils/detection.ts";

test("YOLO26 selects a person over a more confident non-person", () => {
  const result = parseDetections(
    new Float32Array([0, 0, 640, 640, 0.99, 56, 160, 80, 480, 560, 0.8, 0]),
    [1, 2, 6],
    "yolo26",
  );
  assert.equal(result.acquired, true);
  assert.equal(result.confidence, 80);
  assert.deepEqual(result.box, [0.25, 0.125, 0.75, 0.875]);
  assert.deepEqual(result.position, [0.5, 0.5]);
});
test("unrelated objects and low confidence people never acquire presence", () => {
  const result = parseDetections(
    new Float32Array([0, 0, 640, 640, 0.99, 16, 0, 0, 640, 640, 0.3, 0]),
    [1, 2, 6],
    "yolo26",
  );
  assert.equal(result.acquired, false);
  assert.equal(result.confidence, 0);
  assert.equal(result.box, null);
});
test("letterbox padding is removed from preview coordinates", () => {
  const result = parseDetections(
    new Float32Array([160, 200, 480, 440, 0.9, 0]),
    [1, 1, 6],
    "yolo26",
    [0, 0.125, 1, 0.75],
  );
  assert.deepEqual(result.box, [0.25, 0.25, 0.75, 0.75]);
});
test("invalid boxes and nonfinite scores cannot displace a valid person", () => {
  const result = parseDetections(
    new Float32Array([
      NaN,
      0,
      640,
      640,
      0.99,
      0,
      0,
      0,
      640,
      640,
      Infinity,
      0,
      160,
      160,
      480,
      480,
      0.7,
      0,
    ]),
    [1, 3, 6],
    "yolo26",
  );
  assert.equal(result.confidence, 70);
  assert.deepEqual(result.box, [0.25, 0.25, 0.75, 0.75]);
});
test("YOLOv8 compares all class scores and selects only a person", () => {
  // planar x/y/w/h/person/non-person, two candidates
  const result = parseDetections(
    new Float32Array([
      320, 320, 320, 320, 320, 160, 320, 160, 0.95, 0.7, 0.99, 0.1,
    ]),
    [1, 6, 2],
    "yolov8",
  );
  assert.equal(result.confidence, 70);
  assert.deepEqual(result.box, [0.375, 0.375, 0.625, 0.625]);
});
test("unsupported output shapes surface an error instead of false presence", () => {
  assert.throws(
    () => parseDetections(new Float32Array(6), [1, 6, 1], "yolo26"),
    /Unsupported/,
  );
  assert.throws(
    () => parseDetections(new Float32Array(6), [1, 300, 6], "yolo26"),
    /Unsupported/,
  );
});
