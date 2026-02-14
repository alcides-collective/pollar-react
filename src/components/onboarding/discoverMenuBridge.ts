/**
 * Bridge for GuidedTour to programmatically open/close the Discover dropdown menu.
 * Header registers a controller on mount; GuidedTour calls open/close during tour steps.
 */

type Controller = {
  open: () => void;
  close: () => void;
};

let controller: Controller | null = null;
let tourActive = false;

export function registerDiscoverMenu(ctrl: Controller | null) {
  controller = ctrl;
}

export function openDiscoverMenu(): void {
  controller?.open();
}

export function closeDiscoverMenu(): void {
  controller?.close();
}

export function setTourActive(active: boolean): void {
  tourActive = active;
}

export function isTourActive(): boolean {
  return tourActive;
}
