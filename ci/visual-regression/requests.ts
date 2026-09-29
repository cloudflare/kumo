import { COMPONENT_ACTIONS, type DiscoveredComponent } from "./page-config";

export const MAX_BATCH_SIZE = 50;
export const HOME_GRID_SELECTOR =
  "[data-vr-home-grid], main astro-island ul.grid";

const STABILIZE_SCREENSHOT_CSS = `
  *, *::before, *::after {
    animation: none !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
    transition: none !important;
  }
`;

export interface PageRequest {
  url: string;
  captureId: string;
  captureSections: boolean;
  hideSidebar: boolean;
  fullPage?: boolean;
  selector?: string;
  actions?: Array<{
    type: "click" | "hover" | "css";
    selector?: string;
    waitAfter?: number;
    css?: string;
  }>;
}

export function buildPageRequests(
  components: DiscoveredComponent[],
): PageRequest[] {
  const requests: PageRequest[] = [];

  for (const component of components) {
    const isHome = component.id === "home";
    requests.push({
      url: component.url,
      captureId: component.id,
      captureSections: !isHome,
      hideSidebar: true,
      selector: isHome ? HOME_GRID_SELECTOR : undefined,
      actions: [{ type: "css", css: STABILIZE_SCREENSHOT_CSS }],
    });

    const action = COMPONENT_ACTIONS[component.id];
    if (action) {
      requests.push({
        url: component.url,
        captureId: `${component.id}-open`,
        captureSections: false,
        hideSidebar: true,
        fullPage: false,
        actions: [{ type: "css", css: STABILIZE_SCREENSHOT_CSS }, action],
      });
    }
  }

  return requests;
}

export function chunkPageRequests(
  requests: PageRequest[],
  batchSize = MAX_BATCH_SIZE,
): PageRequest[][] {
  if (!Number.isInteger(batchSize) || batchSize < 2) {
    throw new Error(
      "Visual regression batch size must be an integer of at least 2",
    );
  }

  const batches: PageRequest[][] = [];

  for (let index = 0; index < requests.length;) {
    let end = Math.min(index + batchSize, requests.length);
    if (
      end < requests.length &&
      requests[end - 1]?.url === requests[end]?.url
    ) {
      end--;
    }
    batches.push(requests.slice(index, end));
    index = end;
  }

  return batches;
}
