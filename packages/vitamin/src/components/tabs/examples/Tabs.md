---
title: Tabs
dics: Tabs component
wrapperClass: tabs-wrap
---

# Vitamin Tabs Component
----

<div class="my-8">
  <h4 class="text-lg mb-4">Context</h4>
  <p class="text-gray-700 dark:text-gray-100 mb-4">User’s need to flip between multiple focused panes/views of content. Tabs manage stacked panes of content, giving the users the ability to view only the content pane they are interested in. Each tab button has a corresponding content pane. Tabs build on a real world metaphor. The selected state is reinforced with the tab metaphor of a folder physically in front of the others in the set.
</p>
  <ul class="list-inside list-disc rounded-xl overflow-hidden bg-gradient-to-r from-purple-50 to-purple-100 p-10">
    <li class="text-gray-700">You have multiple categories, views, and panes of content, but there is the need to only show one pane at a time.</li>
    <li class="text-gray-700">Tabs are listed in a horizontal row.</li>
    <li class="text-gray-700">Avoid overflowing tabs to new lines.</li>
    <li class="text-gray-700">Tab titles should be short and predictable.</li>
    <li class="text-gray-700">Tab buttons can contain icons, text, both, and even dropdowns.</li>
    <li class="text-gray-700">Tab headings are sentence case. Only the first word and proper nouns are capitalized.</li>
  </ul>
</div>

### Tabs examples

```vue demo
<template>
  <vui-tabs v-model="current" @change="handleTabChange">
    <vui-tab-item label="Tab 1">
      <p class="p-4 text-gray-800">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </vui-tab-item>

    <vui-tab-item label="Tab 2">
      <p class="p-4 text-gray-800">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
    </vui-tab-item>

    <vui-tab-item label="Tab 3">
      <p class="p-4 text-gray-800">But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?</p>
    </vui-tab-item>

    <vui-tab-item label="Tab 4">
      <template #nav>
        <Icon icon="codicon:source-control" height="24" /> My Icon Tab
      </template>

      <p class="p-4 text-gray-800">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>
    </vui-tab-item>
  </vui-tabs>

  <p class="text-gray-900 my-8">Tab: {{ current }} - Changed To: {{ change }}</p>

  <vui-tabs v-model="currentBottomTab" position="bottom" class="mb-4">
    <vui-tab-item label="Sky" id="tab-sky">
      <p class="p-4 text-gray-800">On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.</p>
    </vui-tab-item>

    <vui-tab-item label="Sea" id="tab-sea">
      <p class="p-4 text-gray-800">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </vui-tab-item>
  </vui-tabs>

  <vui-tabs v-model="currentRightTab" position="right" class="mb-4">
    <vui-tab-item label="Fishs" id="tab-fish">
      <p class="p-4 text-gray-800">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
    </vui-tab-item>

    <vui-tab-item label="Animals" id="tab-animal">
      <p class="p-4 text-gray-800">But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?</p>
    </vui-tab-item>
  </vui-tabs>

  <vui-tabs v-model="currentLeftTab" position="left" class="mb-4">
    <vui-tab-item label="Cars" id="tab-car">
      <p class="p-4 text-gray-800">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>
    </vui-tab-item>

    <vui-tab-item label="Places" id="tab-place">
      <p class="p-4 text-gray-800">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
    </vui-tab-item>
  </vui-tabs>
</template>

<script>
import { Icon } from '@iconify/vue';

export default {
  components: {
    Icon
  },
  data() {
    return {
      current: '1',
      currentBottomTab: 'tab-sky',
      currentRightTab: 'tab-fish',
      currentLeftTab: 'tab-car',
      change: null
    };
  },
  methods: {
    handleTabChange(id) {
      this.change = id;
    }
  }
};
</script>
```

```vue demo
<template>
  <vui-tabs v-model="current" :hasBorder="false">
    <vui-tab-item id="tb-one">
      <template #nav>
        <Icon icon="codicon:bug" height="24" /> Bugs
      </template>

      <p class="p-4 text-gray-800">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
    </vui-tab-item>

    <vui-tab-item id="tb-two" :isDisabled="true">
      <template #nav>
        <Icon icon="codicon:gripper" height="24" /> Issues
      </template>

      <p class="p-4 text-gray-800">It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
    </vui-tab-item>

    <vui-tab-item id="tb-three">
      <template #nav>
        <Icon icon="codicon:comment" height="24" /> Discussions
      </template>

      <p class="p-4 text-gray-800">It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
    </vui-tab-item>
  </vui-tabs>
</template>

<script>
import { Icon } from '@iconify/vue';

export default {
  components: {
    Icon
  },
  data() {
    return {
      current: 'tb-one'
    };
  }
};
</script>
```

### VuiTabs Attributes

<div class="dark:bg-gray-900 bg-white shadow-md rounded my-6">
  <table class="min-w-max w-full table-auto">
    <thead>
      <tr class="dark:bg-gray-700 dark:text-gray-300 bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
        <th class="py-3 px-6 text-left">Property</th>
        <th class="py-3 px-6 text-left">Description</th>
        <th class="py-3 px-6 text-center">Type</th>
        <th class="py-3 px-6 text-center">Accepted Values</th>
        <th class="py-3 px-6 text-center">Default</th>
      </tr>
    </thead>
    <tbody class="dark:text-gray-300 text-gray-600 text-sm font-light">
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">activeTab or v-model</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Current active tab</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">'0'</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">hasBorder</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Tab container, nav bordered</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">boolean</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true or false</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">position</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Tab navigation position</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">top|right|bottom|left</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">top</td>
      </tr>
    </tbody>
  </table>
</div>

### VuiTabItem Attributes

<div class="dark:bg-gray-900 bg-white shadow-md rounded my-6">
  <table class="min-w-max w-full table-auto">
    <thead>
      <tr class="dark:bg-gray-700 dark:text-gray-300 bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
        <th class="py-3 px-6 text-left">Property</th>
        <th class="py-3 px-6 text-left">Description</th>
        <th class="py-3 px-6 text-center">Type</th>
        <th class="py-3 px-6 text-center">Accepted Values</th>
        <th class="py-3 px-6 text-center">Default</th>
      </tr>
    </thead>
    <tbody class="dark:text-gray-300 text-gray-600 text-sm font-light">
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">id</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Id to identify current, used on v-model</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">'0'</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">isDisabled</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Disable tab and pane</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">boolean</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true or false</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">false</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">label</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Used for tab label</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
      </tr>
    </tbody>
  </table>
</div>

### VuiTabs Events

<div class="dark:bg-gray-900 bg-white shadow-md rounded my-6">
  <table class="min-w-max w-full table-auto">
    <thead>
      <tr class="dark:bg-gray-700 dark:text-gray-300 bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
        <th class="py-3 px-6 text-left">Event</th>
        <th class="py-3 px-6 text-left">Description</th>
        <th class="py-3 px-6 text-center">Argument</th>
      </tr>
    </thead>
    <tbody class="dark:text-gray-300 text-gray-600 text-sm font-light">
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">change</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Emits tab change event</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">Exposes tab id</td>
      </tr>
    </tbody>
  </table>
</div>

### Slots

<div class="dark:bg-gray-900 bg-white shadow-md rounded my-6">
  <table class="min-w-max w-full table-auto">
    <thead>
      <tr class="dark:bg-gray-700 dark:text-gray-300 bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
        <th class="py-3 px-6 text-left">Slot</th>
        <th class="py-3 px-6 text-left">Description</th>
      </tr>
    </thead>
    <tbody class="dark:text-gray-300 text-gray-600 text-sm font-light">
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">default</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Default slots applies for tab items</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">nav</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Use inside tab item to customize tab label</td>
      </tr>
    </tbody>
  </table>
</div>

### Css

<div class="dark:bg-gray-900 bg-white shadow-md rounded my-6">
  <table class="min-w-max w-full table-auto">
    <thead>
      <tr class="dark:bg-gray-700 dark:text-gray-300 bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
        <th class="py-3 px-6 text-left">Property</th>
        <th class="py-3 px-6 text-left">Description</th>
        <th class="py-3 px-6 text-right">Value</th>
      </tr>
    </thead>
    <tbody class="dark:text-gray-300 text-gray-600 text-sm font-light">
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-tabs-text-color</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Default text color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.800 <span class="bg-gray-800 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-tabs-text-color-inactive</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Default text color for unselected tabs</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.500 <span class="bg-gray-500 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-tabs-border-color</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Default border color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.100 <span class="bg-gray-100 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-tab-border-color-active</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Border for active tab</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.green.500 <span class="bg-green-500 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-tab-active-background-color</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Tab active background color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.white <span class="bg-white w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-pane-active-background-color</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Panes background color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.white <span class="bg-white w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-nav-background</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Tabs navigation background</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.50 <span class="bg-gray-50 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
    </tbody>
  </table>
</div>
