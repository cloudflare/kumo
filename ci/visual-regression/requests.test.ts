import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DiscoveredComponent } from "./page-config";
import {
  HOME_GRID_SELECTOR,
  buildPageRequests,
  chunkPageRequests,
} from "./requests";

describe("visual regression requests", () => {
  it("captures the homepage grid with a baseline-compatible selector", () => {
    const requests = buildPageRequests([
      { id: "home", name: "Home", url: "/" },
    ]);

    assert.equal(requests.length, 1);
    assert.equal(requests[0]?.selector, HOME_GRID_SELECTOR);
    assert.equal(requests[0]?.captureSections, false);
  });

  it("uses a fixed viewport and stable id for interactive states", () => {
    const requests = buildPageRequests([
      { id: "select", name: "Select", url: "/components/select" },
    ]);

    assert.equal(requests.length, 2);
    assert.equal(requests[1]?.captureId, "select-open");
    assert.equal(requests[1]?.fullPage, false);
    assert.equal(requests[1]?.actions?.at(-1)?.type, "click");
  });

  it("keeps batches within the worker limit without splitting states", () => {
    const components: DiscoveredComponent[] = Array.from(
      { length: 51 },
      (_, index) => ({
        id: index === 49 ? "select" : `component-${index}`,
        name: `Component ${index}`,
        url:
          index === 49
            ? "/components/select"
            : `/components/component-${index}`,
      }),
    );
    const batches = chunkPageRequests(buildPageRequests(components));

    assert.ok(batches.every((batch) => batch.length <= 50));
    assert.deepEqual(
      batches.map((batch) =>
        batch
          .filter((request) => request.url === "/components/select")
          .map((request) => request.captureId),
      ),
      [[], ["select", "select-open"]],
    );
  });

  it("rejects batch sizes that cannot keep interactive states together", () => {
    assert.throws(() => chunkPageRequests([], 1));
  });
});
