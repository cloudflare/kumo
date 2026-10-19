import { describe, expect, it } from "vite-plus/test";
import { getApproximateMarkerClusterInterval } from "./timeseries-markers";

describe("getApproximateMarkerClusterInterval", () => {
  it("divides the timestamp extent by the tick count", () => {
    expect(getApproximateMarkerClusterInterval([30, 10, 50, 20], 4)).toBe(10);
  });

  it("returns 0 for fewer than two timestamps", () => {
    expect(getApproximateMarkerClusterInterval([], 10)).toBe(0);
    expect(getApproximateMarkerClusterInterval([42], 10)).toBe(0);
  });

  it("handles datasets larger than the engine's argument limit", () => {
    const timestamps = Array.from({ length: 500_000 }, (_, i) => i);
    expect(getApproximateMarkerClusterInterval(timestamps, 10)).toBe(49_999.9);
  });

  it("accepts any iterable", () => {
    function* timestamps() {
      yield 100;
      yield 0;
    }
    expect(getApproximateMarkerClusterInterval(timestamps(), 5)).toBe(20);
  });
});
