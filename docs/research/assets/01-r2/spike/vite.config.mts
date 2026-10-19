import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { defineConfig, type Plugin } from 'vite';

const spike = fileURLToPath(new URL('.', import.meta.url));
const repo = process.env.LINE_UI_ROOT ?? resolve(spike, '..');

// One build per bundle page, so no page shares chunks with another (`R2_PAGE=a|b|a-eager`).
const page = process.env.R2_PAGE;

// `.bun/<name>@<version>/node_modules/<name>/…` or `node_modules/<name>/…`, scoped names included.
function owner(id: string): string {
  const match = /node_modules\/(?:\.bun\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/.exec(id);
  if (match) return match[1];
  if (id.includes('/packages/line-core/')) return '@websublime/line-core';
  return `spike:${relative(spike, id).replace(/^\0/, '')}`;
}

/**
 * Writes `chunk-report.json`: per chunk, its bytes, gzip bytes, the tags it defines, and the rendered and gzip bytes
 * of each package or spike file in it.
 */
function chunkReport(): Plugin {
  return {
    name: 'r2-chunk-report',
    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle)
        .filter((item) => item.type === 'chunk')
        .map((chunk) => {
          const owners: Record<string, { rendered: number; code: string }> = {};
          for (const [id, info] of Object.entries(chunk.modules)) {
            owners[owner(id)] ??= { rendered: 0, code: '' };
            const entry = owners[owner(id)];
            entry.rendered += info.renderedLength;
            if ('code' in info && typeof info.code === 'string') entry.code += info.code;
          }
          return {
            file: chunk.fileName,
            entry: chunk.isEntry,
            dynamicEntry: chunk.isDynamicEntry,
            facade: chunk.facadeModuleId ? owner(chunk.facadeModuleId) : null,
            imports: chunk.imports,
            dynamicImports: chunk.dynamicImports,
            bytes: Buffer.byteLength(chunk.code),
            gzip: gzipSync(chunk.code, { level: 9 }).length,
            defines: [...chunk.code.matchAll(/customElements\.define\(\s*["'`]([a-z0-9-]+)["'`]/g)].map((m) => m[1]),
            owners: Object.fromEntries(
              Object.entries(owners).map(([name, { rendered, code }]) => [
                name,
                { rendered, gzipAlone: code ? gzipSync(code, { level: 9 }).length : null },
              ]),
            ),
          };
        });
      this.emitFile({ type: 'asset', fileName: 'chunk-report.json', source: JSON.stringify(chunks, null, 2) });
    },
  };
}

export default defineConfig({
  root: spike,
  base: page ? `/${page}/` : '/',
  resolve: {
    // The real `LineElement`, built by `bun run --filter @websublime/line-core build`.
    alias: { '@websublime/line-core': resolve(repo, 'packages/line-core/dist/index.js') },
  },
  server: { host: '127.0.0.1', port: 4331, strictPort: true },
  preview: { host: '127.0.0.1', port: 4332, strictPort: true },
  build: {
    outDir: page ? `out/dist/${page}` : 'out/dist',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: { input: page ? resolve(spike, `pages/bundle-${page}.html`) : [] },
  },
  plugins: [chunkReport()],
});
