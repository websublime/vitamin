import { resolve } from 'node:path';

/** Runs one Vite 8 build per bundle page, so no page shares a chunk with another. */

const spike = resolve(import.meta.dir, '..');
for (const page of ['a', 'b', 'a-eager']) {
  const proc = Bun.spawnSync(['bunx', 'vite', 'build', '--config', 'vite.config.mts', '--logLevel', 'warn'], {
    cwd: spike,
    env: { ...process.env, R2_PAGE: page },
    stdout: 'inherit',
    stderr: 'inherit',
  });
  if (proc.exitCode !== 0) process.exit(proc.exitCode ?? 1);
  console.info(`built out/dist/${page}`);
}
