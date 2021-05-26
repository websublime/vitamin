/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { PropType } from 'vue';

import { SIZES, VARIANTS } from './constants';

export const ComponentShapeProps = {

  /**
   * Bordered element
   */
  border: {
    default: null,
    type: String as PropType<SIZES>,
    validator: (value: SIZES) => [
      SIZES['2XL'],
      SIZES['3XL'],
      SIZES.FULL,
      SIZES.LG,
      SIZES.MD,
      SIZES.NONE,
      SIZES.SM,
      SIZES.XL
    ].includes(value)
  },

  /**
   * Rounded element
   */
  rounded: {
    default: SIZES.NONE,
    type: String as PropType<SIZES>,
    validator: (value: SIZES) => [
      SIZES['2XL'],
      SIZES['3XL'],
      SIZES.FULL,
      SIZES.LG,
      SIZES.MD,
      SIZES.NONE,
      SIZES.SM,
      SIZES.XL
    ].includes(value)
  },

  /**
   * Shadown on element
   */
  shadow: {
    default: SIZES.NONE,
    type: String as PropType<SIZES>,
    validator: (value: SIZES) => [
      SIZES['2XL'],
      SIZES['3XL'],
      SIZES.FULL,
      SIZES.LG,
      SIZES.MD,
      SIZES.NONE,
      SIZES.SM,
      SIZES.XL
    ].includes(value)
  }
};

export const ComponentDisplayProps = {

  /**
   * Position Absolute
   */
  isAbsolute: {
    default: false,
    type: Boolean
  },

  /**
   * Position Fixed
   */
  isFixed: {
    default: false,
    type: Boolean
  },

  /**
   * Visibility hidden
   */
  isHidden: {
    default: false,
    type: Boolean
  },

  /**
   * Position Relative
   */
  isRelative: {
    default: true,
    type: Boolean
  },

  /**
   * Visibility is visible
   */
  isVisible: {
    default: true,
    type: Boolean
  }
};

export const ComponentStateProps = {

  /**
   * Close state
   */
  isClosable: {
    default: false,
    type: Boolean
  },

  /**
   * Disable state
   */
  isDisabled: {
    default: false,
    type: Boolean
  },

  /**
   * Loading State
   */
  isLoading: {
    default: false,
    type: Boolean
  }
};

export const ComponentIconProps = {

  /**
   * Icon name
   */
  icon: {
    default: null,
    type: String
  },

  /**
   * Render icon only
   */
  iconOnly: {
    default: false,
    type: Boolean
  },

  /**
   * Icon to prepend
   */
  iconPrefix: {
    default: null,
    type: String
  },

  /**
   * Icon to append
   */
  iconSufix: {
    default: null,
    type: String
  }
};

export const ComponentVariantProps = {

  /**
   * Type of variant class
   */
  variant: {
    default: VARIANTS.DEFAULT,
    type: String as PropType<VARIANTS>,
    validator: (value: VARIANTS) => [
      VARIANTS.DANGER,
      VARIANTS.DEFAULT,
      VARIANTS.ERROR,
      VARIANTS.INFO,
      VARIANTS.PRIMARY,
      VARIANTS.SECONDARY,
      VARIANTS.SUCCESS,
      VARIANTS.TERTIARY,
      VARIANTS.WARNING
    ].includes(value)
  }
};
