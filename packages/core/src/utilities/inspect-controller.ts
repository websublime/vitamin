/* eslint-disable max-len */
/**
|--------------------------------------------------------------------------
| Copyright Websublime All Rights Reserved.
|--------------------------------------------------------------------------
|
| Use of this source code is governed by an MIT-style license that can be
| found in the LICENSE file at https://websublime.dev/license
|
*/

import type { ReactiveController } from 'lit';

import type { ControllerHost } from '../types/index.js';

import { storage } from './storage.js';

/**
 * Inspector controller can give information about the component
 * metadata. It will also highlight the component when the mouse is over it.
 * A local storage variable (vita-inspector property key) is used to enable/disable the inspector.
 * The inspector will be enabled by default when the component
 * is created if the local storage variable is set or when
 * property inspect is presen in the component.
 *
 * @example
 * ```html
 * <card-component inspect></card-component>
 * ```
 *
 * @public
 */
export class InspectController implements ReactiveController {
  private host: ControllerHost;

  private listeners: Array<Array<string | ((event: MouseEvent) => unknown)>> = [];

  constructor(host: ControllerHost) {
    this.host = host;

    host.addController(this);
  }

  hostConnected() {
    // eslint-disable-next-line unicorn/no-useless-undefined
    const enabled = storage.local.get('vita-inspector', undefined);

    if (enabled) {
      this.host.inspect = true;
      this.hostUpdated();
    }
  }

  hostDisconnected() {
    for (const listener of this.listeners) {
      const [type, listenerFunction] = listener as [string, (event: Event) => unknown];

      if (type && listenerFunction) {
        this.host.removeEventListener(type, listenerFunction);
      }
    }
  }

  hostUpdated() {
    if (this.host.inspect) {
      const tag = document.createElement('div');
      tag.style.fontSize = '12px';
      tag.style.pointerEvents = 'none';

      const inspectMouseOver = (event: MouseEvent) => {
        event.stopImmediatePropagation();
        tag.innerHTML = this.createTemplate();

        document.body.append(tag);
      };

      const inspectMouseOut = (event: MouseEvent) => {
        event.stopImmediatePropagation();
        tag.remove();
      };

      this.host.addEventListener('mouseover', inspectMouseOver);
      this.host.addEventListener('mouseout', inspectMouseOut);

      this.listeners.push(['mouseover', inspectMouseOver], ['mouseout', inspectMouseOut]);
    }
  }

  /**
   * @private
   */
  private createTemplate(): string {
    const rect = this.host.getBoundingClientRect();
    const { offsetHeight, offsetLeft, offsetTop, offsetWidth, registry } = this.host;
    const { name, scope = '', version = '' } = registry;

    const boundary = rect.top <= offsetHeight ? offsetTop + offsetHeight - 10 : offsetTop - 10;

    const template = `
      <style>
      .vita-inspector-highlight {
        z-index: 1;
        position: absolute;
        border-radius: 11px;
        box-sizing: border-box;
        padding: 4px;
        pointer-events: none;
        top: ${offsetTop - 2}px;
        left: ${offsetLeft - 4}px;
        width: ${offsetWidth}px;
        height: ${offsetHeight + 4}px;
      }

      .vita-inspector-highlight:before {
        background: linear-gradient(to left top,#ff6995,#3ecdff);
        border-radius: inherit;
        content: "";
        inset: 0;
        -webkit-mask: linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        padding: 2px;
        position: absolute;
        z-index: -1;
      }

      .vita-inspector-tag {
        position: absolute;
        width: ${offsetWidth}px;
        top: ${boundary}px;
        z-index: 2;
        pointer-events: none;
      }

      .vita-inspector-info {
        display: flex;
        justify-content: center;
        gap: 4px;
        color: white;
        pointer-events: none;
      }

      .vita-pkg-name {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
        pointer-events: none;
      }

      .vita-pkg-version {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        pointer-events: none;
      }

      .vita-pkg-name,
      .vita-pkg-scope,
      .vita-pkg-version {
        background: #bd40f2;
        padding: 2px 4px;
        pointer-events: none;
        font-weight: 400;
      }
      </style>
      <div class="vita-inspector-highlight"></div>
      <div class="vita-inspector-tag">
        <div class="vita-inspector-info">
          <div class="vita-pkg-name">${name}</div>
          <div class="vita-pkg-scope">${scope}</div>
          <div class="vita-pkg-version">${version}</div>
        </div>
      </div>
    `;

    return template;
  }
}
