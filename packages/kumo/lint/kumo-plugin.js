import { noTailwindDarkVariantRule } from "./no-tailwind-dark-variant.js";
import { noPrimitiveColorsRule } from "./no-primitive-colors.js";
import { enforceVariantStandardRule } from "./enforce-variant-standard.js";
import { noDeprecatedPropsRule } from "./no-deprecated-props.js";
import { noCrossPackageImportsRule } from "./no-cross-package-imports.js";

const plugin = {
  meta: {
    name: "kumo",
  },
  rules: {
    "no-tailwind-dark-variant": noTailwindDarkVariantRule,
    "no-primitive-colors": noPrimitiveColorsRule,
    "enforce-variant-standard": enforceVariantStandardRule,
    "no-deprecated-props": noDeprecatedPropsRule,
    "no-cross-package-imports": noCrossPackageImportsRule,
  },
};

export default plugin;
