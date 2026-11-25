import { describe, expect, it } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { PoweredByCloudflare } from "./cloudflare-logo";
import { LinkProvider } from "../../utils/link-provider";

describe("PoweredByCloudflare", () => {
  it("names the link by its text, not the decorative logo", () => {
    render(<PoweredByCloudflare />);

    const link = screen.getByRole("link", { name: "Powered by Cloudflare" });
    expect(link.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("links to cloudflare.com in the same tab by default", () => {
    render(<PoweredByCloudflare />);

    const link = screen.getByRole("link", { name: "Powered by Cloudflare" });
    expect(link.getAttribute("href")).toBe("https://www.cloudflare.com");
    expect(link.hasAttribute("target")).toBe(false);
  });

  it("follows the provider's new-tab policy", () => {
    render(
      <LinkProvider externalLinks="new-tab">
        <PoweredByCloudflare />
      </LinkProvider>,
    );

    const link = screen.getByRole("link", {
      name: "Powered by Cloudflare (opens in a new tab)",
    });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener");
  });

  it("announces target='_blank' even when the icon is hidden", () => {
    render(<PoweredByCloudflare target="_blank" newTabIcon={false} />);

    const link = screen.getByRole("link", {
      name: "Powered by Cloudflare (opens in a new tab)",
    });
    expect(link.hasAttribute("data-kumo-new-tab-icon")).toBe(false);
  });
});
