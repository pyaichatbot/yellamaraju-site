/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_BUTTONDOWN_USERNAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
