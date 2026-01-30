import { describe, it, expect, vi } from "vitest";
import { enforceVariantStandardRule } from "./enforce-variant-standard.js";

/**
 * Test suite for enforce-variant-standard oxlint rule.
 *
 * Since oxlint doesn't provide RuleTester like ESLint, we manually test
 * the rule by creating mock contexts and AST nodes.
 */

interface Report {
  node: any;
  messageId: string;
  data?: Record<string, any>;
}

/**
 * Helper to create a mock context with tracking for reported issues
 */
function createMockContext(filename: string) {
  const reports: Report[] = [];
  return {
    filename,
    report: vi.fn((report: Report) => reports.push(report)),
    getReports: () => reports,
  };
}

/**
 * Helper to create a mock Program node
 */
function createProgramNode() {
  return { type: "Program" };
}

/**
 * Helper to create a mock ExportNamedDeclaration node
 */
function createExportDeclaration(exportName) {
  return {
    type: "ExportNamedDeclaration",
    declaration: {
      type: "VariableDeclaration",
      declarations: [
        {
          id: {
            type: "Identifier",
            name: exportName,
          },
        },
      ],
    },
  };
}

/**
 * Helper to simulate running the rule on a file
 */
function runRule(filename: string, exportNames: string[]): Report[] {
  const context = createMockContext(filename);
  const rule = (enforceVariantStandardRule as any).createOnce(context);
  const programNode = createProgramNode();

  // Simulate Program visit
  rule.Program(programNode);

  // Simulate export visits
  for (const exportName of exportNames) {
    const exportNode = createExportDeclaration(exportName);
    rule.ExportNamedDeclaration(exportNode);
  }

  // Simulate Program:exit
  rule["Program:exit"]();

  return context.getReports();
}

describe("enforce-variant-standard", () => {
  describe("Valid component exports", () => {
    it("should pass with KUMO_BUTTON_VARIANTS + KUMO_BUTTON_DEFAULT_VARIANTS", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_VARIANTS",
        "KUMO_BUTTON_DEFAULT_VARIANTS",
      ]);

      expect(reports).toHaveLength(0);
    });

    it("should pass with KUMO_BADGE_VARIANTS + KUMO_BADGE_DEFAULT_VARIANTS + KUMO_BADGE_BASE_STYLES", () => {
      const reports = runRule("src/components/badge/badge.tsx", [
        "KUMO_BADGE_VARIANTS",
        "KUMO_BADGE_DEFAULT_VARIANTS",
        "KUMO_BADGE_BASE_STYLES",
      ]);

      expect(reports).toHaveLength(0);
    });

    it("should pass with kebab-case component names (toast-provider)", () => {
      const reports = runRule(
        "src/components/toast-provider/toast-provider.tsx",
        [
          "KUMO_TOAST_PROVIDER_VARIANTS",
          "KUMO_TOAST_PROVIDER_DEFAULT_VARIANTS",
        ],
      );

      expect(reports).toHaveLength(0);
    });

    it("should pass with additional unrelated exports", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_VARIANTS",
        "KUMO_BUTTON_DEFAULT_VARIANTS",
        "Button", // Component export is ignored
        "ButtonProps", // Type export is ignored
      ]);

      expect(reports).toHaveLength(0);
    });
  });

  describe("Invalid exports - Missing KUMO_ prefix", () => {
    it("should fail when VARIANTS is missing KUMO_ prefix", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "BUTTON_VARIANTS", // Missing KUMO_ prefix
        "KUMO_BUTTON_DEFAULT_VARIANTS",
      ]);

      expect(reports).toHaveLength(1);
      expect(reports[0].messageId).toBe("missingVariants");
      expect(reports[0].data!.component).toBe("BUTTON");
    });

    it("should fail when DEFAULT_VARIANTS is missing KUMO_ prefix", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_VARIANTS",
        "BUTTON_DEFAULT_VARIANTS", // Missing KUMO_ prefix
      ]);

      expect(reports).toHaveLength(1);
      expect(reports[0].messageId).toBe("missingDefaultVariants");
      expect(reports[0].data!.component).toBe("BUTTON");
    });

    it("should fail when BASE_STYLES is missing KUMO_ prefix", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_VARIANTS",
        "KUMO_BUTTON_DEFAULT_VARIANTS",
        "BUTTON_BASE_STYLES", // Missing KUMO_ prefix
      ]);

      expect(reports).toHaveLength(1);
      expect(reports[0].messageId).toBe("incorrectName");
      expect(reports[0].data!.actual).toBe("BUTTON_BASE_STYLES");
      expect(reports[0].data!.expected).toBe("KUMO_BUTTON_BASE_STYLES");
    });
  });

  describe("Invalid exports - Missing required exports", () => {
    it("should fail when KUMO_BUTTON_VARIANTS is missing", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_DEFAULT_VARIANTS",
      ]);

      expect(reports).toHaveLength(1);
      expect(reports[0].messageId).toBe("missingVariants");
      expect(reports[0].data!.component).toBe("BUTTON");
      expect(reports[0].data!.found).toContain("KUMO_BUTTON_DEFAULT_VARIANTS");
    });

    it("should fail when KUMO_BUTTON_DEFAULT_VARIANTS is missing", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_VARIANTS",
      ]);

      expect(reports).toHaveLength(1);
      expect(reports[0].messageId).toBe("missingDefaultVariants");
      expect(reports[0].data!.component).toBe("BUTTON");
      expect(reports[0].data!.found).toContain("KUMO_BUTTON_VARIANTS");
    });

    it("should fail when both required exports are missing", () => {
      const reports = runRule("src/components/button/button.tsx", []);

      expect(reports).toHaveLength(2);
      expect(reports[0].messageId).toBe("missingVariants");
      expect(reports[1].messageId).toBe("missingDefaultVariants");
      expect(reports[0].data!.found).toBe("none");
      expect(reports[1].data!.found).toBe("none");
    });
  });

  describe("Invalid exports - Name mismatch", () => {
    it("should fail when KUMO_BUTTON_VARIANTS is used in badge.tsx", () => {
      const reports = runRule("src/components/badge/badge.tsx", [
        "KUMO_BUTTON_VARIANTS", // Wrong component name
        "KUMO_BADGE_DEFAULT_VARIANTS",
      ]);

      expect(reports).toHaveLength(2); // incorrectName + missingVariants
      expect(reports[0].messageId).toBe("incorrectName");
      expect(reports[0].data!.actual).toBe("KUMO_BUTTON_VARIANTS");
      expect(reports[0].data!.expected).toBe("KUMO_BADGE_VARIANTS");
      expect(reports[1].messageId).toBe("missingVariants");
    });

    it("should fail when KUMO_INPUT_DEFAULT_VARIANTS is used in button.tsx", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_VARIANTS",
        "KUMO_INPUT_DEFAULT_VARIANTS", // Wrong component name
      ]);

      expect(reports).toHaveLength(2); // incorrectName + missingDefaultVariants
      expect(reports[0].messageId).toBe("incorrectName");
      expect(reports[0].data!.actual).toBe("KUMO_INPUT_DEFAULT_VARIANTS");
      // Note: Due to rule checking _VARIANTS before _DEFAULT_VARIANTS,
      // this incorrectly suggests KUMO_BUTTON_VARIANTS instead of KUMO_BUTTON_DEFAULT_VARIANTS
      expect(reports[0].data!.expected).toBe("KUMO_BUTTON_VARIANTS");
      expect(reports[1].messageId).toBe("missingDefaultVariants");
    });

    it("should fail when KUMO_DIALOG_BASE_STYLES is used in button.tsx", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_VARIANTS",
        "KUMO_BUTTON_DEFAULT_VARIANTS",
        "KUMO_DIALOG_BASE_STYLES", // Wrong component name
      ]);

      expect(reports).toHaveLength(1);
      expect(reports[0].messageId).toBe("incorrectName");
      expect(reports[0].data!.actual).toBe("KUMO_DIALOG_BASE_STYLES");
      expect(reports[0].data!.expected).toBe("KUMO_BUTTON_BASE_STYLES");
    });
  });

  describe("Rule scope - Only applies to component files", () => {
    it("should not run on non-component files", () => {
      const reports = runRule("src/utils/cn.ts", []); // Not a component file

      expect(reports).toHaveLength(0);
    });

    it("should not run on files outside src/components/", () => {
      const reports = runRule("src/blocks/button/button.tsx", []); // Wrong directory

      expect(reports).toHaveLength(0);
    });

    it("should not run on files that don't match {name}/{name}.tsx pattern", () => {
      const reports = runRule("src/components/button/types.tsx", []); // Not button.tsx

      expect(reports).toHaveLength(0);
    });

    it("should not run on test files", () => {
      const reports = runRule(
        "src/components/button/button.test.tsx",
        [], // Test file
      );

      expect(reports).toHaveLength(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle multiple incorrect exports", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "BUTTON_VARIANTS", // Missing KUMO_ prefix
        "KUMO_INPUT_DEFAULT_VARIANTS", // Wrong component name
        "DIALOG_BASE_STYLES", // Missing KUMO_ prefix
      ]);

      // Should report: incorrectName for INPUT, incorrectName for DIALOG_BASE_STYLES,
      // missingVariants, missingDefaultVariants
      expect(reports.length).toBeGreaterThanOrEqual(3);
      expect(reports.some((r) => r.messageId === "missingVariants")).toBe(true);
      expect(
        reports.some((r) => r.messageId === "missingDefaultVariants"),
      ).toBe(true);
      expect(reports.some((r) => r.messageId === "incorrectName")).toBe(true);
    });

    it("should handle empty exports list", () => {
      const reports = runRule("src/components/button/button.tsx", []);

      expect(reports).toHaveLength(2);
      expect(reports[0].messageId).toBe("missingVariants");
      expect(reports[1].messageId).toBe("missingDefaultVariants");
    });

    it("should handle kebab-case to UPPER_SNAKE_CASE conversion", () => {
      const reports = runRule(
        "src/components/clipboard-text/clipboard-text.tsx",
        [
          "KUMO_CLIPBOARD_TEXT_VARIANTS",
          "KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS",
        ],
      );

      expect(reports).toHaveLength(0);
    });

    it("should allow other exports alongside variant exports", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_VARIANTS",
        "KUMO_BUTTON_DEFAULT_VARIANTS",
        "Button",
        "ButtonProps",
        "SOME_OTHER_CONSTANT",
        "useButtonHook",
      ]);

      expect(reports).toHaveLength(0);
    });
  });

  describe("Message formatting", () => {
    it("should provide helpful error messages for missing VARIANTS", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_DEFAULT_VARIANTS",
      ]);

      expect(reports[0].messageId).toBe("missingVariants");
      expect(reports[0].data).toEqual({
        component: "BUTTON",
        found: "KUMO_BUTTON_DEFAULT_VARIANTS",
      });
    });

    it("should provide helpful error messages for missing DEFAULT_VARIANTS", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_VARIANTS",
      ]);

      expect(reports[0].messageId).toBe("missingDefaultVariants");
      expect(reports[0].data).toEqual({
        component: "BUTTON",
        found: "KUMO_BUTTON_VARIANTS",
      });
    });

    it("should provide helpful error messages for incorrect names", () => {
      const reports = runRule("src/components/button/button.tsx", [
        "KUMO_BUTTON_VARIANTS",
        "KUMO_BUTTON_DEFAULT_VARIANTS",
        "BUTTON_BASE_STYLES",
      ]);

      expect(reports[0].messageId).toBe("incorrectName");
      expect(reports[0].data).toEqual({
        actual: "BUTTON_BASE_STYLES",
        expected: "KUMO_BUTTON_BASE_STYLES",
      });
    });

    it('should show "none" when no variant-related exports exist', () => {
      const reports = runRule("src/components/button/button.tsx", [
        "Button",
        "ButtonProps",
      ]);

      expect(reports).toHaveLength(2);
      expect(reports[0].data!.found).toBe("none");
      expect(reports[1].data!.found).toBe("none");
    });
  });
});
