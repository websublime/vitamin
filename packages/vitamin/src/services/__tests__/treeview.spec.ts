import { createTree } from '@/utils/helpers';

// eslint-disable-next-line import/extensions
import { TreeViewLookupService } from '../treeview-lookup.service';

describe('> Treeview Service', () => {
  let treeViewService: TreeViewLookupService;

  beforeEach(() => {
    treeViewService = new TreeViewLookupService();
  });

  it('# Should...', () => {
    const items = [
      { id: 1, name: 'AAAA', parentId: null},
      { id: 2, name: 'BBBB', parentId: 1},
      { id: 3, name: 'CCCC', parentId: 1},
      { id: 4, name: 'DDDD', parentId: 1},
      { id: 5, name: 'EEEE', parentId: null},
      { id: 6, name: 'FFFF', parentId: 5},
      { id: 7, name: 'GGGG', parentId: 5},
      { id: 8, name: 'HHHH', parentId: 7},
      { id: 9, name: 'IIII', parentId: 8}
    ];

    const tree = createTree({ items });
    // eslint-disable-next-line max-params
    const builder = (collection, id = null, index = null, parentKey = 'parentId') => {
      collection.filter(item => item[parentKey] === id).map(item => {
        if (!treeViewService.hasItem(item.index)) {
          const { item: treeItem = null } = treeViewService.item(index) || {};
          treeViewService.registerItem(item, treeItem);
        }

        if (id || item.children.length) {
          treeViewService.registerChildren(item.index, item.children);
        }

        builder(item.children, item.id, item.index);
      });
    };

    builder(tree);

    expect(true).toBeTruthy();
  });
});
