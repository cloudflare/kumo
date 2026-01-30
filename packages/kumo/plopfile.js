import fs from "fs";

export default function (plop) {
  // Custom action to modify JSON files
  plop.setActionType("modify-json", (answers, config) => {
    const filePath = config.path;
    const packageJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const modifiedJson = config.transform(packageJson);
    fs.writeFileSync(
      filePath,
      JSON.stringify(modifiedJson, null, "\t") + "\n",
      "utf8",
    );
    return `Modified ${filePath}`;
  });

  // Component generator
  plop.setGenerator("component", {
    description: "Create a new component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: 'Component name (e.g., "My Component" or "my-component"):',
        validate: (value) => {
          if (!value) return "Component name is required";
          if (value.length < 2)
            return "Component name must be at least 2 characters";
          return true;
        },
      },
    ],
    actions: (data) => {
      const actions = [];
      const kebabName = plop.getHelper("kebabCase")(data.name);
      const pascalName = plop.getHelper("pascalCase")(data.name);

      // 1. Create component file
      actions.push({
        type: "add",
        path: "src/components/{{kebabCase name}}/{{kebabCase name}}.tsx",
        templateFile: "plop-templates/component.tsx.hbs",
      });

      // 2. Create index file
      actions.push({
        type: "add",
        path: "src/components/{{kebabCase name}}/index.ts",
        templateFile: "plop-templates/index.ts.hbs",
      });

      // 3. Create story file
      actions.push({
        type: "add",
        path: "src/components/{{kebabCase name}}/{{kebabCase name}}.stories.tsx",
        templateFile: "plop-templates/component.stories.tsx.hbs",
      });

      // 4. Create test file
      actions.push({
        type: "add",
        path: "src/components/{{kebabCase name}}/{{kebabCase name}}.test.tsx",
        templateFile: "plop-templates/component.test.tsx.hbs",
      });

      // 5. Update main index.ts - insert BEFORE marker
      actions.push({
        type: "modify",
        path: "src/index.ts",
        pattern: /(\/\/ PLOP_INJECT_EXPORT)/,
        template: `export { ${pascalName}, type ${pascalName}Props } from "./components/${kebabName}";\n$1`,
      });

      // 6. Update vite.config.ts - insert BEFORE marker
      actions.push({
        type: "modify",
        path: "vite.config.ts",
        pattern: /(        \/\/ PLOP_INJECT_COMPONENT_ENTRY)/,
        template: `        'components/${kebabName}': resolve(__dirname, 'src/components/${kebabName}/index.ts'),\n$1`,
      });

      // 7. Update package.json exports using proper JSON manipulation
      actions.push({
        type: "modify-json",
        path: "package.json",
        transform: (packageJson) => {
          // Create the new export entry
          // Note: With preserveModules: true in vite.config.ts:
          // - JS files are flat: dist/components/[name].js
          // - Type files are nested: dist/src/components/[name]/index.d.ts
          const newExport = {
            types: `./dist/src/components/${kebabName}/index.d.ts`,
            import: `./dist/components/${kebabName}.js`,
          };

          // Get all exports
          const exports = packageJson.exports;

          // Create new exports object with components before utils
          const newExports = {};

          for (const [key, value] of Object.entries(exports)) {
            // Add all entries before utils
            if (key === "./utils") {
              // Insert new component export before utils
              newExports[`./components/${kebabName}`] = newExport;
            }
            newExports[key] = value;
          }

          packageJson.exports = newExports;
          return packageJson;
        },
      });

      // 8. Success message
      actions.push(() => {
        console.log("\n✅ Component scaffolded successfully!");
        console.log(`\n📁 Files created:`);
        console.log(`   - src/components/${kebabName}/${kebabName}.tsx`);
        console.log(`   - src/components/${kebabName}/index.ts`);
        console.log(
          `   - src/components/${kebabName}/${kebabName}.stories.tsx`,
        );
        console.log(`   - src/components/${kebabName}/${kebabName}.test.tsx`);
        console.log(`\n📝 Files updated:`);
        console.log(`   - src/index.ts`);
        console.log(`   - vite.config.ts`);
        console.log(`   - package.json`);
        console.log(`\n🧪 Next steps:`);
        console.log(
          `   1. Implement your component in src/components/${kebabName}/${kebabName}.tsx`,
        );
        console.log(
          `   2. Add stories in src/components/${kebabName}/${kebabName}.stories.tsx`,
        );
        console.log(
          `   3. Write tests in src/components/${kebabName}/${kebabName}.test.tsx`,
        );
        console.log(`   4. Run Storybook: pnpm storybook`);
        console.log(`   5. Run tests: pnpm test`);
        console.log(`   6. Build: pnpm build`);
        console.log(`\n💡 Import examples:`);
        console.log(`   import { ${pascalName} } from "@cloudflare/kumo";`);
        console.log(
          `   import { ${pascalName} } from "@cloudflare/kumo/components/${kebabName}";`,
        );

        return "Component created successfully";
      });

      return actions;
    },
  });

}
