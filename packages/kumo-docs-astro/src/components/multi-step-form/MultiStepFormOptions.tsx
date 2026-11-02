import { useState, type ReactNode } from "react";
import { Button, LayerCard, Meter, Tabs, Text, cn } from "@cloudflare/kumo";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CheckIcon,
} from "@phosphor-icons/react";

const STEPS = ["Account", "Details", "Billing", "Review"];

type StepStatus = "complete" | "current" | "upcoming";

function getStatus(index: number, current: number): StepStatus {
  if (index < current) return "complete";
  return index === current ? "current" : "upcoming";
}

function useStepper(count: number) {
  const [current, setCurrent] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const moveTo = (index: number) => {
    const next = Math.min(Math.max(index, 0), count);
    setCurrent(next);
    setFurthest((f) => Math.max(f, next));
  };
  return {
    current,
    furthest,
    isDone: current >= count,
    back: () => moveTo(current - 1),
    next: () => moveTo(current + 1),
    goTo: (index: number) => {
      if (index <= furthest) moveTo(index);
    },
    reset: () => {
      setCurrent(0);
      setFurthest(0);
    },
  };
}

type Stepper = ReturnType<typeof useStepper>;

function StepBody({ stepper }: { stepper: Stepper }) {
  return stepper.isDone ? (
    <div className="flex min-h-56 flex-col items-center justify-center gap-2 text-center">
      <CheckCircleIcon size={40} weight="fill" className="text-kumo-success" />
      <Text variant="heading" as="h3">
        All steps completed
      </Text>
      <Text variant="secondary" size="sm">
        You can go back to review any step.
      </Text>
    </div>
  ) : (
    <div className="min-h-56" />
  );
}

function StepFooter({ stepper }: { stepper: Stepper }) {
  const isLast = stepper.current === STEPS.length - 1;
  return (
    <div className="flex items-center justify-between border-t border-kumo-line pt-4">
      <Button
        variant="secondary"
        icon={ArrowLeftIcon}
        disabled={stepper.current === 0}
        onClick={stepper.back}
      >
        Back
      </Button>
      {stepper.isDone ? (
        <Button variant="primary" onClick={stepper.reset}>
          Start over
        </Button>
      ) : (
        <Button variant="primary" onClick={stepper.next}>
          {isLast ? "Finish" : "Continue"}
          {isLast ? <CheckIcon size={16} /> : <ArrowRightIcon size={16} />}
        </Button>
      )}
    </div>
  );
}

function FormShell({
  header,
  stepper,
}: {
  header: ReactNode;
  stepper: Stepper;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      {header}
      <LayerCard className="flex flex-col gap-4 p-6">
        <StepBody stepper={stepper} />
        <StepFooter stepper={stepper} />
      </LayerCard>
    </div>
  );
}

function StepMarker({
  index,
  status,
  className,
}: {
  index: number;
  status: StepStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
        status === "complete" && "bg-kumo-success text-white",
        status === "current" &&
          "bg-kumo-brand text-white ring-4 ring-kumo-brand/20",
        status === "upcoming" &&
          "bg-kumo-base text-kumo-subtle ring ring-kumo-line",
        className,
      )}
    >
      {status === "complete" ? (
        <CheckIcon size={16} weight="bold" />
      ) : (
        index + 1
      )}
    </span>
  );
}

export function CircleConnectorStepper() {
  const stepper = useStepper(STEPS.length);
  return (
    <FormShell
      stepper={stepper}
      header={
        <ol className="flex w-full">
          {STEPS.map((label, index) => {
            const status = getStatus(index, stepper.current);
            return (
              <li
                key={label}
                aria-current={status === "current" ? "step" : undefined}
                className="relative flex flex-1 flex-col items-center gap-2"
              >
                {index < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-4 left-1/2 h-0.5 w-full -translate-y-1/2 transition-colors",
                      index < stepper.current
                        ? "bg-kumo-success"
                        : "bg-kumo-fill",
                    )}
                  />
                ) : null}
                <StepMarker index={index} status={status} />
                <span
                  className={cn(
                    "text-sm",
                    status === "upcoming"
                      ? "text-kumo-subtle"
                      : "font-medium text-kumo-default",
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      }
    />
  );
}

export function SegmentedBarStepper() {
  const stepper = useStepper(STEPS.length);
  return (
    <FormShell
      stepper={stepper}
      header={
        <ol className="grid w-full grid-cols-4 gap-2">
          {STEPS.map((label, index) => {
            const status = getStatus(index, stepper.current);
            return (
              <li
                key={label}
                aria-current={status === "current" ? "step" : undefined}
                className="flex flex-col gap-2"
              >
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-colors",
                    status === "complete" && "bg-kumo-success",
                    status === "current" && "bg-kumo-brand",
                    status === "upcoming" && "bg-kumo-fill",
                  )}
                />
                <span className="flex flex-col">
                  <span className="text-xs text-kumo-subtle">
                    Step {index + 1}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-sm",
                      status === "upcoming"
                        ? "text-kumo-subtle"
                        : "font-medium text-kumo-default",
                    )}
                  >
                    {label}
                    {status === "complete" ? (
                      <CheckCircleIcon
                        size={14}
                        weight="fill"
                        className="text-kumo-success"
                      />
                    ) : null}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      }
    />
  );
}

export function PillBreadcrumbStepper() {
  const stepper = useStepper(STEPS.length);
  return (
    <FormShell
      stepper={stepper}
      header={
        <ol className="flex flex-wrap items-center gap-2">
          {STEPS.map((label, index) => {
            const status = getStatus(index, stepper.current);
            return (
              <li
                key={label}
                aria-current={status === "current" ? "step" : undefined}
                className="flex items-center gap-2"
              >
                <span
                  className={cn(
                    "flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-medium transition-colors",
                    status === "complete" &&
                      "bg-kumo-success-tint text-kumo-success",
                    status === "current" && "bg-kumo-brand text-white",
                    status === "upcoming" && "bg-kumo-fill text-kumo-subtle",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs",
                      status === "complete" && "bg-kumo-success text-white",
                      status === "current" && "bg-white text-kumo-brand",
                      status === "upcoming" && "bg-kumo-base",
                    )}
                  >
                    {status === "complete" ? (
                      <CheckIcon size={12} weight="bold" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {label}
                </span>
                {index < STEPS.length - 1 ? (
                  <CaretRightIcon
                    size={14}
                    aria-hidden="true"
                    className="text-kumo-subtle"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      }
    />
  );
}

export function MeterWithMarkersStepper() {
  const stepper = useStepper(STEPS.length);
  const stepNumber = Math.min(stepper.current + 1, STEPS.length);
  return (
    <FormShell
      stepper={stepper}
      header={
        <div className="flex flex-col gap-3">
          <Meter
            label={`Step ${stepNumber} of ${STEPS.length}`}
            customValue={stepper.isDone ? "Complete" : STEPS[stepper.current]}
            value={(stepper.current / STEPS.length) * 100}
            indicatorClassName={cn(
              stepper.isDone &&
                "from-kumo-success via-kumo-success to-kumo-success",
            )}
          />
          <ol className="flex justify-between">
            {STEPS.map((label, index) => {
              const status = getStatus(index, stepper.current);
              return (
                <li
                  key={label}
                  aria-current={status === "current" ? "step" : undefined}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full font-semibold",
                      status === "complete" && "bg-kumo-success text-white",
                      status === "current" && "bg-kumo-brand text-white",
                      status === "upcoming" &&
                        "text-kumo-subtle ring ring-kumo-line",
                    )}
                  >
                    {status === "complete" ? (
                      <CheckIcon size={10} weight="bold" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      status === "upcoming"
                        ? "text-kumo-subtle"
                        : "text-kumo-default",
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      }
    />
  );
}

export function CardHeaderTabsStepper() {
  const stepper = useStepper(STEPS.length);
  return (
    <LayerCard>
      <LayerCard.Secondary className="p-0">
        <ol className="flex w-full">
          {STEPS.map((label, index) => {
            const status = getStatus(index, stepper.current);
            return (
              <li
                key={label}
                aria-current={status === "current" ? "step" : undefined}
                className={cn(
                  "flex flex-1 items-center gap-2 border-b-2 px-4 py-4 text-sm transition-colors",
                  status === "complete" &&
                    "border-kumo-success text-kumo-default",
                  status === "current" &&
                    "border-kumo-brand font-medium text-kumo-strong",
                  status === "upcoming" &&
                    "border-transparent text-kumo-subtle",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                    status === "complete" && "bg-kumo-success text-white",
                    status === "current" && "bg-kumo-brand text-white",
                    status === "upcoming" && "bg-kumo-fill",
                  )}
                >
                  {status === "complete" ? (
                    <CheckIcon size={12} weight="bold" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="truncate">{label}</span>
              </li>
            );
          })}
        </ol>
      </LayerCard.Secondary>
      <LayerCard.Primary className="gap-4 p-6">
        <StepBody stepper={stepper} />
        <StepFooter stepper={stepper} />
      </LayerCard.Primary>
    </LayerCard>
  );
}

function getReachedStatus(index: number, stepper: Stepper): StepStatus {
  if (index === stepper.current) return "current";
  return index < stepper.furthest ? "complete" : "upcoming";
}

function TabStepLabel({
  index,
  label,
  status,
}: {
  index: number;
  label: string;
  status: StepStatus;
}) {
  return (
    <span className="flex items-center gap-2">
      {status === "complete" ? (
        <CheckCircleIcon
          size={20}
          weight="fill"
          aria-label="Completed"
          className="text-kumo-success"
        />
      ) : (
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-full text-xs font-semibold",
            status === "current"
              ? "bg-kumo-brand text-white"
              : "text-kumo-subtle ring ring-kumo-line",
          )}
        >
          {index + 1}
        </span>
      )}
      {label}
    </span>
  );
}

export function KumoTabsStepper() {
  const stepper = useStepper(STEPS.length);
  const activeIndex = Math.min(stepper.current, STEPS.length - 1);
  return (
    <LayerCard>
      <LayerCard.Secondary>
        <Tabs
          variant="underline"
          className="w-full"
          value={String(activeIndex)}
          onValueChange={(value) => stepper.goTo(Number(value))}
          tabs={STEPS.map((label, index) => {
            const status = getReachedStatus(index, stepper);
            return {
              value: String(index),
              label: (
                <TabStepLabel index={index} label={label} status={status} />
              ),
              className: cn(
                index > stepper.furthest &&
                  "cursor-not-allowed hover:bg-transparent hover:text-kumo-subtle",
              ),
            };
          })}
        />
      </LayerCard.Secondary>
      <LayerCard.Primary className="gap-4 p-6">
        <div className="flex items-center justify-between">
          <Text variant="heading" as="h3">
            {stepper.isDone ? "Summary" : STEPS[stepper.current]}
          </Text>
          <Text variant="secondary" size="sm">
            {stepper.isDone
              ? "All steps completed"
              : `Step ${stepper.current + 1} of ${STEPS.length}`}
          </Text>
        </div>
        <StepBody stepper={stepper} />
        <StepFooter stepper={stepper} />
      </LayerCard.Primary>
    </LayerCard>
  );
}
