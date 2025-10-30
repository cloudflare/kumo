import { inputVariants } from './input';
import { cn } from '../utils';
import { useCallback } from 'react';
import * as React from 'react';

export const InputArea = React.forwardRef<HTMLTextAreaElement, InputAreaProps>(
  (props, ref) => {
    const {
      children,
      className,
      onValueChange,
      size = 'base',
      variant = 'default',
      onChange,
      ...inputProps
    } = props;

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event);
        onValueChange?.(event.target.value);
      },
      [onChange, onValueChange]
    );

    return (
      <textarea
        ref={ref}
        className={cn(
          inputVariants({ size, variant, focusIndicator: true }),
          'h-auto py-2', // Input variant always come with size, but it does not apply for textarea
          className
        )}
        onChange={handleChange}
        {...inputProps}
      />
    );
  }
);

InputArea.displayName = 'InputArea';

export type InputAreaProps = {
  onValueChange?: (value: string) => void;
  variant?: "default" | "error";
  size?: "xs" | "sm" | "base" | "lg";

  // Then other custom props
  children?: React.ReactNode;
  className?: string;

  // Finally, spread the native input props (least important)
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;
