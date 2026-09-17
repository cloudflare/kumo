/**
 * Type-level specification for InlineCopyText's conditional value prop.
 *
 * String children provide the copied value by default. Every other React node
 * must be paired with an explicit string value.
 */

import { InlineCopyText, type InlineCopyTextProps } from "./inline-copy-text";

const stringChildren = <InlineCopyText>namespace-id</InlineCopyText>;
const stringChildrenWithValue = (
  <InlineCopyText value="complete-resource-id">visible-id</InlineCopyText>
);
const richChildren = (
  <InlineCopyText value="complete-resource-id">
    <span>Visible resource</span>
  </InlineCopyText>
);
const textProps = (
  <InlineCopyText variant="body" size="lg" bold truncate={false} as="strong">
    namespace-id
  </InlineCopyText>
);

const stringProps: InlineCopyTextProps = { children: "namespace-id" };
const richProps: InlineCopyTextProps = {
  children: <span>Visible resource</span>,
  value: "complete-resource-id",
};

const richChildrenWithoutValue = (
  // @ts-expect-error - non-string children require an explicit value.
  <InlineCopyText>
    <span>Visible resource</span>
  </InlineCopyText>
);

// @ts-expect-error - heading variants are not supported by InlineCopyText.
const headingVariant = <InlineCopyText variant="heading">Title</InlineCopyText>;

const deprecatedHeadingVariant = (
  // @ts-expect-error - deprecated heading variants are also not supported.
  <InlineCopyText variant="heading1" as="h1">
    Title
  </InlineCopyText>
);

export const __typeSpec = {
  stringChildren,
  stringChildrenWithValue,
  richChildren,
  textProps,
  stringProps,
  richProps,
  richChildrenWithoutValue,
  headingVariant,
  deprecatedHeadingVariant,
};
