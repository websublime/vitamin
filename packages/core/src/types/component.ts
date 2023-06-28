/**
|--------------------------------------------------------------------------
| Copyright Websublime All Rights Reserved.
|--------------------------------------------------------------------------
|
| Use of this source code is governed by an MIT-style license that can be
| found in the LICENSE file at https://websublime.dev/license
|
*/

export interface WebComponentOptions {
  // eslint-disable-next-line no-use-before-define
  [key: string]: unknown;
}

export interface ComponentMixinInterface {
  readonly settings: WebComponentOptions;
  options: WebComponentOptions;
  inspect: boolean;
  isLTR: boolean;
  dir: 'ltr' | 'rtl';
}

export interface ComponentMetadata {
  description: string;
  link: string;
  name: string;
  qa: string;
  scope: string;
  version: string;
}
