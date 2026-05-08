import { useState } from "react";
import { Badge, Input, LayerCard, Tabs } from "@cloudflare/kumo";

// ─── Data ────────────────────────────────────────────────────────────

const ORIGINS = [
	{ origin: "challenges.cloudflare.com", s2xx: 1, s4xx: 0, duration: "95.4ms" },
	{ origin: "Unknown", s2xx: 19, s4xx: 7, duration: "463.7ms" },
	{ origin: "api.example.com", s2xx: 42, s4xx: 3, duration: "128.1ms" },
];

type StatusFilter = "all" | "2xx" | "3xx" | "4xx" | "5xx";

// ─── Mockup: Segmented filter + search ───────────────────────────────

/** Subrequests card with inline filter toolbar inside Primary. */
export function LayerCardFilterSubrequestsDemo() {
	const [filter, setFilter] = useState<StatusFilter>("all");
	const [search, setSearch] = useState("");

	const filtered = ORIGINS.filter((o) => {
		if (filter === "2xx" && o.s2xx === 0) return false;
		if (filter === "4xx" && o.s4xx === 0) return false;
		if (search && !o.origin.toLowerCase().includes(search.toLowerCase())) return false;
		return true;
	});

	return (
		<LayerCard className="w-full max-w-[540px]">
			<LayerCard.Secondary>Subrequests</LayerCard.Secondary>

			<LayerCard.Primary>
				{/* Toolbar: tabs + search on one line */}
				<div className="mb-2 flex items-center gap-3">
					<Input
						size="sm"
						placeholder="Filter origins…"
						aria-label="Filter origins"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="min-w-0 flex-1"
					/>
					<Tabs
						variant="segmented"
						size="sm"
						className="shrink-0"
						tabs={[
							{ value: "all", label: "All" },
							{ value: "2xx", label: "2xx" },
							{ value: "3xx", label: "3xx" },
							{ value: "4xx", label: "4xx" },
							{ value: "5xx", label: "5xx" },
						]}
						value={filter}
						onValueChange={(v) => setFilter(v as StatusFilter)}
					/>
				</div>

				{/* Custom lightweight table — no banding, uniform bg */}
				<div className="-mx-1 text-sm">
					{/* Header */}
					<div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-kumo-fill px-1 pb-2 text-xs font-medium text-kumo-subtle">
						<span>Origin</span>
						<span className="w-28 text-right">Requests</span>
						<span className="w-20 text-right">Duration</span>
					</div>

					{/* Rows */}
					{filtered.map((row, i) => (
						<div
							key={row.origin}
							className={`grid grid-cols-[1fr_auto_auto] items-center gap-x-4 px-1 py-2.5 ${i < filtered.length - 1 ? "border-b border-kumo-hairline" : ""}`}
						>
							<span className="truncate font-medium text-kumo-default">{row.origin}</span>
							<div className="flex w-28 items-center justify-end gap-1.5">
								{row.s2xx > 0 && <Badge variant="success">{`2xx ${row.s2xx}`}</Badge>}
								{row.s4xx > 0 && <Badge variant="error">{`4xx ${row.s4xx}`}</Badge>}
							</div>
							<span className="w-20 text-right text-kumo-subtle">{row.duration}</span>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="-mx-1 border-t border-kumo-fill pt-2 text-xs text-kumo-subtle">
					Showing {filtered.length} of {ORIGINS.length}
				</div>
			</LayerCard.Primary>
		</LayerCard>
	);
}
