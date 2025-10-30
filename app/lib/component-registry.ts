/**
 * Component Registry for AI Playground
 * 
 * This registry provides metadata about all Kumo components to help the AI
 * generate valid code. Each component includes:
 * - Import path
 * - Available props with types
 * - Example usage
 */

export interface ComponentProp {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description?: string;
}

export interface ComponentMetadata {
  name: string;
  importPath: string;
  props: ComponentProp[];
  examples: string[];
  description: string;
  category: string;
}

export const COMPONENT_REGISTRY: Record<string, ComponentMetadata> = {
  Button: {
    name: "Button",
    importPath: "~/components/button/button",
    description: "Displays a button or a component that looks like a button.",
    category: "Form",
    props: [
      { name: "variant", type: '"primary" | "secondary" | "ghost" | "destructive" | "outline"', default: '"secondary"' },
      { name: "size", type: '"xs" | "sm" | "base" | "lg"', default: '"base"' },
      { name: "shape", type: '"base" | "square" | "circle"', default: '"base"' },
      { name: "icon", type: "Icon | React.ReactNode", description: "Icon from @phosphor-icons/react" },
      { name: "loading", type: "boolean", default: "false" },
      { name: "disabled", type: "boolean", default: "false" },
      { name: "onClick", type: "() => void" },
    ],
    examples: [
      '<Button variant="primary">Click me</Button>',
      '<Button variant="secondary" icon={PlusIcon}>Add Item</Button>',
      '<Button shape="square" icon={PlusIcon} />',
      '<Button loading>Loading...</Button>',
    ],
  },
  Input: {
    name: "Input",
    importPath: "~/components/input/input",
    description: "Text input field with variants.",
    category: "Form",
    props: [
      { name: "placeholder", type: "string" },
      { name: "variant", type: '"default" | "error"', default: '"default"' },
      { name: "type", type: "string", default: '"text"' },
      { name: "value", type: "string" },
      { name: "onChange", type: "(e: React.ChangeEvent<HTMLInputElement>) => void" },
    ],
    examples: [
      '<Input placeholder="Enter your name..." />',
      '<Input variant="error" value="Invalid input" />',
      '<Input type="email" placeholder="email@example.com" />',
    ],
  },
  Select: {
    name: "Select",
    importPath: "~/components/select/select",
    description: "Dropdown select component. Use with Option children.",
    category: "Form",
    props: [
      { name: "className", type: "string" },
      { name: "renderValue", type: "(value: string) => string" },
      { name: "defaultValue", type: "string" },
      { name: "onChange", type: "(value: string) => void" },
    ],
    examples: [
      `<Select className="w-[200px]">
  <Option value="1">Option 1</Option>
  <Option value="2">Option 2</Option>
</Select>`,
    ],
  },
  Checkbox: {
    name: "Checkbox",
    importPath: "~/components/checkbox/checkbox",
    description: "Checkbox input with optional label.",
    category: "Form",
    props: [
      { name: "label", type: "string" },
      { name: "checked", type: "boolean" },
      { name: "onChange", type: "(checked: boolean) => void" },
    ],
    examples: [
      '<Checkbox label="Accept terms" />',
      '<Checkbox checked={true} label="Enabled" />',
    ],
  },
  Toggle: {
    name: "Toggle",
    importPath: "~/components/toggle/toggle",
    description: "Toggle switch component.",
    category: "Form",
    props: [
      { name: "toggled", type: "boolean" },
      { name: "onClick", type: "() => void" },
    ],
    examples: [
      '<Toggle toggled={true} onClick={() => {}} />',
    ],
  },
  Dialog: {
    name: "Dialog",
    importPath: "~/components/dialog/dialog",
    description: "Modal dialog. Use DialogRoot, DialogTrigger, Dialog, DialogTitle, DialogDescription.",
    category: "Overlay",
    props: [],
    examples: [
      `<DialogRoot>
  <DialogTrigger render={<Button>Open</Button>} />
  <Dialog>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
  </Dialog>
</DialogRoot>`,
    ],
  },
  Tooltip: {
    name: "Tooltip",
    importPath: "~/components/tooltip/tooltip",
    description: "Tooltip component. Wrap in TooltipProvider.",
    category: "Overlay",
    props: [
      { name: "content", type: "string", required: true },
      { name: "asChild", type: "boolean" },
    ],
    examples: [
      `<TooltipProvider>
  <Tooltip content="Click to add" asChild>
    <Button icon={PlusIcon} />
  </Tooltip>
</TooltipProvider>`,
    ],
  },
  DropdownMenu: {
    name: "DropdownMenu",
    importPath: "~/components/dropdown/dropdown",
    description: "Dropdown menu with trigger and items.",
    category: "Overlay",
    props: [],
    examples: [
      `<DropdownMenu>
  <DropdownMenu.Trigger render={<Button>Menu</Button>} />
  <DropdownMenu.Content>
    <DropdownMenu.Item>Item 1</DropdownMenu.Item>
    <DropdownMenu.Item>Item 2</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>`,
    ],
  },
  Surface: {
    name: "Surface",
    importPath: "~/components/surface/surface",
    description: "Container surface with background.",
    category: "Layout",
    props: [
      { name: "className", type: "string" },
    ],
    examples: [
      '<Surface className="p-4 rounded-lg">Content here</Surface>',
    ],
  },
  Field: {
    name: "Field",
    importPath: "~/components/field/field",
    description: "Form field wrapper with label, description, and error.",
    category: "Form",
    props: [
      { name: "label", type: "string" },
      { name: "description", type: "string" },
      { name: "error", type: '{ message: string; match?: string }' },
    ],
    examples: [
      `<Field label="Email" description="Your email address">
  <Input type="email" placeholder="email@example.com" />
</Field>`,
    ],
  },
  Loader: {
    name: "Loader",
    importPath: "~/components/loader/loader",
    description: "Loading spinner.",
    category: "Display",
    props: [
      { name: "size", type: "number", default: "16" },
    ],
    examples: [
      '<Loader />',
      '<Loader size={24} />',
    ],
  },
  ResourceListPage: {
    name: "ResourceListPage",
    importPath: "~/layouts/resource-list",
    description: "Page layout for resource lists with optional sidebar. Use this for Workers, Zones, DNS records, etc.",
    category: "Layout",
    props: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "icon", type: "React.ReactNode" },
      { name: "usage", type: "React.ReactNode" },
      { name: "additionalContent", type: "React.ReactNode" },
      { name: "children", type: "React.ReactNode", required: true },
    ],
    examples: [
      `<ResourceListPage
  title="Workers"
  description="Manage your Workers"
  usage={<div>Usage stats here</div>}
>
  <div>List content</div>
</ResourceListPage>`,
    ],
  },
  Empty: {
    name: "Empty",
    importPath: "~/blocks/empty",
    description: "Empty state component with optional command line and action button.",
    category: "Display",
    props: [
      { name: "icon", type: "React.ReactNode" },
      { name: "title", type: "string", required: true },
      { name: "description", type: "string" },
      { name: "commandLine", type: "string" },
      { name: "contents", type: "React.ReactNode" },
    ],
    examples: [
      `<Empty
  icon={<span>📦</span>}
  title="No workers yet"
  description="Get started by creating your first worker"
  commandLine="npm create cloudflare@latest"
  contents={<Button variant="primary">Create Worker</Button>}
/>`,
    ],
  },
  Badge: {
    name: "Badge",
    importPath: "~/components/badge/badge",
    description: "Small badge for labels and status indicators.",
    category: "Display",
    props: [
      { name: "variant", type: "'primary' | 'secondary' | 'outline' | 'destructive'" },
    ],
    examples: [
      '<Badge variant="primary">New</Badge>',
      '<Badge variant="destructive">Error</Badge>',
    ],
  },
  Banner: {
    name: "Banner",
    importPath: "~/components/banner/banner",
    description: "Banner for notifications and alerts.",
    category: "Feedback",
    props: [
      { name: "text", type: "string", required: true },
      { name: "icon", type: "React.ReactNode" },
      { name: "variant", type: "'default' | 'alert' | 'error'" },
    ],
    examples: [
      '<Banner text="This is a notification" />',
      '<Banner text="Warning!" variant={BannerVariant.ALERT} icon={<WarningIcon />} />',
    ],
  },
  LayerCard: {
    name: "LayerCard",
    importPath: "~/components/layer-card/layer-card",
    description: "Card component with header and content sections. Perfect for displaying grouped information with a title.",
    category: "Layout",
    props: [
      { name: "title", type: "React.ReactNode", required: true },
      { name: "children", type: "React.ReactNode", required: true },
      { name: "href", type: "string" },
      { name: "badge", type: "React.ReactNode" },
      { name: "className", type: "string" },
    ],
    examples: [
      `<LayerCard title="Settings">
  <div className="p-4">
    <Field label="Name">
      <Input placeholder="Enter name" />
    </Field>
  </div>
</LayerCard>`,
      `<LayerCard title="Quick Actions" badge={<Badge>New</Badge>}>
  <div className="p-4 space-y-2">
    <Button variant="secondary">Action 1</Button>
    <Button variant="secondary">Action 2</Button>
  </div>
</LayerCard>`,
    ],
  },
};

// Icons that are commonly used
export const COMMON_ICONS = [
  "PlusIcon",
  "XIcon",
  "CheckIcon",
  "TrashIcon",
  "PencilIcon",
  "MagnifyingGlassIcon",
  "ArrowRightIcon",
  "ArrowLeftIcon",
  "WarningIcon",
  "InfoIcon",
  "GearIcon",
  "UserIcon",
];

/**
 * Generate AI context string for component generation
 */
export function generateAIContext(): string {
  const components = Object.values(COMPONENT_REGISTRY);
  
  let context = "# Available Kumo Components\n\n";
  
  for (const comp of components) {
    context += `## ${comp.name}\n`;
    context += `${comp.description}\n`;
    context += `Import: import { ${comp.name} } from "${comp.importPath}";\n\n`;
    
    if (comp.props.length > 0) {
      context += "Props:\n";
      for (const prop of comp.props) {
        const required = prop.required ? " (required)" : "";
        const defaultVal = prop.default ? ` [default: ${prop.default}]` : "";
        context += `- ${prop.name}: ${prop.type}${required}${defaultVal}\n`;
        if (prop.description) {
          context += `  ${prop.description}\n`;
        }
      }
      context += "\n";
    }
    
    context += "Examples:\n";
    for (const example of comp.examples) {
      context += `\`\`\`tsx\n${example}\n\`\`\`\n\n`;
    }
    context += "\n";
  }
  
  context += `\n# Common Icons (from @phosphor-icons/react)\n`;
  context += COMMON_ICONS.join(", ");
  context += "\n\n";
  
  return context;
}

/**
 * Get all required imports for generated code
 */
export function extractRequiredImports(code: string): string[] {
  const imports: string[] = [];
  const importMap: Record<string, string> = {};
  
  // Build import map
  for (const comp of Object.values(COMPONENT_REGISTRY)) {
    importMap[comp.name] = comp.importPath;
  }
  
  // Check which components are used in the code
  for (const [componentName, importPath] of Object.entries(importMap)) {
    if (code.includes(componentName)) {
      // Check if it's actually used as a component (not just in a string)
      const componentRegex = new RegExp(`<${componentName}[\\s>]`);
      if (componentRegex.test(code)) {
        imports.push(`import { ${componentName} } from "${importPath}";`);
      }
    }
  }
  
  // Check for icon imports
  const iconMatches = code.match(/\b(\w+Icon)\b/g);
  if (iconMatches) {
    const uniqueIcons = [...new Set(iconMatches)];
    const kumoIcons = uniqueIcons.filter(icon => COMMON_ICONS.includes(icon));
    if (kumoIcons.length > 0) {
      imports.push(`import { ${kumoIcons.join(", ")} } from "@phosphor-icons/react";`);
    }
  }
  
  return imports;
}
