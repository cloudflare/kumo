/**
 * DemoButton — a custom component used to demonstrate the customComponents
 * extension point on UITreeRenderer.
 *
 * Inspired by @jh3y's conic-gradient button (https://codepen.io/jh3y/pen/QWZyxdg).
 * The hover effect reveals a rainbow conic-gradient behind a frosted-glass
 * backdrop — CSS-only, no JavaScript mouse tracking.
 */

import { useRef, useCallback, type ReactNode } from "react";

interface DemoButtonProps {
  /** Button label text */
  readonly children?: ReactNode;
  /** Visual variant */
  readonly variant?: "light" | "dark";
}

const sparkSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-5 shrink-0"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Conic-gradient button with frosted-glass hover effect.
 *
 * The gradient pseudo-element uses `opacity: 0` by default and fades in on
 * hover via the group-hover utility. Because `conic-gradient` isn't directly
 * expressible in Tailwind, we use a small inline style for the `::before`
 * layer and keep everything else in utility classes.
 */
export function DemoButton({
  children = "Click me",
  variant = "light",
}: DemoButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    el.classList.add("scale-[0.97]");
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.remove("scale-[0.97]"));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const isDark = variant === "dark";

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      className={[
        // Layout
        "group relative isolate grid place-items-center",
        "rounded-lg border p-px font-sans text-xl",
        "transition-transform duration-100",
        // Shadow
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(0,0,0,0.5)]",
        // Light / dark
        isDark
          ? "border-neutral-700 bg-neutral-900 text-neutral-50"
          : "border-neutral-300 bg-neutral-200 text-neutral-800",
      ].join(" ")}
    >
      {/* Conic gradient layer (mirrors button::before in the CodePen).
          Absolutely positioned behind the grid content so backdrop-filter
          on the .backdrop span can pick it up. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[calc(0.5rem-1px)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            "conic-gradient(from 45deg at 50% 50%, hsl(10 90% 70%), hsl(140 80% 70%), hsl(320 80% 70%), hsl(210 80% 70%), hsl(10 80% 70%))",
          filter: "saturate(0.7)",
        }}
      />

      {/* Frosted backdrop — position: relative puts it above the absolute
          gradient in stacking order. backdrop-filter blurs/brightens the
          gradient behind it; semi-transparent bg lets the filtered result
          show through. */}
      <span
        aria-hidden="true"
        className={[
          "relative col-start-1 row-start-1 block h-full w-full rounded-[calc(0.5rem-1px)]",
          isDark
            ? "bg-[hsl(0_0%_10%/0.4)] backdrop-blur-[20px] backdrop-brightness-[1.2] backdrop-saturate-100"
            : "bg-[hsl(0_0%_98%/0.6)] backdrop-blur-[20px] backdrop-brightness-150",
        ].join(" ")}
      />

      {/* Text + icon */}
      <span className="z-[2] col-start-1 row-start-1 flex items-center gap-2 px-4 py-2">
        {sparkSvg}
        {children}
      </span>
    </button>
  );
}
