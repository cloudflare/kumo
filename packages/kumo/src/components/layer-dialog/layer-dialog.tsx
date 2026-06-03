import { Dialog as DialogBase } from "@base-ui/react/dialog";
import { LayerCard } from "../layer-card";
import { cn } from "../../utils";
import { type LayerCardSectionProps } from "../layer-card/layer-card";
import { PropsWithChildren } from "react";
import { Text } from "../text";

// ============================================================================
// LayerDialog Root
// ============================================================================

/**
 * Root component for LayerDialog. Manages the dialog's open/close state.
 *
 * @example
 * ```tsx
 * <LayerDialog.Root>
 *   <LayerDialog.Trigger>Open</LayerDialog.Trigger>
 *   <LayerDialog.Content>
 *     <LayerDialog.Body>
 *       <LayerDialog.Title>Title</LayerDialog.Title>
 *       <LayerDialog.Description>Description</LayerDialog.Description>
 *     </LayerDialog.Body>
 *     <LayerDialog.Footer>
 *       <LayerDialog.Close>Close</LayerDialog.Close>
 *     </LayerDialog.Footer>
 *   </LayerDialog.Content>
 * </LayerDialog.Root>
 * ```
 */
const LayerDialogRoot = (props: DialogBase.Root.Props) => {
  return <DialogBase.Root {...props} />;
};

LayerDialogRoot.displayName = "LayerDialog.Root";

// ============================================================================
// LayerDialog Content
// ============================================================================

/**
 * The content panel of the LayerDialog. Renders inside a portal with a backdrop
 * and positions the dialog centered on screen.
 *
 * @example
 * ```tsx
 * <LayerDialog.Content>
 *   <LayerDialog.Body>
 *     <LayerDialog.Title>Confirm</LayerDialog.Title>
 *     <LayerDialog.Description>Are you sure?</LayerDialog.Description>
 *   </LayerDialog.Body>
 *   <LayerDialog.Footer>
 *     <LayerDialog.Close>Cancel</LayerDialog.Close>
 *   </LayerDialog.Footer>
 * </LayerDialog.Content>
 * ```
 */
const LayerDialogContent = ({ children, ...props }: DialogBase.Popup.Props) => {
  return (
    <DialogBase.Portal>
      <DialogBase.Backdrop className="fixed inset-0 bg-kumo-recessed opacity-80 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DialogBase.Popup
        {...props}
        className={cn(
          "fixed top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2",
          "max-w-md p-0 m-0",
          props.className,
        )}
      >
        <LayerCard className="shadow p-1.5 bg-kumo-canvas">
          {children}
        </LayerCard>
      </DialogBase.Popup>
    </DialogBase.Portal>
  );
};

LayerDialogContent.displayName = "LayerDialog.Content";

// ============================================================================
// LayerDialog Body
// ============================================================================

/** Primary content area of the LayerDialog. */
const LayerDialogBody = (props: LayerCardSectionProps) => {
  return (
    <LayerCard.Primary {...props} className={cn("p-6", props.className)} />
  );
};

LayerDialogBody.displayName = "LayerDialog.Body";

// ============================================================================
// LayerDialog Footer
// ============================================================================

/** Footer area for actions (e.g. buttons) at the bottom of the LayerDialog. */
const LayerDialogFooter = (props: LayerCardSectionProps) => {
  return (
    <LayerCard.Secondary
      {...props}
      className={cn("px-0 pt-4 pb-3", props.className)}
    />
  );
};

LayerDialogFooter.displayName = "LayerDialog.Footer";

// ============================================================================
// LayerDialog Title
// ============================================================================

/** Dialog title rendered as a heading. */
const LayerDialogTitle = ({ children }: PropsWithChildren) => {
  return (
    <Text as="h1" variant="heading3">
      {children}
    </Text>
  );
};

LayerDialogTitle.displayName = "LayerDialog.Title";

// ============================================================================
// LayerDialog Description
// ============================================================================

/** Descriptive text for the dialog content. */
const LayerDialogDescription = ({ children }: PropsWithChildren) => {
  return (
    <Text as="p" variant="secondary">
      {children}
    </Text>
  );
};

LayerDialogDescription.displayName = "LayerDialog.Description";

// ============================================================================
// LayerDialog Separator
// ============================================================================

/** Horizontal divider to separate sections within the dialog body. */
const LayerDialogSeparator = () => {
  return <hr className="-mx-6 border-kumo-line my-4" />;
};

LayerDialogSeparator.displayName = "LayerDialog.Separator";

// ============================================================================
// Compound Component Export
// ============================================================================

const LayerDialog = Object.assign(LayerDialogRoot, {
  Trigger: DialogBase.Trigger,
  Close: DialogBase.Close,
  Content: LayerDialogContent,
  Body: LayerDialogBody,
  Footer: LayerDialogFooter,
  Title: LayerDialogTitle,
  Description: LayerDialogDescription,
  Separator: LayerDialogSeparator,
});

export {
  LayerDialog,
  LayerDialogRoot,
  LayerDialogContent,
  LayerDialogBody,
  LayerDialogFooter,
  LayerDialogTitle,
  LayerDialogDescription,
  LayerDialogSeparator,
};
