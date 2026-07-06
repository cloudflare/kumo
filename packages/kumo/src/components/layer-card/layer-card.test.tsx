import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LayerCard } from "./layer-card";

describe("LayerCard", () => {
  describe("HTML attribute pass-through", () => {
    it("passes data-testid to LayerCard.Primary", () => {
      const { container } = render(
        <LayerCard>
          <LayerCard.Secondary>Header</LayerCard.Secondary>
          <LayerCard.Primary data-testid="primary-card">
            Content
          </LayerCard.Primary>
        </LayerCard>,
      );

      const primary = container.querySelector('[data-testid="primary-card"]');
      expect(primary).toBeTruthy();
      expect(primary!.textContent).toBe("Content");
    });

    it("passes data-testid to LayerCard.Secondary", () => {
      const { container } = render(
        <LayerCard>
          <LayerCard.Secondary data-testid="secondary-card">
            Header
          </LayerCard.Secondary>
          <LayerCard.Primary>Content</LayerCard.Primary>
        </LayerCard>,
      );

      const secondary = container.querySelector(
        '[data-testid="secondary-card"]',
      );
      expect(secondary).toBeTruthy();
      expect(secondary!.textContent).toBe("Header");
    });

    it("passes aria attributes to sections", () => {
      const { container } = render(
        <LayerCard>
          <LayerCard.Secondary aria-label="secondary section">
            Header
          </LayerCard.Secondary>
          <LayerCard.Primary aria-label="primary section">
            Content
          </LayerCard.Primary>
        </LayerCard>,
      );

      expect(
        container.querySelector('[aria-label="secondary section"]'),
      ).toBeTruthy();
      expect(
        container.querySelector('[aria-label="primary section"]'),
      ).toBeTruthy();
    });
  });
});
