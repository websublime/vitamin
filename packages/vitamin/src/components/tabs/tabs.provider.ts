/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { InjectionKey, Ref } from 'vue';

export type TabPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TabsDefinition {
  activeTab: string;
  modelValue: string;
  position: TabPosition;
  hasBorder: boolean;
}

export interface TabsProperties extends TabsDefinition {
  tabRef: Ref<string>;
}

export const TabContext = Symbol('TabContext') as InjectionKey<TabsProperties>;
