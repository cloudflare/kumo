import { cn } from "../utils";

export enum BannerVariant {
    DEFAULT,
    ALERT,
    ERROR
}

const DEFAULT_CLASS = "rounded-lg w-full bg-blue-500/20 px-4 py-1.5 border border-blue-500 dark:border-blue-700 text-blue-800 dark:text-blue-400 flex items-center gap-2 selection:bg-blue-300 dark:selection:bg-blue-900"
const ALERT_CLASS = "rounded-lg w-full bg-yellow-500/20 px-4 py-1.5 border border-yellow-500 dark:border-yellow-700 text-yellow-800 dark:text-yellow-400 flex items-center gap-2 selection:bg-yellow-300 dark:selection:bg-yellow-900"
const ERROR_CLASS = "rounded-lg w-full bg-red-500/20 px-4 py-1.5 border border-red-500 dark:border-red-700 text-red-800 dark:text-red-400 flex items-center gap-2 selection:bg-red-300 dark:selection:bg-red-900"

export function Banner({
    icon,
    text,
    variant = BannerVariant.DEFAULT,
    className,
}: {
    icon?: React.ReactNode;
    text: string;
    variant?: BannerVariant;
    className?: string;
}) {
    return (
        <div className={cn(
            "flex items-center gap-2 text-base", 
            variant === BannerVariant.DEFAULT && DEFAULT_CLASS, 
            variant === BannerVariant.ALERT && ALERT_CLASS, 
            variant === BannerVariant.ERROR && ERROR_CLASS,
            className
        )}>
            {icon}
            <p>{text}</p>
        </div>
    )
}