import { createRef, forwardRef, type ComponentPropsWithoutRef } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Banner, bannerVariants } from "./banner";
import { Link } from "../link/link";

const RouterLink = forwardRef<
  HTMLAnchorElement,
  Omit<ComponentPropsWithoutRef<"a">, "href"> & { to: string }
>(function RouterLink({ to, ...props }, ref) {
  return <a ref={ref} href={to} {...props} />;
});

describe("Banner", () => {
  it("supports secondary variant", () => {
    const className = bannerVariants({ variant: "secondary" });

    expect(className).toContain("bg-kumo-contrast/5");
    expect(className).toContain("text-kumo-default/70");
  });

  it("forwards root div props", () => {
    render(
      <Banner
        role="status"
        data-testid="banner"
        aria-live="polite"
        title="System status"
      />,
    );

    const banner = screen.getByTestId("banner");
    expect(banner.getAttribute("role")).toBe("status");
    expect(banner.getAttribute("aria-live")).toBe("polite");
    expect(banner.textContent).toBe("System status");
  });

  it("styles a solid Banner.Action from the banner variant accent", () => {
    render(
      <Banner
        variant="error"
        title="Save failed"
        action={<Banner.Action data-testid="cta">Retry</Banner.Action>}
      />,
    );

    const cta = screen.getByTestId("cta");
    expect(cta.tagName).toBe("BUTTON");
    expect(cta.getAttribute("data-kumo-component")).toBe("Button");
    expect(cta.className).toContain("text-white");
    expect(cta.className).toContain("bg-(--kumo-button-emphasis-bg)");
    expect(
      cta.style.getPropertyValue("--kumo-button-emphasis-gradient-end"),
    ).toBe("var(--color-kumo-danger)");
    expect(cta.style.getPropertyValue("--kumo-button-emphasis-bg")).toBe(
      "color-mix(in oklch, var(--color-kumo-danger), white 30%)",
    );
    expect(cta.parentElement?.className).toContain("gap-2");
  });

  it("styles a ghost Banner.Action with accent text and a tinted hover", () => {
    render(
      <Banner
        variant="alert"
        title="Session expiring"
        action={
          <Banner.Action variant="ghost" data-testid="cta">
            Dismiss
          </Banner.Action>
        }
      />,
    );

    const cta = screen.getByTestId("cta");
    expect(cta.className).toContain("fill-kumo-warning");
    expect(cta.className).toContain("hover:bg-kumo-warning/10");
  });

  it("renders a link with banner styling, content, and merged props and refs", async () => {
    const user = userEvent.setup();
    const actionRef = vi.fn();
    const linkRef = createRef<HTMLAnchorElement>();
    const onActionClick = vi.fn();
    const onLinkClick = vi.fn((event) => event.preventDefault());
    render(
      <Banner
        variant="alert"
        title="Review your payment method"
        action={
          <Banner.Action
            ref={actionRef}
            icon={<svg data-testid="payment-icon" />}
            onClick={onActionClick}
            className="action-class"
            render={
              <a
                ref={linkRef}
                href="/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="link-class"
                onClick={onLinkClick}
              />
            }
          >
            Manage payments
          </Banner.Action>
        }
      />,
    );

    const link = screen.getByRole("link", { name: "Manage payments" });
    expect(link.getAttribute("href")).toBe("/billing");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.hasAttribute("type")).toBe(false);
    expect(link.hasAttribute("disabled")).toBe(false);
    expect(link.className).toContain("action-class");
    expect(link.className).toContain("link-class");
    expect(link.className).toContain("h-6.5");
    expect(
      link.style.getPropertyValue("--kumo-button-emphasis-gradient-end"),
    ).toBe("var(--color-kumo-warning)");
    expect(link.contains(screen.getByTestId("payment-icon"))).toBe(true);
    expect(actionRef).toHaveBeenLastCalledWith(link);
    expect(linkRef.current).toBe(link);
    expect(screen.queryByRole("button")).toBeNull();

    await user.click(link);
    expect(onActionClick).toHaveBeenCalledOnce();
    expect(onLinkClick).toHaveBeenCalledOnce();

    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(link);
    await user.keyboard("{Enter}");
    expect(onActionClick).toHaveBeenCalledTimes(2);
    expect(onLinkClick).toHaveBeenCalledTimes(2);
  });

  it("preserves link semantics when the action has a tooltip", () => {
    render(
      <Banner.Action
        title="Open billing settings"
        render={<a href="/billing" />}
      >
        Manage payments
      </Banner.Action>,
    );

    const link = screen.getByRole("link", { name: "Manage payments" });
    expect(link.getAttribute("href")).toBe("/billing");
    expect(link.hasAttribute("title")).toBe(false);
    expect(link.hasAttribute("data-base-ui-tooltip-trigger")).toBe(true);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("composes a router link through a render callback in a compact banner", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Banner
        size="sm"
        variant="error"
        title="Payment overdue"
        action={
          <Banner.Action
            variant="secondary"
            render={(props) => (
              <RouterLink {...props} ref={ref} to="/billing" />
            )}
          >
            Go to billing
          </Banner.Action>
        }
      />,
    );

    const link = screen.getByRole("link", { name: "Go to billing" });
    expect(link.getAttribute("href")).toBe("/billing");
    expect(link.className).toContain("ring-kumo-danger/50");
    expect(link.className).toContain("h-5");
    expect(link.parentElement?.className).toContain("shrink-0");
    expect(ref.current).toBe(link);
  });

  it.each(["disabled", "loading"] as const)(
    "prevents navigation and activation when a composed action is %s",
    async (state) => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onLinkClick = vi.fn();
      const { rerender } = render(
        <Banner.Action
          {...{ [state]: true }}
          onClick={onClick}
          render={<a href="/billing" onClick={onLinkClick} />}
        >
          Manage payments
        </Banner.Action>,
      );

      const button = screen.getByRole("button");
      expect(button.hasAttribute("disabled")).toBe(true);
      expect(button.hasAttribute("href")).toBe(false);
      expect(screen.queryByRole("link")).toBeNull();
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
      expect(onLinkClick).not.toHaveBeenCalled();

      rerender(
        <Banner.Action render={<a href="/billing" />}>
          Manage payments
        </Banner.Action>,
      );
      expect(screen.getByRole("link").getAttribute("href")).toBe("/billing");
    },
  );

  it("styles a secondary Banner.Action as an accent-hued outline", () => {
    render(
      <Banner
        variant="error"
        title="Save failed"
        action={
          <Banner.Action variant="secondary" data-testid="cta">
            Retry
          </Banner.Action>
        }
      />,
    );

    const cta = screen.getByTestId("cta");
    // Transparent bg + accent-hued ring in the same hue as the error banner accent.
    expect(cta.className).toContain("ring-kumo-danger/50");
    expect(cta.className).toContain("hover:bg-kumo-danger/10");
    expect(cta.className).toContain("hover:!ring-kumo-danger/50");
    expect(cta.className).toContain("hover:!text-inherit");
    // Not the filled primary CTA.
    expect(cta.className).toContain("bg-transparent");
    expect(cta.className).not.toContain("text-white");
    expect(
      cta.style.getPropertyValue("--kumo-button-emphasis-gradient-end"),
    ).toBe("");
  });

  it("renders an icon-only Banner.Action with standard button sizing", () => {
    render(
      <Banner
        variant="default"
        title="Heads up"
        action={
          <Banner.Action
            variant="ghost"
            icon={<svg data-testid="icon" />}
            aria-label="Dismiss"
            data-testid="cta"
          />
        }
      />,
    );

    const cta = screen.getByTestId("cta");
    expect(cta.className).toContain("h-6.5");
    expect(cta.className).toContain("px-2");
    expect(cta.getAttribute("aria-label")).toBe("Dismiss");
    expect(screen.getByTestId("icon")).toBeTruthy();
  });

  it("defaults Banner.Action children to sm in a base banner", () => {
    render(
      <Banner
        variant="default"
        title="Heads up"
        action={<Banner.Action data-testid="cta">Details</Banner.Action>}
      />,
    );

    const cta = screen.getByTestId("cta");
    expect(cta.className).toContain("h-6.5");
    expect(cta.className).toContain("px-2");
    expect(cta.className).toContain("text-xs");
  });

  it("applies compact spacing for the sm banner size", () => {
    const className = bannerVariants({ size: "sm" });

    expect(className).toContain("px-3");
    expect(className).toContain("py-2");
    expect(className).toContain("text-sm");
    // Compact banners align everything on one centered row.
    expect(className).toContain("items-center");
    // Base-size spacing/alignment must not leak in.
    expect(className).not.toContain("px-4");
    expect(className).not.toContain("items-start");
  });

  it("defaults Banner.Action children to xs in an sm banner", () => {
    render(
      <Banner
        size="sm"
        variant="default"
        title="Heads up"
        action={<Banner.Action data-testid="cta">Details</Banner.Action>}
      />,
    );

    const cta = screen.getByTestId("cta");
    // Inherits the banner's size => xs (h-5), not the standalone sm default (h-6.5).
    expect(cta.className).toContain("h-5");
    expect(cta.className).toContain("px-1.5");
  });

  it("matches an icon-only action to the text action height in an sm banner", () => {
    render(
      <Banner
        size="sm"
        title="Update available"
        action={
          <Banner.Action
            variant="ghost"
            icon={<svg />}
            aria-label="Dismiss"
            data-testid="cta"
          />
        }
      />,
    );

    const cta = screen.getByTestId("cta");
    expect(cta.className).toContain("h-5");
    expect(cta.className).toContain("px-1.5");
    expect(cta.className).not.toContain("size-3.5");
  });

  it("renders title and description inline in an sm banner", () => {
    render(
      <Banner size="sm" title="Heads up" description="More details here" />,
    );

    const title = screen.getByText("Heads up");
    const description = screen.getByText("More details here");
    // Inline: both are spans sharing one baseline-aligned flex row.
    expect(title.tagName).toBe("SPAN");
    expect(description.tagName).toBe("SPAN");
    expect(title.parentElement).toBe(description.parentElement);
    expect(title.parentElement?.className).toContain("items-baseline");
  });

  it("renders a Link action inline at text-sm in an sm banner", () => {
    render(
      <Banner
        size="sm"
        description="A DNS record already exists."
        action={
          <Link href="#manage" data-testid="action">
            Manage DNS
          </Link>
        }
      />,
    );

    const description = screen.getByText("A DNS record already exists.");
    const action = screen.getByTestId("action");
    const actionGroup = action.parentElement;

    expect(actionGroup?.parentElement).toBe(description);
    expect(actionGroup?.className).toContain("ml-1.5");
    expect(description.className).toContain("text-sm");
  });

  it("keeps a Banner.Action trailing in an sm banner", () => {
    render(
      <Banner
        size="sm"
        description="A DNS record already exists."
        action={<Banner.Action data-testid="action">Manage DNS</Banner.Action>}
      />,
    );

    const description = screen.getByText("A DNS record already exists.");
    const actionGroup = screen.getByTestId("action").parentElement;

    expect(actionGroup?.className).toContain("shrink-0");
    expect(actionGroup?.parentElement).toBe(
      description.parentElement?.parentElement,
    );
  });

  it("keeps the action trailing in a base banner", () => {
    render(
      <Banner
        description="A DNS record already exists."
        action={
          <a href="#manage" data-testid="action">
            Manage DNS
          </a>
        }
      />,
    );

    const actionGroup = screen.getByTestId("action").parentElement;

    expect(actionGroup?.className).toContain("shrink-0");
  });

  it("stacks title and description in a base banner", () => {
    render(<Banner title="Heads up" description="More details here" />);

    const title = screen.getByText("Heads up");
    const description = screen.getByText("More details here");
    // Stacked: title is a <p>, and they do not share the same parent.
    expect(title.tagName).toBe("P");
    expect(title.parentElement).not.toBe(description.parentElement);
  });
});
