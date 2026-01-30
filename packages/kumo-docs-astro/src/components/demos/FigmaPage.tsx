import { PencilRulerIcon } from "@phosphor-icons/react";
import { Empty, Button } from "@cloudflare/kumo";

export function FigmaPage() {
  return (
    <div className="p-8">
      <Empty
        icon={<PencilRulerIcon size={48} className="text-kumo-subtle" />}
        title="Figma Resources Coming Soon"
        description="We're preparing comprehensive Figma resources that mirror all Kumo components. Stay tuned for design files, component libraries, and design tokens."
        contents={
          <Button variant="outline" disabled>
            View Figma Library
          </Button>
        }
      />
    </div>
  );
}
