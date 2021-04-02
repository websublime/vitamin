/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { getCurrentInstance } from 'vue';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useOptions() {
  const { proxy } = getCurrentInstance();
  // eslint-disable-next-line id-match
  const { $vitamin } = proxy;
  const { config } = $vitamin || {};
  const { getOptions } = config || {};

  return getOptions ? getOptions() : {};
}
