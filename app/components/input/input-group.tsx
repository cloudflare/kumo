import { type PropsWithChildren, useContext } from 'react';
import * as React from 'react';
import { cn } from '../utils';
import { Input as InputExternal, type InputProps, inputVariants } from './input';
import { type ButtonProps, Button as ButtonExternal } from '../button/button';

interface InputGroupRootProps {
  className?: string;
  size?: "xs" | "sm" | "base" | "lg" | undefined;
}

const InputGroupContext = React.createContext<InputGroupRootProps | null>(null);

function Root({
  size,
  children,
  className
}: PropsWithChildren<InputGroupRootProps>) {
  const contextValue = React.useMemo(() => ({ size }), [size]);

  return (
    <InputGroupContext.Provider value={contextValue}>
      <div
        className={cn(
          inputVariants({ size, parentFocusIndicator: true }),
          'border-0 flex gap-0 overflow-hidden px-0 w-full ring ring-neutral-950/10 shadow-xs focus-within:ring-active dark:ring-neutral-800',
          className
        )}
      >
        {children}
      </div>
    </InputGroupContext.Provider>
  );
}

function Label({ children }: PropsWithChildren<{}>) {
  // Using standard DOM API for direct access without React context
  // This approach allows us to maintain simplicity by avoiding unnecessary state management
  // while still providing the expected UX behavior when clicking on labels
  const onLabelClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rootElement = event.currentTarget.parentElement;

    if (rootElement) {
      const inputElement = rootElement.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
    }
  };

  return (
    <div
      className="flex p-0 items-center text-muted px-2 h-full"
      onClick={onLabelClick}
    >
      {children}
    </div>
  );
}

function Input(props: InputProps) {
  const context = useContext(InputGroupContext);

  return (
    <InputExternal
      size={context?.size}
      {...props}
      className={cn(
        'border-0 h-full rounded-none flex items-center first:pl-2 last:pr-2 bg-surface font-sans',
        'focus:border-color',
        'grow-1 px-0',
        props.className
      )}
    />
  );
}

function Button({ children, ...props }: PropsWithChildren<ButtonProps>) {
  const context = useContext(InputGroupContext);

  return (
    <ButtonExternal
      {...props}
      size={context?.size}
      className={
        'rounded-none !h-full disabled:bg-surface-secondary disabled:!text-neutral-400'
      }
    >
      {children}
    </ButtonExternal>
  );
}

export const InputGroup = Object.assign(Root, { Label, Input, Button });
