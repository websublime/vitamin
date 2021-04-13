/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { Component, ComponentInternalInstance, Fragment, VNode } from 'vue';

/**
 * Mobile detection
 * https://www.abeautifulsite.net/detecting-mobile-devices-with-javascript
 */
export const isMobile = {
  Android: () => typeof window !== 'undefined' && window.navigator.userAgent.match(/Android/i),
  BlackBerry: () => typeof window !== 'undefined' && window.navigator.userAgent.match(/BlackBerry/i),
  Opera: () => typeof window !== 'undefined' && window.navigator.userAgent.match(/Opera Mini/i),
  Windows: () => typeof window !== 'undefined' && window.navigator.userAgent.match(/IEMobile/i),
  any: () => isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows(),
  iOS: () => typeof window !== 'undefined' && window.navigator.userAgent.match(/iPhone|iPad|iPod/i)
};

export const isObject = (item: any): boolean => typeof item === 'object' && !Array.isArray(item);

export const merge = <T = any>(target: any, source: any, deep = false): T => {
  if (deep || !Object.assign) {
    const isDeep = (prop) =>
      isObject(source[prop]) &&
          target !== null &&
          Object.prototype.hasOwnProperty.call(target, prop) &&
          isObject(target[prop]);

    let replaced;

    if (source === null || typeof source === 'undefined') {
      replaced = false;
    } else {
      replaced = Object.getOwnPropertyNames(source)
        .map((prop) => ({ [prop]: isDeep(prop)
          ? merge(target[prop], source[prop], deep)
          : source[prop] }))
        .reduce((accumulator, item) => ({ ...accumulator, ...item }), {});
    }
    return {
      ...target,
      ...replaced
    };
  } else {
    return Object.assign(target, source);
  }
};

export const useId = (size = 3) => {
  let uuid = '';
  const dictionary = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < size; i++) {
    uuid += dictionary.charAt(Math.floor(Math.random() * dictionary.length));
  }

  return uuid;
};

export const findViewChildren = (key: string, vnode: ArrayLike<VNode>) => Array.from(vnode)
  .reduce<ComponentInternalInstance[]>((acc, node) => {
  const { component, type } = node;
  const { name = type } = (type as Component);

  if (name === key && component) {
    acc.push(component);
  } else if(name === Fragment || name === 'template') {
    acc = [...acc, ...findViewChildren(key, node.children as ArrayLike<VNode>)];
  }

  return acc;
}, []);

export const slugify = (...args: (string | number)[]): string => {
  const value = args.join(' ');

  return value
    .normalize('NFD') // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, '-'); // separator
};
