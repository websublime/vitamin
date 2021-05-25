export interface TreeItem {

  /**
   * The data item that is bound to the TreeView node
   */
  dataItem: any;

  /**
   * The auto-generated hierarchical index of the TreeView node
   */
  index: string;
}

/**
 * Represents a node-tree lookup structure which persists information
 * about the current node and about its parent and children nodes
 */
export interface ItemLookup {

  /**
   * The current TreeItem instance
   */
  item: TreeItem;

  /**
   * The children of the current node
   */
  children?: TreeItem[];

  /**
   * The parent of the current node
   */
  parent?: ItemLookup;
}

/**
* Represents a node-tree lookup structure which persists information about
* the current node and about its parent and children nodes.
*/
export interface TreeItemLookup {

  /**
   *  The current TreeItem instance.
   */
  item: TreeItem;

  /**
   * The lookup details for the parent of the current TreeView node.
   */
  parent?: ItemLookup;

  /**
   *  The lookup details for the children of the current TreeView node.
   */
  children?: TreeItemLookup[];
}
