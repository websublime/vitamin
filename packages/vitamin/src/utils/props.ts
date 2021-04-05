/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { PropType } from 'vue';

export type Rounded = 'sm'|'md'|'lg'|'xl'|'2xl'|'none';
export type Shadow = 'sm'|'md'|'lg'|'xl'|'2xl'|'none'

export const shapeProps = {
  hasBorder: {
    default: false,
    type: Boolean
  },
  rounded: {
    default: 'none',
    type: String as PropType<Rounded>,
    validator: (value: string) => [
      'none',
      'sm',
      'md',
      'lg',
      'xl',
      '2xl',
      '3xl',
      'full'
    ].includes(value)
  },
  shadow: {
    default: 'none',
    type: String as PropType<Shadow>,
    validator: (value: string) => [
      'none',
      'sm',
      'md',
      'lg',
      'xl',
      '2xl'
    ].includes(value)
  }
};

export const displayProps = {
  isAbsolute: {
    default: false,
    type: Boolean
  },
  isDisabled: {
    default: false,
    type: Boolean
  },
  isFixed: {
    default: false,
    type: Boolean
  },
  isHidden: {
    default: false,
    type: Boolean
  },
  isRelative: {
    default: true,
    type: Boolean
  },
  isVisible: {
    default: true,
    type: Boolean
  }
};

export const eventProps = {
  isClosable: {
    default: false,
    type: Boolean
  },
  isLoading: {
    default: false,
    type: Boolean
  }
};
