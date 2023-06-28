/**
|--------------------------------------------------------------------------
| Copyright Websublime All Rights Reserved.
|--------------------------------------------------------------------------
|
| Use of this source code is governed by an MIT-style license that can be
| found in the LICENSE file at https://websublime.dev/license
|
*/

import { ReactiveControllerHost } from 'lit';

/**
 * @public
 */
export class EventController {
  private host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    this.host = host;

    // rome-ignore lint/suspicious/noExplicitAny: <explanation>
    host.addController(this as any);
  }

  async notify(dispatcher: (resolved: boolean) => void) {
    const resolved = await this.host.updateComplete;

    dispatcher(resolved);
  }
}
