import { LayerCard, Button } from "@cloudflare/kumo";
import { ArrowRightIcon } from "@phosphor-icons/react";

export function LayerCardDemo() {
  return (
    <LayerCard>
      <LayerCard.Secondary className="flex items-center justify-between">
        <div>Next Steps</div>
        <Button
          variant="ghost"
          size="sm"
          shape="square"
          aria-label="Go to next steps"
        >
          <ArrowRightIcon size={16} />
        </Button>
      </LayerCard.Secondary>

      <LayerCard.Primary>Get started with Kumo</LayerCard.Primary>
    </LayerCard>
  );
}

export function LayerCardBasicDemo() {
  return (
    <LayerCard className="w-[250px]">
      <LayerCard.Secondary>Getting Started</LayerCard.Secondary>
      <LayerCard.Primary>
        <p className="text-sm text-kumo-subtle">
          Quick start guide for new users
        </p>
      </LayerCard.Primary>
    </LayerCard>
  );
}

export function LayerCardMultipleDemo() {
  return (
    <div className="flex gap-4">
      <LayerCard className="w-[200px]">
        <LayerCard.Secondary>Components</LayerCard.Secondary>
        <LayerCard.Primary>
          <p className="text-sm">Browse all components</p>
        </LayerCard.Primary>
      </LayerCard>
      <LayerCard className="w-[200px]">
        <LayerCard.Secondary>Examples</LayerCard.Secondary>
        <LayerCard.Primary>
          <p className="text-sm">View code examples</p>
        </LayerCard.Primary>
      </LayerCard>
    </div>
  );
}
