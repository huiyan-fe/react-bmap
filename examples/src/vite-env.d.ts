/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** LbsHeader 脚本地址，见 examples/.env */
  readonly VITE_LBS_HEADER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
