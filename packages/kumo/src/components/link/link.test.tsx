import { describe, it, expect, vi } from "vitest";
import { createElement, type MouseEvent as ReactMouseEvent } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Link, KUMO_LINK_VARIANTS, linkVariants } from "./link";
import {
  KUMO_NAVIGATE_EVENT,
  KUMO_PREFETCH_EVENT,
  KumoNavigateEvent,
  useClientRouting,
  type KumoPrefetchEvent,
} from "./client-routing";

function RouterBridge({
  onNavigate,
  onPrefetch,
  target,
}: {
  onNavigate?: (href: string, event: KumoNavigateEvent) => void;
  onPrefetch?: (href: string, event: KumoPrefetchEvent) => void;
  target?: EventTarget | null;
}) {
  useClientRouting({ onNavigate, onPrefetch }, { target });
  return null;
}

function listenForEvent<T extends Event>(type: string) {
  const spy = vi.fn();
  const listener: EventListener = (event) => spy(event as T);

  window.addEventListener(type, listener);

  return {
    spy,
    dispose() {
      window.removeEventListener(type, listener);
    },
  };
}

function createClickEvent(init: MouseEventInit = {}): MouseEvent {
  return new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    button: 0,
    ...init,
  });
}

describe("Link", () => {
  it("should be defined", () => {
    expect(Link).toBeDefined();
  });

  it("should render with default props", () => {
    const props = {
      href: "#",
      children: "Learn more",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should apply inline variant classes", () => {
    expect(KUMO_LINK_VARIANTS.variant.inline.classes).toContain(
      "text-kumo-link",
    );
    expect(KUMO_LINK_VARIANTS.variant.inline.classes).toContain("underline");
    expect(KUMO_LINK_VARIANTS.variant.inline.classes).toContain("link-current");
  });

  it("should apply current variant classes", () => {
    expect(KUMO_LINK_VARIANTS.variant.current.classes).toContain(
      "text-current",
    );
    expect(KUMO_LINK_VARIANTS.variant.current.classes).toContain("underline");
    expect(KUMO_LINK_VARIANTS.variant.current.classes).toContain(
      "link-current",
    );
  });

  it("should apply plain variant classes", () => {
    expect(KUMO_LINK_VARIANTS.variant.plain.classes).toContain(
      "text-kumo-link",
    );
    expect(KUMO_LINK_VARIANTS.variant.plain.classes).not.toContain("underline");
  });

  it("should render with inline variant", () => {
    const props = {
      href: "#",
      variant: "inline" as const,
      children: "Inline link",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should render with current variant", () => {
    const props = {
      href: "#",
      variant: "current" as const,
      children: "Current link",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should render with plain variant", () => {
    const props = {
      href: "#",
      variant: "plain" as const,
      children: "Plain link",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should accept className prop", () => {
    const props = {
      href: "#",
      className: "custom-class",
      children: "Custom link",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should generate variant classes via linkVariants helper", () => {
    expect(linkVariants({ variant: "inline" })).toContain("text-kumo-link");
    expect(linkVariants({ variant: "current" })).toContain("text-current");
    expect(linkVariants({ variant: "plain" })).toContain("text-kumo-link");
  });

  it("should default to inline variant", () => {
    expect(linkVariants()).toContain("text-kumo-link");
    expect(linkVariants()).toContain("underline");
  });

  it("should have ExternalIcon subcomponent", () => {
    expect(Link.ExternalIcon).toBeDefined();
  });

  it("should render with ExternalIcon as child", () => {
    const props = {
      href: "https://cloudflare.com",
      target: "_blank",
      rel: "noopener noreferrer",
      children: [
        "Visit Cloudflare ",
        createElement(Link.ExternalIcon, { key: "icon" }),
      ],
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should render with render prop for composition", () => {
    const customAnchor = createElement("a", { href: "/dashboard" });
    const props = {
      render: customAnchor,
      variant: "inline" as const,
      children: "Dashboard",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("dispatches kumo:navigate for eligible internal clicks and prevents the real click when handled", () => {
    const onNavigate = vi.fn((_href: string, event: KumoNavigateEvent) => {
      event.preventDefault();
    });
    const navigateEvents =
      listenForEvent<KumoNavigateEvent>(KUMO_NAVIGATE_EVENT);

    render(
      <>
        <RouterBridge onNavigate={onNavigate} />
        <Link href="/docs">Learn more</Link>
      </>,
    );

    const anchor = screen.getByRole("link", { name: "Learn more" });
    const clickEvent = createClickEvent();
    const dispatchResult = anchor.dispatchEvent(clickEvent);

    expect(dispatchResult).toBe(false);
    expect(clickEvent.defaultPrevented).toBe(true);
    expect(navigateEvents.spy).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(
      new URL("/docs", window.location.href).href,
      expect.objectContaining({
        type: KUMO_NAVIGATE_EVENT,
        detail: expect.objectContaining({
          href: new URL("/docs", window.location.href).href,
          anchor,
          source: "click",
        }),
      }),
    );

    navigateEvents.dispose();
  });

  it("allows normal browser navigation when onNavigate does not prevent the custom event", () => {
    const onNavigate = vi.fn();

    render(
      <>
        <RouterBridge onNavigate={onNavigate} />
        <Link href="/docs">Learn more</Link>
      </>,
    );

    const anchor = screen.getByRole("link", { name: "Learn more" });
    const clickEvent = createClickEvent();
    const dispatchResult = anchor.dispatchEvent(clickEvent);

    expect(dispatchResult).toBe(true);
    expect(clickEvent.defaultPrevented).toBe(false);
    expect(onNavigate).toHaveBeenCalledWith(
      new URL("/docs", window.location.href).href,
      expect.objectContaining({ type: KUMO_NAVIGATE_EVENT }),
    );
  });

  it("stops later navigate listeners after one handler accepts the handoff", () => {
    const firstNavigate = vi.fn((_href: string, event: KumoNavigateEvent) => {
      event.preventDefault();
    });
    const secondNavigate = vi.fn();

    render(
      <>
        <RouterBridge onNavigate={firstNavigate} />
        <RouterBridge onNavigate={secondNavigate} />
        <Link href="/docs">Learn more</Link>
      </>,
    );

    const anchor = screen.getByRole("link", { name: "Learn more" });
    const clickEvent = createClickEvent();
    const dispatchResult = anchor.dispatchEvent(clickEvent);

    expect(dispatchResult).toBe(false);
    expect(clickEvent.defaultPrevented).toBe(true);
    expect(firstNavigate).toHaveBeenCalledTimes(1);
    expect(secondNavigate).not.toHaveBeenCalled();
  });

  it("does not dispatch kumo:navigate for external links", () => {
    const navigateEvents =
      listenForEvent<KumoNavigateEvent>(KUMO_NAVIGATE_EVENT);

    render(<Link href="https://example.com/docs">External</Link>);

    const anchor = screen.getByRole("link", { name: "External" });
    anchor.dispatchEvent(createClickEvent());

    expect(navigateEvents.spy).not.toHaveBeenCalled();

    navigateEvents.dispose();
  });

  it("does not dispatch kumo:navigate for target=_blank links", () => {
    const navigateEvents =
      listenForEvent<KumoNavigateEvent>(KUMO_NAVIGATE_EVENT);

    render(
      <Link href="/docs" target="_blank">
        New tab
      </Link>,
    );

    const anchor = screen.getByRole("link", { name: "New tab" });
    anchor.dispatchEvent(createClickEvent());

    expect(navigateEvents.spy).not.toHaveBeenCalled();

    navigateEvents.dispose();
  });

  it("does not dispatch kumo:navigate for named targets", () => {
    const navigateEvents =
      listenForEvent<KumoNavigateEvent>(KUMO_NAVIGATE_EVENT);

    render(
      <Link href="/docs" target="report-frame">
        Report
      </Link>,
    );

    const anchor = screen.getByRole("link", { name: "Report" });
    anchor.dispatchEvent(createClickEvent());

    expect(navigateEvents.spy).not.toHaveBeenCalled();

    navigateEvents.dispose();
  });

  it("does not dispatch kumo:navigate for download links", () => {
    const navigateEvents =
      listenForEvent<KumoNavigateEvent>(KUMO_NAVIGATE_EVENT);

    render(
      <Link href="/report.csv" download>
        Download
      </Link>,
    );

    const anchor = screen.getByRole("link", { name: "Download" });
    anchor.dispatchEvent(createClickEvent());

    expect(navigateEvents.spy).not.toHaveBeenCalled();

    navigateEvents.dispose();
  });

  it("does not dispatch kumo:navigate for disabled links", () => {
    const navigateEvents =
      listenForEvent<KumoNavigateEvent>(KUMO_NAVIGATE_EVENT);

    render(
      <Link href="/docs" disabled>
        Disabled
      </Link>,
    );

    const anchor = screen.getByRole("link", { name: "Disabled" });
    anchor.dispatchEvent(createClickEvent());

    expect(navigateEvents.spy).not.toHaveBeenCalled();

    navigateEvents.dispose();
  });

  it("does not dispatch kumo:navigate for modified clicks", () => {
    const navigateEvents =
      listenForEvent<KumoNavigateEvent>(KUMO_NAVIGATE_EVENT);

    render(<Link href="/docs">Modified</Link>);

    const anchor = screen.getByRole("link", { name: "Modified" });
    anchor.dispatchEvent(createClickEvent({ metaKey: true }));

    expect(navigateEvents.spy).not.toHaveBeenCalled();

    navigateEvents.dispose();
  });

  it("does not dispatch kumo:navigate for middle clicks", () => {
    const navigateEvents =
      listenForEvent<KumoNavigateEvent>(KUMO_NAVIGATE_EVENT);

    render(<Link href="/docs">Middle</Link>);

    const anchor = screen.getByRole("link", { name: "Middle" });
    anchor.dispatchEvent(createClickEvent({ button: 1 }));

    expect(navigateEvents.spy).not.toHaveBeenCalled();

    navigateEvents.dispose();
  });

  it("does not dispatch kumo:navigate for fragment-only links", () => {
    const navigateEvents =
      listenForEvent<KumoNavigateEvent>(KUMO_NAVIGATE_EVENT);

    render(<Link href="#section">Jump</Link>);

    const anchor = screen.getByRole("link", { name: "Jump" });
    anchor.dispatchEvent(createClickEvent());

    expect(navigateEvents.spy).not.toHaveBeenCalled();

    navigateEvents.dispose();
  });

  it("dispatches kumo:prefetch on hover for eligible internal links", () => {
    const onPrefetch = vi.fn();
    const prefetchEvents =
      listenForEvent<KumoPrefetchEvent>(KUMO_PREFETCH_EVENT);

    render(
      <>
        <RouterBridge onPrefetch={onPrefetch} />
        <Link href="/docs">Hover me</Link>
      </>,
    );

    const anchor = screen.getByRole("link", { name: "Hover me" });
    fireEvent.mouseEnter(anchor);

    expect(prefetchEvents.spy).toHaveBeenCalledTimes(1);
    expect(onPrefetch).toHaveBeenCalledWith(
      new URL("/docs", window.location.href).href,
      expect.objectContaining({
        type: KUMO_PREFETCH_EVENT,
        detail: expect.objectContaining({
          href: new URL("/docs", window.location.href).href,
          anchor,
          source: "hover",
        }),
      }),
    );

    prefetchEvents.dispose();
  });

  it("dispatches kumo:prefetch on focus for eligible internal links", () => {
    const onPrefetch = vi.fn();

    render(
      <>
        <RouterBridge onPrefetch={onPrefetch} />
        <Link href="/docs">Focus me</Link>
      </>,
    );

    const anchor = screen.getByRole("link", { name: "Focus me" });
    fireEvent.focus(anchor);

    expect(onPrefetch).toHaveBeenCalledWith(
      new URL("/docs", window.location.href).href,
      expect.objectContaining({
        type: KUMO_PREFETCH_EVENT,
        detail: expect.objectContaining({ source: "focus" }),
      }),
    );
  });

  it("does not dispatch kumo:navigate when the consumer prevents the click", () => {
    const navigateEvents =
      listenForEvent<KumoNavigateEvent>(KUMO_NAVIGATE_EVENT);
    const onClick = vi.fn((event: ReactMouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Link href="/docs" onClick={onClick}>
        Consumer handled
      </Link>,
    );

    const anchor = screen.getByRole("link", { name: "Consumer handled" });
    const clickEvent = createClickEvent();
    anchor.dispatchEvent(clickEvent);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(clickEvent.defaultPrevented).toBe(true);
    expect(navigateEvents.spy).not.toHaveBeenCalled();

    navigateEvents.dispose();
  });

  it("detaches useClientRouting listeners on unmount", () => {
    const onNavigate = vi.fn();

    const { unmount } = render(<RouterBridge onNavigate={onNavigate} />);
    unmount();

    const anchor = document.createElement("a");
    anchor.href = "/docs";

    window.dispatchEvent(
      new KumoNavigateEvent({
        href: anchor.href,
        anchor,
        nativeEvent: new Event("click"),
        source: "click",
      }),
    );

    expect(onNavigate).not.toHaveBeenCalled();
  });
});
