import { type PropsWithChildren, useContext } from "react";
import * as React from "react";
import { cn } from "../../utils/cn";
import {
  Input as InputExternal,
  type InputProps,
  inputVariants,
} from "./input";
import { type ButtonProps, Button as ButtonExternal } from "../button/button";

export const KUMO_INPUT_GROUP_VARIANTS = {
  focusMode: {
    container: {
      classes: "",
      description: "Focus indicator on container (default behavior)",
    },
    individual: {
      classes: "",
      description: "Focus indicators on individual elements",
    },
  },
} as const;

export const KUMO_INPUT_GROUP_DEFAULT_VARIANTS = {
  focusMode: "container",
} as const;

export type KumoInputGroupFocusMode =
  keyof typeof KUMO_INPUT_GROUP_VARIANTS.focusMode;

export interface KumoInputGroupVariantsProps {
  focusMode?: KumoInputGroupFocusMode;
}

interface InputGroupRootProps extends KumoInputGroupVariantsProps {
  className?: string;
  size?: "xs" | "sm" | "base" | "lg" | undefined;
}

interface InputGroupContextValue extends InputGroupRootProps {
  inputId: string;
  descriptionId: string;
}

const InputGroupContext = React.createContext<InputGroupContextValue | null>(
  null,
);

function Root({
  size,
  children,
  className,
  focusMode = KUMO_INPUT_GROUP_DEFAULT_VARIANTS.focusMode,
}: PropsWithChildren<InputGroupRootProps>) {
  const inputId = React.useId();
  const descriptionId = React.useId();
  const contextValue = React.useMemo(
    () => ({ size, inputId, descriptionId, focusMode }),
    [size, inputId, descriptionId, focusMode],
  );

  const isIndividualFocus = focusMode === "individual";

  return (
    <InputGroupContext.Provider value={contextValue}>
      <div
        className={cn(
          inputVariants({ size, parentFocusIndicator: !isIndividualFocus }),
          "flex w-full gap-0 border-0 px-0",
          isIndividualFocus
            ? "overflow-visible"
            : "overflow-hidden shadow-xs ring ring-kumo-line focus-within:ring-kumo-ring",
          className,
        )}
      >
        {children}
      </div>
    </InputGroupContext.Provider>
  );
}

function Label({ children }: PropsWithChildren<{}>) {
  const context = useContext(InputGroupContext);
  const isIndividualFocus = context?.focusMode === "individual";

  return (
    <label
      htmlFor={context?.inputId}
      className={cn(
        "flex h-full items-center p-0 px-2 text-kumo-subtle",
        isIndividualFocus &&
          "first:rounded-l-[inherit] last:rounded-r-[inherit]",
      )}
    >
      {children}
    </label>
  );
}

function Input(props: InputProps) {
  const context = useContext(InputGroupContext);
  const isIndividualFocus = context?.focusMode === "individual";

  return (
    <InputExternal
      id={context?.inputId}
      aria-describedby={context?.descriptionId}
      size={context?.size}
      {...props}
      className={cn(
        "flex h-full items-center rounded-none border-0 bg-kumo-base font-sans",
        "grow px-2",
        isIndividualFocus
          ? "relative ring ring-kumo-line first:rounded-l-[inherit] last:rounded-r-[inherit] focus:z-10 focus:outline"
          : "focus:border-kumo-fill",
        props.className,
      )}
    />
  );
}

function Description({ children }: PropsWithChildren<{}>) {
  const context = useContext(InputGroupContext);
  const isIndividualFocus = context?.focusMode === "individual";

  return (
    <span
      id={context?.descriptionId}
      className={cn(
        "flex h-full items-center p-0 px-2 text-kumo-subtle",
        isIndividualFocus &&
          "first:rounded-l-[inherit] last:rounded-r-[inherit]",
      )}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  className,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const context = useContext(InputGroupContext);
  const isIndividualFocus = context?.focusMode === "individual";

  return (
    <ButtonExternal
      {...props}
      size={context?.size}
      className={cn(
        "h-full! rounded-none disabled:bg-kumo-overlay disabled:text-kumo-inactive!",
        isIndividualFocus &&
          "relative ring ring-kumo-line first:rounded-l-[inherit] last:rounded-r-[inherit] focus:z-10 focus:outline",
        className,
      )}
    >
      {children}
    </ButtonExternal>
  );
}

export const InputGroup = Object.assign(Root, {
  Label,
  Input,
  Button,
  Description,
});
