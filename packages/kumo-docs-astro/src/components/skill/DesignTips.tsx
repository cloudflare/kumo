import { ShikiProvider } from "@cloudflare/kumo/code";
import { Text } from "@cloudflare/kumo";
import { isValidElement } from "react";
import { CodeExample, designTips } from "./design-tips";
import { DesignTip } from "./DesignTip";

export interface RenderedDesignTip {
  title: string;
  description?: string;
}

interface DesignTipsProps {
  renderedTips: RenderedDesignTip[];
}

interface MarkdownProps {
  html: string;
}

function Markdown({ html }: MarkdownProps) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function DesignTips({ renderedTips }: DesignTipsProps) {
  return (
    <ShikiProvider engine="javascript" languages={["tsx"]}>
      {designTips.map((tip, tipIndex) => {
        const renderedTip = renderedTips[tipIndex];
        const orientation = tip.examples.some(
          (example) =>
            isValidElement(example.jsx) && example.jsx.type === CodeExample,
        )
          ? "vertical"
          : "horizontal";

        return (
          <DesignTip id={tip.id} key={tip.id}>
            <DesignTip.Title>
              <div className="flex gap-1.5">
                <Text
                  variant="secondary"
                  DANGEROUS_className="text-2xl font-semibold"
                  as="span"
                >
                  {tipIndex + 1}.
                </Text>
                <Markdown html={renderedTip.title} />
              </div>
            </DesignTip.Title>
            {renderedTip.description ? (
              <DesignTip.Description>
                <Markdown html={renderedTip.description} />
              </DesignTip.Description>
            ) : null}
            <DesignTip.Examples orientation={orientation}>
              {tip.examples.map((example, exampleIndex) => (
                <DesignTip.Example
                  key={`${example.variant}-${exampleIndex}`}
                  variant={example.variant}
                >
                  {example.jsx}
                </DesignTip.Example>
              ))}
            </DesignTip.Examples>
          </DesignTip>
        );
      })}
    </ShikiProvider>
  );
}
