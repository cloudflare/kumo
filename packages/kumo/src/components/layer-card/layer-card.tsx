import type { FC, PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

/** LayerCard variant definitions (currently empty, reserved for future additions). */
export const KUMO_LAYER_CARD_VARIANTS = {
  // LayerCard currently has no variant options but structure is ready for future additions
} as const;

export const KUMO_LAYER_CARD_DEFAULT_VARIANTS = {} as const;

// Derived types from KUMO_LAYER_CARD_VARIANTS
export interface KumoLayerCardVariantsProps {}

export function layerCardVariants(_props: KumoLayerCardVariantsProps = {}) {
  return cn(
    // Base styles
    "flex w-full flex-col overflow-hidden rounded-lg bg-kumo-elevated text-base ring ring-kumo-line",
  );
}

/**
 * LayerCard component props.
 *
 * @example
 * ```tsx
 * <LayerCard>
 *   <LayerCard.Secondary>Next Steps</LayerCard.Secondary>
 *   <LayerCard.Primary>Get started with Kumo</LayerCard.Primary>
 * </LayerCard>
 * ```
 */
export type LayerCardProps = PropsWithChildren<
  KumoLayerCardVariantsProps & {
    /** Additional CSS classes merged via `cn()`. */
    className?: string;
  }
>;

/**
 * Elevated card with primary/secondary content layers for dashboard widgets.
 *
 * @example
 * ```tsx
 * <LayerCard>
 *   <LayerCard.Secondary>Getting Started</LayerCard.Secondary>
 *   <LayerCard.Primary>Quick start guide</LayerCard.Primary>
 * </LayerCard>
 * ```
 */
function LayerCardRoot({ children, className }: LayerCardProps) {
  return <div className={cn(layerCardVariants(), className)}>{children}</div>;
}

function LayerCardSecondary({ children, className }: LayerCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 text-base font-medium text-kumo-strong",
        className,
      )}
    >
      {children}
    </div>
  );
}

function LayerCardPrimary({ children, className }: LayerCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 overflow-hidden rounded-lg bg-kumo-base p-4 pr-3 text-inherit no-underline ring ring-kumo-fill",
        className,
      )}
    >
      {children}
    </div>
  );
}

type LayerCardComponent = FC<LayerCardProps> & {
  Primary: FC<LayerCardProps>;
  Secondary: FC<LayerCardProps>;
};

const LayerCard = Object.assign(LayerCardRoot, {
  Primary: LayerCardPrimary,
  Secondary: LayerCardSecondary,
}) as LayerCardComponent;

export { LayerCard };
