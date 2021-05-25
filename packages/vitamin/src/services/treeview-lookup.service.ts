/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { ItemLookup, TreeItem, TreeItemLookup } from './types';

const nodeIndex = (item: TreeItem): string => (item || <TreeItem>{}).index;
const INDEX_REGEX = /\d+$/;

export class TreeViewLookupService {
  private map: Map<string, ItemLookup> = new Map();

  public reset(): void {
    this.map.clear();
  }

  public registerItem(item: TreeItem, parent?: TreeItem): void {
    const currentLookup = <ItemLookup>{
      children: [],
      item,
      parent: this.item(nodeIndex(parent))
    };

    this.map.set(item.index, currentLookup);
  }

  public registerChildren(index: string, children: TreeItem[]): void {
    const item = this.item(index);

    if (!item) { return; }

    item.children = children;
  }

  public unregisterItem(index: string, dataItem: any): void {
    const current = this.item(index);

    if (current && current.item.dataItem === dataItem) {
      this.map.delete(index);

      if (current.parent && current.parent.children) {
        current.parent.children = current.parent.children.filter(item => item.dataItem !== dataItem);
      }
    }
  }

  public replaceItem(index: string, item: TreeItem, parent?: TreeItem): void {
    if (!item) {
      return;
    }

    this.unregisterItem(index, item.dataItem);
    this.registerItem(item, parent);
    this.addToParent(item, parent);
  }

  public itemLookup(index: string): TreeItemLookup {
    const item = this.item(index);

    if (!item) { return null; }

    return <TreeItemLookup>{
      children: this.mapChildren(item.children),
      item: item.item,
      parent: item.parent
    };
  }

  public hasItem(index: string): boolean {
    return this.map.has(index);
  }

  public item(index: string): ItemLookup {
    return this.map.get(index) || null;
  }

  private addToParent(item: any, parent: any): void {
    if (parent) {
      const parentItem = this.item(parent.index);
      const index = parseInt(INDEX_REGEX.exec(item.index)[0], 10);
      parentItem.children = parentItem.children || [];

      parentItem.children.splice(index, 0, item);
    }
  }

  private mapChildren(children: TreeItem[] = []): TreeItemLookup[] {
    return children.map(child => {
      const { children, item, parent } = this.item(child.index);

      return {
        children: this.mapChildren(children),
        item,
        parent
      };
    });
  }
}
