import { MetricCard, MetricCardGroup, Badge } from "@cloudflare/kumo";
import { QuestionIcon } from "@phosphor-icons/react";

/**
 * Deterministic sparkline generator using sin/cos for natural-looking oscillations.
 * Produces smooth, realistic time-series data with a linear trend + wave-like noise.
 */
function buildSparkline(
  base: number,
  end: number,
  points = 24,
  seed = 0,
  noiseAmp = 0.12,
): number[] {
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const trend = base + (end - base) * t;
    const noise =
      Math.sin(seed * 3.7 + i * 1.3) * noiseAmp * base +
      Math.cos(seed * 2.1 + i * 0.7) * noiseAmp * 0.5 * base;
    return Math.max(0, trend + noise);
  });
}

export function MetricCardGroupDemo() {
  return (
    <MetricCardGroup title="Activity">
      <MetricCard
        label="Web traffic"
        value="2.4M"
        trend={{ direction: "up", label: "12%" }}
        sparkline={{ data: buildSparkline(1.8, 2.4, 24, 1, 0.08) }}
      />
      <MetricCard
        label="Total bandwidth"
        value="1.8"
        unit="TB"
        trend={{ direction: "up", label: "9%" }}
        sparkline={{ data: buildSparkline(1.2, 1.8, 24, 2, 0.07) }}
      />
      <MetricCard
        label="Cache rate"
        value="92.1"
        unit="%"
        trend={{ direction: "up", label: "3.2%" }}
      />
      <MetricCard
        label="Client errors"
        value="4.8k"
        trend={{ direction: "down", label: "8%", lessIsBetter: true }}
      />
    </MetricCardGroup>
  );
}

export function MetricCardHorizontalGroupDemo() {
  return (
    <MetricCardGroup title="Performance">
      <MetricCard
        label="CPU time P90"
        value="3.2"
        unit="ms"
        trend={{ direction: "down", label: "8%", lessIsBetter: true }}
        sparkline={{ data: buildSparkline(4.1, 3.2, 24, 5, 0.08) }}
      />
      <MetricCard
        label="Workers errors"
        value="0"
        trend={{ direction: "neutral", label: "0.0%", isNeutral: true }}
        sparkline={{ data: [0, 0], theme: "danger" }}
      />
      <MetricCard
        label="Workers invocations"
        value="1.2M"
        trend={{ direction: "up", label: "12%" }}
      />
    </MetricCardGroup>
  );
}

export function MetricCardGroupVerticalDemo() {
  return (
    <div className="max-w-sm mx-auto">
      <MetricCardGroup title="Registrar" orientation="vertical">
        <MetricCard label="Active domains" value="142" />
        <MetricCard label="Expiring soon" value="3" />
        <MetricCard label="Pending transfers" value="2" />
      </MetricCardGroup>
    </div>
  );
}

export function MetricCardGroupWithoutTitleDemo() {
  return (
    <MetricCardGroup>
      <MetricCard
        label="Web traffic"
        value="2.4M"
        sparkline={{ data: buildSparkline(1.8, 2.4, 24, 7, 0.08) }}
      />
      <MetricCard
        label="Total bandwidth"
        value="842"
        unit="GB"
        sparkline={{ data: buildSparkline(620, 842, 24, 9, 0.07) }}
      />
      <MetricCard
        label="Workers invocations"
        value="1.2M"
      />
    </MetricCardGroup>
  );
}

export function MetricCardStatesDemo() {
  return (
    <MetricCardGroup title="Browser Rendering">
      <MetricCard label="Browser sessions" loading />
      <MetricCard label="Browser hours" error />
    </MetricCardGroup>
  );
}

export function MetricCardSparklineDemo() {
  return (
    <MetricCardGroup title="Performance">
      <MetricCard
        label="Cache rate"
        value="92.1"
        unit="%"
        trend={{ direction: "up", label: "3.2%" }}
        sparkline={{
          data: buildSparkline(88, 92.1, 24, 10, 0.05),
          theme: "success",
        }}
      />
      <MetricCard
        label="Client errors"
        value="4.8k"
        trend={{ direction: "down", label: "8%", lessIsBetter: true }}
        sparkline={{
          data: buildSparkline(6200, 4800, 24, 11, 0.12),
          theme: "danger",
        }}
      />
      <MetricCard
        label="CPU time P90"
        value="3.2"
        unit="ms"
        trend={{ direction: "down", label: "8%", lessIsBetter: true }}
        sparkline={{
          data: buildSparkline(4.1, 3.2, 24, 12, 0.08),
          theme: "neutral",
        }}
      />
      <MetricCard
        label="Uptime"
        value="99.99"
        unit="%"
        trend={{ direction: "neutral", label: "0.0%", isNeutral: true }}
        sparkline={{ data: [99.98, 99.98, 99.99, 99.99, 99.98, 99.99, 99.99, 99.99, 99.98, 99.99, 99.99, 99.99, 99.99, 99.98, 99.99, 99.99, 99.99, 99.99, 99.98, 99.99, 99.99, 99.99, 99.99, 99.99], yMin: 99.9 }}
      />
    </MetricCardGroup>
  );
}

export function MetricCardInteractiveDemo() {
  return (
    <MetricCardGroup title="Workers Overview">
      <MetricCard
        label="Workers invocations"
        value="1.2M"
        tooltip="Total invocations across all Workers"
        href="#"
      />
      <MetricCard
        label="CPU time P90"
        value="3.2"
        unit="ms"
        tooltip="90th percentile CPU time per invocation"
        tooltipIcon={QuestionIcon}
        href="#"
      />
      <MetricCard
        label="Workers errors"
        value="842"
        tooltip="Failed invocations returning non-2xx status"
        onClick={() => {}}
      />
    </MetricCardGroup>
  );
}

export function MetricCardBadgeValueDemo() {
  return (
    <MetricCardGroup title="System Status">
      <MetricCard
        label="API"
        value={<Badge variant="success">Operational</Badge>}
      />
      <MetricCard
        label="Database"
        value={<Badge variant="warning">Degraded</Badge>}
      />
      <MetricCard label="Uptime" value="99.9" unit="%" />
    </MetricCardGroup>
  );
}
