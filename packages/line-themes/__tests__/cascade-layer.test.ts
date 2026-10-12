/**
 * Cascade layer contract — `@websublime/line-themes` (spec §6.C, §6.C.7, AM-058).
 *
 * Parses every `src/` CSS file with PostCSS. A leaf file holds comments plus
 * exactly one top-level `@layer line { … }` block and no `@import`. A barrel
 * (`index.css`) holds only comments and `@import` rules. Any other top-level
 * node fails.
 *
 * @module __tests__/cascade-layer
 */

import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import postcss from 'postcss';

const SRC = resolve(import.meta.dirname, '../src');

const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.css'))
  .sort();

/** Describes each top-level node that is not a comment, e.g. `rule :where(html)`. */
function topLevel(file: string): string[] {
  const root = postcss.parse(readFileSync(resolve(SRC, file), 'utf8'), { from: file });
  return root.nodes
    .filter((node) => node.type !== 'comment')
    .map((node) => {
      if (node.type === 'atrule') return `@${node.name} ${node.params}${node.nodes ? ' {}' : ''}`;
      if (node.type === 'rule') return `rule ${node.selector}`;
      return node.type;
    });
}

describe('cascade layer `line`', () => {
  test('src/ holds CSS files', () => {
    expect(files.length).toBeGreaterThan(1);
  });

  for (const file of files) {
    const name = relative(SRC, resolve(SRC, file));
    if (name === 'index.css') {
      test(`${name} holds only comments and @import rules`, () => {
        const nodes = topLevel(file);
        expect(nodes.length).toBeGreaterThan(0);
        expect(nodes.filter((node) => !node.startsWith('@import '))).toEqual([]);
      });
    } else {
      test(`${name} holds exactly one @layer line block`, () => {
        expect(topLevel(file)).toEqual(['@layer line {}']);
      });
    }
  }
});
