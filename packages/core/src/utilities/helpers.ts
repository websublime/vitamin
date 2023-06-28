/**
|--------------------------------------------------------------------------
| Copyright Websublime All Rights Reserved.
|--------------------------------------------------------------------------
|
| Use of this source code is governed by an MIT-style license that can be
| found in the LICENSE file at https://websublime.dev/license
|
*/

/**
 * Creates a unique identifier
 *
 * @public
 */
export const uniqueID = () => {
  const head = Date.now().toString(36);
  const tail = Math.random().toString(36).slice(2);

  return head + tail;
};

/**
 * Checks if value is an empty object or collection.
 *
 * @public
 */
// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export const isEmpty = (object: any) =>
  [Object, Array].includes(object?.constructor) && Object.entries(object || {}).length === 0;

/**
 * Checks if value is null or undefined.
 *
 * @public
 */
// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export const isNil = (value: any) => value === null || value === undefined;
