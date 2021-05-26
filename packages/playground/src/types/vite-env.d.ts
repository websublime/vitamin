/// <reference types="vite/client" />
interface ImportMetaEnv extends Readonly<Record<string, string | boolean | undefined>> {
  readonly VITE_AUTH_URL: string;
  readonly VITE_GRAPH_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
