/**
 * Minimal Figma Plugin API type declarations
 * For full types, install @figma/plugin-typings
 */

declare const figma: PluginAPI;
declare const __html__: string;

interface PluginAPI {
  showUI(html: string, options?: { width?: number; height?: number }): void;
  closePlugin(message?: string): void;
  notify(
    message: string,
    options?: { error?: boolean; timeout?: number },
  ): void;
  ui: {
    onmessage: ((msg: any) => void) | ((msg: any) => Promise<void>);
  };
  root: DocumentNode;
  createFrame(): FrameNode;
  createText(): TextNode;
  createComponent(): ComponentNode;
  createComponentSet(): ComponentSetNode;
  createSection(): SectionNode;
  createPage(): PageNode;
  createRectangle(): RectangleNode;
  createEllipse(): EllipseNode;
  createNodeFromSvg(svg: string): FrameNode;
  loadFontAsync(font: { family: string; style: string }): Promise<void>;
  /**
   * Combines multiple components into a ComponentSet (variants)
   * @param components - Array of ComponentNode to combine
   * @param parent - Parent node (usually PageNode or FrameNode)
   * @returns ComponentSetNode containing all variants
   */
  combineAsVariants(
    components: ComponentNode[],
    parent: BaseNode,
  ): ComponentSetNode;
  variables: {
    getLocalVariableCollections(): VariableCollection[];
    getVariableById(id: string): Variable | null;
    createVariableCollection(name: string): VariableCollection;
    createVariable(
      name: string,
      collection: VariableCollection,
      type: "COLOR" | "FLOAT" | "STRING",
    ): Variable;
    /**
     * Binds a variable to a paint's color property
     * @param paint - The paint to bind the variable to
     * @param field - The field to bind (currently only 'color' is supported)
     * @param variable - The variable to bind
     * @returns A new paint with the variable bound
     */
    setBoundVariableForPaint(
      paint: SolidPaint,
      field: "color",
      variable: Variable,
    ): SolidPaint;
  };
  /**
   * Utility functions for common operations
   */
  util: {
    /**
     * Creates a SolidPaint from a CSS color string
     * Supports hex colors with optional alpha: #RGB, #RRGGBB, #RRGGBBAA
     * @param color - CSS color string
     * @param existingPaint - Optional existing paint to modify
     * @returns A new SolidPaint with the specified color and opacity
     */
    solidPaint(color: string, existingPaint?: SolidPaint): SolidPaint;
  };
  currentPage: PageNode;
}

interface BaseNode {
  name: string;
  type: string;
  appendChild(child: SceneNode): void;
  findChild(callback: (node: BaseNode) => boolean): BaseNode | null;
  remove(): void;
}

interface DocumentNode {
  children: readonly PageNode[];
}

interface PageNode extends BaseNode {
  type: "PAGE";
  children: readonly SceneNode[];
}

interface SceneNode extends BaseNode {
  fills?: ReadonlyArray<Paint>;
  strokes?: ReadonlyArray<Paint>;
  strokeWeight?: number;
  constraints?: { horizontal: ConstraintType; vertical: ConstraintType };
  children?: readonly SceneNode[];
  setBoundVariable(
    field: string,
    variable: { type: "VARIABLE_ALIAS"; id: string },
  ): void;
}

type ConstraintType = "MIN" | "CENTER" | "MAX" | "STRETCH" | "SCALE";

interface FrameNode extends SceneNode {
  type: "FRAME";
  layoutMode: "NONE" | "HORIZONTAL" | "VERTICAL";
  primaryAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlignItems?: "MIN" | "CENTER" | "MAX";
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  itemSpacing: number;
  primaryAxisSizingMode?: "FIXED" | "AUTO";
  counterAxisSizingMode?: "FIXED" | "AUTO";
  cornerRadius: number;
  resize(width: number, height: number): void;
  x: number;
  y: number;
  children: readonly SceneNode[];
  setExplicitVariableModeForCollection(
    collection: VariableCollection,
    modeId: string,
  ): void;
}

interface TextNode extends SceneNode {
  type: "TEXT";
  characters: string;
  fontSize: number;
  fontName: { family: string; style: string };
}

interface RectangleNode extends SceneNode, LayoutMixin {
  type: "RECTANGLE";
}

interface EllipseNode extends SceneNode {
  type: "ELLIPSE";
  resize(width: number, height: number): void;
  x: number;
  y: number;
  strokeAlign: "CENTER" | "INSIDE" | "OUTSIDE";
  dashPattern: number[];
}

/**
 * Layout mixin properties available on ComponentNode at runtime.
 * Figma Plugin API includes these properties on ComponentNode even though
 * the base typings don't extend LayoutMixin explicitly.
 */
interface LayoutMixin {
  layoutMode: "NONE" | "HORIZONTAL" | "VERTICAL";
  primaryAxisAlignItems: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlignItems: "MIN" | "CENTER" | "MAX";
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  itemSpacing: number;
  primaryAxisSizingMode: "FIXED" | "AUTO";
  counterAxisSizingMode: "FIXED" | "AUTO";
  cornerRadius: number;
  resize(width: number, height: number): void;
  opacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  dashPattern: number[];
}

interface ComponentNode extends SceneNode, LayoutMixin {
  type: "COMPONENT";
  description: string;
  createInstance(): InstanceNode;
}

interface InstanceNode extends SceneNode, LayoutMixin {
  type: "INSTANCE";
}

interface ComponentSetNode extends SceneNode, LayoutMixin {
  type: "COMPONENT_SET";
  description: string;
}

interface SectionNode extends BaseNode, LayoutMixin {
  type: "SECTION";
  children: readonly SceneNode[];
  fills: ReadonlyArray<Paint>;
  resizeWithoutConstraints(width: number, height: number): void;
}

interface Paint {
  type: string;
  color?: RGB;
  opacity?: number;
}

interface SolidPaint extends Paint {
  type: "SOLID";
  color: RGB;
  boundVariables?: {
    color?: VariableAlias;
  };
}

interface VariableAlias {
  type: "VARIABLE_ALIAS";
  id: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface VariableCollection {
  name: string;
  variableIds: string[];
  modes: { modeId: string; name: string }[];
  renameMode(modeId: string, newName: string): void;
  addMode(name: string): string;
  remove(): void;
}

interface VectorNode extends SceneNode {
  type: "VECTOR";
}

interface Variable {
  id: string;
  name: string;
  setValueForMode(modeId: string, value: RGB | RGBA | number | string): void;
  remove(): void;
}

interface RGBA extends RGB {
  a: number;
}

type ComponentPropertyDefinition =
  | { type: "BOOLEAN"; defaultValue?: boolean }
  | { type: "TEXT"; defaultValue?: string }
  | { type: "VARIANT"; defaultValue?: string; variantOptions?: string[] }
  | { type: "INSTANCE_SWAP" };
