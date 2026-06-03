/// <reference types="vite/client" />

import type { LumitDesktopApi } from "../preload/index.js";

declare global {
  interface Window {
    lumit: LumitDesktopApi;
  }
}
