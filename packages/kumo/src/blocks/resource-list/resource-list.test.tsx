import { describe, it, expect } from "vitest";
import { ResourceListPage } from "./resource-list";

describe("ResourceListPage", () => {
  it("should be defined", () => {
    expect(ResourceListPage).toBeDefined();
  });

  it("should accept required props", () => {
    const props = {
      children: "Test content",
    };
    expect(() => ResourceListPage(props)).not.toThrow();
  });

  it("should accept all optional props", () => {
    const props = {
      title: "Test Title",
      description: "Test Description",
      icon: "Icon",
      usage: "Usage",
      additionalContent: "Additional",
      children: "Content",
      className: "custom-class",
    };
    expect(() => ResourceListPage(props)).not.toThrow();
  });
});
