/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string;
  readonly VITE_SOURCEMAP?: string;
  readonly VITE_MEDIAPIPE_WASM?: string;
  readonly VITE_MEDIAPIPE_HAND_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
declare const __BUILD_MODE__: string;
