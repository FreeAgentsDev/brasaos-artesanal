/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WHATSAPP_E164: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
