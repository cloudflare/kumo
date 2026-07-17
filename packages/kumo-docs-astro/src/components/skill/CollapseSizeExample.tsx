import { Button, cn, LayerCard, Text } from "@cloudflare/kumo";
import { motion } from "motion/react";
import { useState } from "react";

interface CollapseSizeExampleProps {
  preserveContentSize?: boolean;
}

export function CollapseSizeExample({
  preserveContentSize = false,
}: CollapseSizeExampleProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className={cn("grid w-full gap-4")}>
      <Button
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        variant="secondary"
      >
        {open ? "Close" : "Open"}
      </Button>
      <motion.div
        animate={{ width: open ? 256 : 0 }}
        className={cn("overflow-hidden rounded-lg ring ring-kumo-line")}
        initial={false}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <LayerCard
          className={cn(
            "grid gap-1 p-4 ring-0",
            preserveContentSize ? "w-64" : "w-full min-w-0",
          )}
        >
          <Text as="h3" variant="heading3">
            Web Analytics
          </Text>
          <Text variant="secondary">
            Measure traffic without changing your code.
          </Text>
        </LayerCard>
      </motion.div>
    </div>
  );
}
