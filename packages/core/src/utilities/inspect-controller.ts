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

import { ReactiveController, ReactiveElement } from 'lit';

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
    //const htmlCollection = this.host.renderRoot.children || [];
    // const { 0: firstElement, [htmlCollection.length - 1]: lastElement, ...middleElements } = htmlCollection;
    //console.dir({ htmlCollection, firstElement, lastElement, middleElements });
    //console.dir({ first: firstElement?.getBoundingClientRect(), last: lastElement?.getBoundingClientRect() });
    //console.dir(this.host.renderRoot.firstElementChild?.getBoundingClientRect());
  }

  /**
   * @private
   */
  private createSurroundingElement(): HTMLSpanElement {
    const { registry } = this.host;
    const { description, link, name, scope = '', version = '' } = registry;

    const template = `
      <style>
      .ws-inspector-tag {
        display: inline-block;
        background-color: #edebfc;
        padding: 2px 4px;
        transition: background-color .3s ease-in-out;
      }

      .ws-inspector-space {
        display: inline-block;
        background-color: #fff;
        padding: 2px 4px;
      }

      .ws-inspector-tag:hover {
        background-color: #e2defa;
      }
      </style>
      <span class="ws-inspector-tag" style="border-radius: 4px 0 0 4px">${name}</span>
      <span class="ws-inspector-space">:</span>
      <span class="ws-inspector-tag" style="border-radius: 0 4px 4px 0">${scope}@${version}</span>
    `;

    const tag = document.createElement('a');
    tag.href = link;
    tag.title = description;
    tag.style.display = 'block';
    tag.style.textDecoration = 'none';
    tag.style.backgroundColor = 'transparent';
    tag.style.color = '#3d3d3d';
    tag.style.position = 'absolute';
    tag.style.bottom = '-12px';
    tag.style.left = '45%';
    tag.innerHTML = template;

    return tag;
  }
}
