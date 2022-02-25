/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { computed, getCurrentInstance, WritableComputedRef } from 'vue';

export function useInstance() {
  const instance = getCurrentInstance();

  if (!instance) {
    throw new Error(
      'useInstance must be called from the setup or lifecycle hook methods.'
    );
  }

  return instance;
}

export function useOptions() {
  const { proxy } = useInstance();
  // eslint-disable-next-line id-match
  const { config } = proxy?.$vitamin || {};
  const { getOptions } = config || {};

  return getOptions ? getOptions() : {};
}

export function useVModel<TProps, PropName extends keyof TProps>(
  props: Record<string, TProps[PropName]>,
  name: string
): WritableComputedRef<TProps[PropName]> {
  const instance = useInstance();

  return computed({
    get() {
      return props[name];
    },
    set(value) {
      instance.emit(`update:${name}`, value);
    }
  });
}
