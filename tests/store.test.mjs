import test from "node:test";
import assert from "node:assert/strict";
import { useStore } from "../src/store/useStore.ts";
const initial = useStore.getState();
test.beforeEach(() => useStore.setState(initial, true));
test("turning the camera off clears tracking while preserving a useful error", () => {
  useStore.getState().setCameraOn(true);
  useStore
    .getState()
    .setDetectionResult({
      acquired: true,
      position: [0.2, 0.3],
      box: [0, 0, 0.4, 0.6],
      confidence: 90,
      latency: 50,
    });
  useStore.getState().setCameraError("Camera disconnected");
  useStore.getState().setCameraOn(false);
  const state = useStore.getState();
  assert.equal(state.isTargetAcquired, false);
  assert.equal(state.boundingBox, null);
  assert.equal(state.confidence, 0);
  assert.equal(state.cameraError, "Camera disconnected");
  assert.deepEqual(state.targetPosition, [0.5, 0.5]);
});
test("late worker replies never restore detection after camera shutdown", () => {
  useStore
    .getState()
    .setDetectionResult({
      acquired: true,
      position: [0.2, 0.3],
      box: [0, 0, 0.4, 0.6],
      confidence: 90,
      latency: 50,
    });
  assert.equal(useStore.getState().isTargetAcquired, false);
});
test("enabling camera starts with boolean tracking and clears stale errors", () => {
  useStore.getState().setCameraError("Denied");
  useStore.getState().setCameraOn(true);
  assert.equal(useStore.getState().isTargetAcquired, false);
  assert.equal(useStore.getState().cameraError, null);
});
test("reduced motion pauses by default but explicit play remains available", () => {
  useStore.getState().setReducedMotion(true);
  assert.equal(useStore.getState().isPlaying, false);
  useStore.getState().togglePlayback();
  assert.equal(useStore.getState().isPlaying, true);
});
test("reset advances the view key and speed stays bounded", () => {
  useStore.getState().resetView();
  assert.equal(useStore.getState().resetKey, 1);
  useStore.getState().setMotionSpeed(100);
  assert.equal(useStore.getState().motionSpeed, 1);
});
