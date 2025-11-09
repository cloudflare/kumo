import type { FC, PropsWithChildren } from "react";
import { cn } from "../utils";

type LayerCardProps = PropsWithChildren<{ className?: string }>;

function LayerCardRoot({
    children,
    className
}: LayerCardProps) {
    return (
        <div className={cn(
            'w-full text-base ring ring-neutral-950/10 dark:ring-neutral-800 rounded-lg bg-neutral-25 dark:bg-surface flex flex-col',
            className
        )}>
            {children}
        </div>
    )
}

function LayerCardSecondary({
    children,
    className
}: LayerCardProps) {
    return (
        <div className={cn('p-2 gap-2 flex items-center', className)}>
            {children}
        </div>
    )
}

function LayerCardPrimary({
    children,
    className
}: LayerCardProps) {
    return (
        <div className={cn(
            'flex flex-col p-4 pr-3 gap-2 rounded-lg ring ring-neutral-200 dark:ring-neutral-800 bg-surface dark:bg-neutral-950 text-inherit no-underline',
            className
        )}>
            {children}
        </div>
    )
}

type LayerCardComponent = FC<LayerCardProps> & {
    Primary: FC<LayerCardProps>;
    Secondary: FC<LayerCardProps>;
};

const LayerCard = Object.assign(LayerCardRoot, {
    Primary: LayerCardPrimary,
    Secondary: LayerCardSecondary
}) as LayerCardComponent;

export { LayerCard };