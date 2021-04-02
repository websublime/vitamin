/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

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
