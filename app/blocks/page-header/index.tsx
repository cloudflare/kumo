import { Tabs } from "~/components/tabs/tabs";
import Breadcrumbs, { type BreadcrumbItem } from "../breadcrumbs";

export function PageHeader({ breadcrumbs, tabs, children }: { breadcrumbs: BreadcrumbItem[]; tabs?: { label: string; href: string }[]; children?: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="border-b border-neutral-250 dark:border-neutral-800">
                <Breadcrumbs items={breadcrumbs} />
            </div>

            <div className="flex items-center justify-between w-full border-b border-neutral-250 dark:border-neutral-800 pb-3 pt-1 pl-3">
                <Tabs 
                    links={tabs}
                    matchQueryKeys={["id"]}
                />
                <div className="flex items-center gap-2">
                    {children}
                </div>
            </div>
        </div>
    )
}