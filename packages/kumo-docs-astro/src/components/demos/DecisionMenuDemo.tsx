import { useRef, useState } from "react";
import { Button } from "@cloudflare/kumo";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { DecisionMenu } from "../kumo/decision-menu";
import type { StatusIndicatorProps } from "../kumo/decision-menu";

// ---------------------------------------------------------------------------
// Decision Menu — interactive
// ---------------------------------------------------------------------------

type DemoStatus = "pending" | "applying" | "done" | "cancelled" | "failed";

/** Full-featured decision menu with options, keyboard shortcuts, and footer. */
export function DecisionMenuDemo() {
  const [status, setStatus] = useState<DemoStatus>("pending");
  const [selected, setSelected] = useState("update");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSubmit = (value: string) => {
    setSelected(value);
    setStatus("applying");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("done"), 1500);
  };

  const handleCancel = () => {
    clearTimeout(timerRef.current);
    setSelected("");
    setStatus("cancelled");
  };

  const isPending = status === "pending";

  return (
    <div className="w-full max-w-lg">
      <DecisionMenu onCancel={handleCancel}>
        <DecisionMenu.Description>
          <p>
            Update the DNS record <strong>example.com</strong> to point to the
            new origin server?
          </p>
        </DecisionMenu.Description>
        <DecisionMenu.Actions
          onSubmit={handleSubmit}
          value={selected}
          disabled={!isPending}
        >
          <DecisionMenu.Option label="Update existing record" value="update" />
          <DecisionMenu.Option label="Create new record" value="create" />
          <DecisionMenu.Option label="Skip this change" value="skip" />
        </DecisionMenu.Actions>
        <DecisionMenu.Footer>
          {isPending ? (
            <>
              <DecisionMenu.ShortcutButton type="submit" shortcut="↵">
                Confirm
              </DecisionMenu.ShortcutButton>
              <DecisionMenu.ShortcutButton type="cancel" shortcut="Esc">
                Cancel
              </DecisionMenu.ShortcutButton>
            </>
          ) : (
            <DecisionMenu.StatusIndicator
              status={
                status === "applying"
                  ? "loading"
                  : status === "done"
                    ? "done"
                    : status === "cancelled"
                      ? "cancelled"
                      : "failed"
              }
              action={
                status !== "applying" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    shape="square"
                    icon={ArrowCounterClockwiseIcon}
                    aria-label="Retry"
                    onClick={() => {
                      clearTimeout(timerRef.current);
                      setStatus("pending");
                      setSelected("update");
                    }}
                  />
                )
              }
            />
          )}
        </DecisionMenu.Footer>
      </DecisionMenu>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status Indicators
// ---------------------------------------------------------------------------

const STATUSES: StatusIndicatorProps["status"][] = [
  "done",
  "cancelled",
  "loading",
  "failed",
];

/** All four status indicator states shown side by side. */
export function DecisionMenuStatusDemo() {
  return (
    <div className="w-full max-w-lg flex flex-col gap-3">
      {STATUSES.map((status) => (
        <DecisionMenu key={status}>
          <DecisionMenu.StatusIndicator
            status={status}
            description={
              status === "failed"
                ? "DNS validation failed: CNAME record conflicts with an existing A record for example.com. Remove the A record first, then retry."
                : undefined
            }
          />
        </DecisionMenu>
      ))}
    </div>
  );
}
