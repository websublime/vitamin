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

import { ReactiveController, ReactiveElement, html, render } from 'lit';

import { ComponentMetadata } from '../types/index.js';

type InspectControllerHost = ReactiveElement & { inspect: boolean; registry: ComponentMetadata };

/**
 * Inspector element
 * @public
 */
export class InspectController implements ReactiveController {
  private host: InspectControllerHost;

  constructor(host: InspectControllerHost) {
    this.host = host;

    host.addController(this);
  }

  hostConnected() {
    //console.dir(this.host.registry.description);
  }

  hostDisconnected() {
    //console.dir({ host: this.host, name: 'hostDisconnected' });
  }

  hostUpdate() {
    //console.dir({ host: this.host, name: 'hostUpdate' });
  }

  hostUpdated() {
    if (this.host.inspect) {
      const tag = document.createElement('div');
      tag.style.fontSize = '12px';

      this.host.addEventListener('mouseover', (event: MouseEvent) => {
        event.stopPropagation();
        tag.innerHTML = this.createTemplate();

        document.body.append(tag);
      });

      this.host.addEventListener('mouseout', (event: MouseEvent) => {
        event.stopPropagation();
        tag.remove();
      });
    }
  }

  /**
   * @private
   */
  private createTemplate(): string {
    const rect = this.host.getBoundingClientRect();
    const { offsetHeight, offsetLeft, offsetTop, offsetWidth, registry } = this.host;
    const { description, link, name, scope = '', version = '' } = registry;

    const bondary = rect.top <= offsetHeight ? offsetTop + offsetHeight + 4 : offsetTop - 40;

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
        top: ${bondary}px;
      }

      .vita-inspector-info {
        display: flex;
        justify-content: center;
        gap: 4px;
        color: white;
      }

      .vita-pkg-name {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
      }

      .vita-pkg-version {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      .vita-pkg-name,
      .vita-pkg-scope,
      .vita-pkg-version {
        background: #bd40f2;
        padding: 2px 4px;
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
