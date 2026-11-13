import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyChangedFiles,
  getAffectedComponents,
  getComponentFromFile,
  type DiscoveredComponent,
} from "./page-config";

const components: DiscoveredComponent[] = [
  { id: "home", name: "Home", url: "/" },
  { id: "button", name: "Button", url: "/components/button" },
];

describe("visual regression page selection", () => {
  it("maps homepage files to the homepage capture", () => {
    const homeGrid =
      "packages/kumo-docs-astro/src/components/demos/HomeGrid.tsx";

    assert.equal(getComponentFromFile(homeGrid), "home");
    assert.deepEqual(getAffectedComponents([homeGrid], components), [
      components[0],
    ]);
    assert.deepEqual(classifyChangedFiles([homeGrid]), {
      affectedComponents: new Set(["home"]),
      requiresFullRegression: false,
      allSkippable: false,
    });
  });

  it("keeps component changes scoped to their docs page", () => {
    const button = "packages/kumo/src/components/button/button.tsx";

    assert.equal(getComponentFromFile(button), "button");
    assert.deepEqual(getAffectedComponents([button], components), [
      components[1],
    ]);
  });

  it("classifies shared styles as requiring full coverage", () => {
    const result = classifyChangedFiles(["packages/kumo/src/styles/kumo.css"]);

    assert.equal(result.requiresFullRegression, true);
    assert.equal(result.allSkippable, false);
  });
});
