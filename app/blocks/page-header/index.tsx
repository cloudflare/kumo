import { Tabs, type TabsItem } from "~/components/tabs/tabs";
import Breadcrumbs, { type BreadcrumbItem } from "../breadcrumbs";
import { cn } from "~/components/utils";

export function PageHeader({ breadcrumbs, tabs, defaultTab, onValueChange, className, children }: { breadcrumbs: BreadcrumbItem[]; tabs?: TabsItem[]; defaultTab?: string, onValueChange?: (value: string) => void, className?: string, children?: React.ReactNode }) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="border-b border-neutral-250 dark:border-neutral-800">
                <Breadcrumbs items={breadcrumbs} />
            </div>

            { tabs && (
                <div className="flex items-center justify-between w-full border-b border-neutral-250 dark:border-neutral-800 pb-3 pt-1 pl-3">
                    <Tabs
                        tabs={tabs}
                        selectedValue={defaultTab}
                        onValueChange={(nextValue) => {
                            const stringValue = String(nextValue);
                            onValueChange?.(stringValue);
                        }}
                    />

                    <div className="flex items-center gap-2">
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}