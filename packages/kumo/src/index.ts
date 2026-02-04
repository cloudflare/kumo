// Kumo Component Library
//
// NOTE: Blocks (PageHeader, ResourceListPage, etc.) are NOT exported from this package.
// Blocks must be installed via the Kumo CLI: `kumo add <block-name>`
// Run `kumo blocks` to see all available blocks.
//
// Components
export { Badge, type BadgeVariant } from "./components/badge";
export { Banner, BannerVariant } from "./components/banner";
export {
  Button,
  RefreshButton,
  LinkButton,
  buttonVariants,
  type ButtonProps,
  type LinkButtonProps,
} from "./components/button";
export { DateRangePicker } from "./components/date-range-picker";
export { Checkbox, type CheckboxProps } from "./components/checkbox";
export { ClipboardText } from "./components/clipboard-text";
export { Code, CodeBlock } from "./components/code";
export { Combobox } from "./components/combobox";
export {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./components/dialog";
export { DropdownMenu } from "./components/dropdown";
export { Collapsible } from "./components/collapsible";
export {
  Field,
  type FieldProps,
  type FieldErrorMatch,
  fieldVariants,
  KUMO_FIELD_VARIANTS,
  KUMO_FIELD_DEFAULT_VARIANTS,
} from "./components/field";
export {
  Label,
  type LabelProps,
  labelVariants,
  labelContentVariants,
  KUMO_LABEL_VARIANTS,
  KUMO_LABEL_DEFAULT_VARIANTS,
} from "./components/label";
export {
  Input,
  inputVariants,
  type InputProps,
  InputArea,
  type InputAreaProps,
  InputGroup,
} from "./components/input";
export { LayerCard } from "./components/layer-card";
export { Loader, SkeletonLine } from "./components/loader";
export { MenuBar, useMenuNavigation } from "./components/menubar";
export { Meter } from "./components/meter";
export { Pagination } from "./components/pagination";
export { Select } from "./components/select";
export {
  NativeSelect,
  nativeSelectVariants,
  type NativeSelectProps,
  type KumoNativeSelectSize,
  type KumoNativeSelectVariantsProps,
  KUMO_NATIVE_SELECT_VARIANTS,
  KUMO_NATIVE_SELECT_DEFAULT_VARIANTS,
  KUMO_NATIVE_SELECT_STYLING,
} from "./components/native-select";
export { Surface } from "./components/surface";
export { Switch } from "./components/switch";
export { Tabs, type TabsProps, type TabsItem } from "./components/tabs";
export { Table } from "./components/table";
export { Text } from "./components/text";
export { Toasty, Toast } from "./components/toast";
export { Tooltip, TooltipProvider } from "./components/tooltip";
export {
  Popover,
  KUMO_POPOVER_VARIANTS,
  KUMO_POPOVER_DEFAULT_VARIANTS,
  type PopoverRootProps,
  type PopoverTriggerProps,
  type PopoverContentProps,
  type PopoverTitleProps,
  type PopoverDescriptionProps,
  type PopoverCloseProps,
} from "./components/popover";
export {
  SensitiveInput,
  type SensitiveInputProps,
  KUMO_SENSITIVE_INPUT_VARIANTS,
  KUMO_SENSITIVE_INPUT_DEFAULT_VARIANTS,
} from "./components/sensitive-input";
export {
  Radio,
  RadioGroup,
  KUMO_RADIO_VARIANTS,
  KUMO_RADIO_DEFAULT_VARIANTS,
  type RadioGroupProps,
  type RadioItemProps,
  type RadioControlPosition,
  type KumoRadioVariant,
  type RadioVariant,
} from "./components/radio";
export {
  CommandPalette,
  KUMO_COMMAND_PALETTE_VARIANTS,
  KUMO_COMMAND_PALETTE_DEFAULT_VARIANTS,
  type CommandPaletteRootProps,
  type CommandPaletteItemProps,
  type CommandPaletteResultItemProps,
  type CommandPaletteFooterProps,
  type CommandPaletteListProps,
  type CommandPaletteGroupProps,
  type CommandPaletteGroupLabelProps,
  type CommandPaletteEmptyProps,
  type CommandPaletteLoadingProps,
  type HighlightRange,
} from "./components/command-palette";
export {
  Link,
  linkVariants,
  KUMO_LINK_VARIANTS,
  KUMO_LINK_DEFAULT_VARIANTS,
  type LinkProps,
  type KumoLinkVariant,
  type KumoLinkVariantsProps,
} from "./components/link";
export { Breadcrumbs, type BreadcrumbsProps } from "./components/breadcrumbs";
export { Empty, type EmptyProps } from "./components/empty";
export {
  Grid,
  GridItem,
  gridVariants,
  gridItemVariants,
  KUMO_GRID_VARIANTS,
  KUMO_GRID_DEFAULT_VARIANTS,
  type GridProps,
  type GridItemProps,
  type KumoGridVariant,
  type KumoGridGap,
} from "./components/grid";
// PLOP_INJECT_EXPORT

// Utils
export { cn, safeRandomId } from "./utils/cn";
export {
  LinkProvider,
  useLinkComponent,
  type LinkComponentProps,
} from "./utils/link-provider";

// Registry types (for consuming packages to type registry JSON)
export type {
  ComponentRegistry,
  ComponentSchema,
  ComponentStyling,
  ComponentType,
  PropSchema,
  SubComponentSchema,
} from "./registry/types";
