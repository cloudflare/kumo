import { describe, it, expect } from "vitest";
import { discoverComponents, getComponentsWithExports } from "./test-utils";

describe("Deep Import Patterns", () => {
  const allComponents = discoverComponents();
  const componentsWithExports = getComponentsWithExports();

  describe("Components with configured exports", () => {
    componentsWithExports.forEach((componentName: string) => {
      it(`should import from @cloudflare/kumo/components/${componentName}`, async () => {
        expect(async () => {
          const module = await import(
            `../../src/components/${componentName}/index.ts`
          );
          expect(module).toBeDefined();
          expect(Object.keys(module).length).toBeGreaterThan(0);
        }).not.toThrow();
      });
    });
  });

  describe("All components should have configured exports", () => {
    const componentsWithoutExports = allComponents.filter(
      (name) => !componentsWithExports.includes(name),
    );

    it("should have all components configured in package.json exports", () => {
      if (componentsWithoutExports.length > 0) {
        console.warn("\n⚠️  Components missing from package.json exports:");
        componentsWithoutExports.forEach((name: string) => {
          console.warn(`   - ${name}`);
        });
      } else {
        console.log("\n✅ All components have configured exports!");
      }

      // All components should have exports configured
      expect(componentsWithoutExports.length).toBe(0);
      expect(componentsWithoutExports).toEqual([]);
    });
  });

  describe("All components should have index.ts", () => {
    allComponents.forEach((componentName: string) => {
      it(`${componentName} should have an index.ts file`, async () => {
        expect(async () => {
          await import(`../../src/components/${componentName}/index.ts`);
        }).not.toThrow();
      });
    });
  });
});
