import { defineConfig } from 'vite';

// Shared Vite library-mode config factory (Phase 00 spec §6.F.2, Phase 1 spec P8).
// Consumed by `@websublime/line-core` and `@websublime/line-components`.
// Vite emits the JavaScript; each package's `build` script runs
// `tsc --emitDeclarationOnly` for the `.d.ts` files (AM-074).
//
// Usage in a package's vite.config.mjs:
//   import shared from '../../vite.config.shared.mjs';
//   export default shared({ entries: { index: 'src/index.ts' } });
export default function shared(pkg) {
  return defineConfig({
    build: {
      target: 'es2022',
      lib: {
        entry: pkg.entries,
        formats: ['es'],
      },
      rollupOptions: {
        // Rolldown reads Rollup-shaped config
        external: [/^lit/, /^@zag-js\//],
      },
      // Watch rebuilds keep dist/, so the `tsc --watch` declarations survive (Phase 1 spec §7.1, AM-006).
      emptyOutDir: !process.argv.includes('--watch'),
      sourcemap: true,
    },
  });
}
