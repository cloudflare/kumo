import { useState, useEffect } from "react";
import { Button, cn } from "@cloudflare/kumo";

/**
 * The three available font-scale steps, in the *cycle order* the user
 * traverses on repeated clicks.
 *
 *   default → large → small → default
 */
const CYCLE = ["default", "large", "small"] as const;
type Step = (typeof CYCLE)[number];

const STORAGE_KEY = "font-scale";

/** Human-readable label per step, used for aria + title. */
const LABELS: Record<Step, string> = {
  small: "Small",
  default: "Default",
  large: "Large",
};

function applyStep(step: Step) {
  const root = document.documentElement;
  if (step === "default") {
    root.removeAttribute("data-font-scale");
  } else {
    root.setAttribute("data-font-scale", step);
  }
}

function readInitialStep(): Step {
  if (typeof window === "undefined") return "default";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (CYCLE as readonly string[]).includes(stored)) {
    return stored as Step;
  }
  return "default";
}

/**
 * "aA" toggle — cycles the docs site through five font-scale presets.
 *
 * The lowercase `a` renders at the *previous* step's size, the uppercase `A`
 * at the *current* step's size, so the button itself illustrates where you
 * are on the scale. On click, the icon briefly pulses in the direction the
 * scale moved (up or down) as visual feedback.
 */
export function FontScaleToggle() {
  const [step, setStep] = useState<Step>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initial = readInitialStep();
    setStep(initial);
    applyStep(initial);
  }, []);

  const cycle = () => {
    const idx = CYCLE.indexOf(step);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setStep(next);
    applyStep(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const nextStep = CYCLE[(CYCLE.indexOf(step) + 1) % CYCLE.length];

  // Show the icon in its default state during SSR + before hydration to
  // avoid a layout shift.
  if (!mounted) {
    return (
      <Button variant="ghost" shape="square" aria-label="Adjust font size">
        <FontScaleIcon step="default" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      shape="square"
      aria-label={`Font size: ${LABELS[step]}. Click for ${LABELS[nextStep]}.`}
      title={`Font size: ${LABELS[step]}`}
      onClick={cycle}
    >
      <FontScaleIcon step={step} />
    </Button>
  );
}

/**
 * "aaA" glyph icon — three letters at fixed pixel sizes (11 / 13 / 15) that
 * illustrate the scale. The active step's glyph is rendered in
 * `kumo-default`; the two inactive glyphs are in `kumo-subtle`, so the icon
 * itself doubles as a state indicator.
 *
 * All three sizes are hardcoded in px so the icon does NOT scale with the
 * `--font-scale` multiplier it controls.
 *
 *   small   → left small `a` active
 *   default → middle medium `a` active
 *   large   → uppercase `A` active
 */
function FontScaleIcon({ step }: { step: Step }) {
  const glyphClass = "font-medium transition-colors duration-150";
  return (
    <span
      aria-hidden
      className="inline-flex items-baseline gap-px leading-none"
    >
      <span
        className={cn(
          glyphClass,
          "text-[11px]",
          step === "small" ? "text-kumo-default" : "text-kumo-subtle",
        )}
      >
        a
      </span>
      <span
        className={cn(
          glyphClass,
          "text-[13px]",
          step === "default" ? "text-kumo-default" : "text-kumo-subtle",
        )}
      >
        a
      </span>
      <span
        className={cn(
          glyphClass,
          "text-[15px]",
          step === "large" ? "text-kumo-default" : "text-kumo-subtle",
        )}
      >
        A
      </span>
    </span>
  );
}
