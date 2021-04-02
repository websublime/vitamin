/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { addCollection, IconifyJSON } from '@iconify/vue';
import { App } from 'vue';

import { merge } from './helpers';

type VitaminConfig = {
  iconifyPack?: IconifyJSON,
  iconifyPrefix?: string,
  useHtml5Validation?: boolean
};

let config: VitaminConfig = {
  useHtml5Validation: true
};

export const setOptions = (options: VitaminConfig): void => {
  const { iconifyPack } = options;

  config = options;

  if (iconifyPack) {
    addCollection(iconifyPack);
  }
};

export const getOptions = (): VitaminConfig => config;

export let VueInstance: App;

export const setVueInstance = (Vue: App): void => { VueInstance = Vue; };

export const Programmatic = {
  getOptions,
  setOptions(options: any): void {
    setOptions(merge(getOptions(), options, true));
  }
};

export const Plugin = {
  install(Vue: App, options = {}): void {
    setVueInstance(Vue);
    // Options
    setOptions(merge(getOptions(), options, true));
  }
};
