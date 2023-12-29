/**
|--------------------------------------------------------------------------
| Copyright Websublime All Rights Reserved.
|--------------------------------------------------------------------------
|
| Use of this source code is governed by an MIT-style license that can be
| found in the LICENSE file at https://websublime.dev/license
|
*/

import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * @public
 */
export class EventController implements ReactiveController {
  private host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    this.host = host;

    host.addController(this);
  }

  async notify(dispatcher: (resolved: boolean) => void) {
    const resolved = await this.host.updateComplete;

    dispatcher(resolved);
  }

  hostConnected() {}

  hostDisconnected() {}

  hostUpdate() {}

  hostUpdated() {}
}
