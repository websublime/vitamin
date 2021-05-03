---
title: Button
dics: Button component
wrapperClass: button-wrap
---

# Vitamin Button Component
----

<div class="my-8">
  <h4 class="text-lg mb-4">Context</h4>
  <p class="text-gray-700 dark:text-gray-100 mb-4">Buttons are used as triggers for actions. Depending on the use case, buttons contain a label and/or an icon. There are a variety of styles, sizes, and variations that can be used for different situations.</p>

  <p class="text-gray-700 dark:text-gray-100 mb-4">All button labels are sentence case. They should be as short as possible while clearly explaining what will happen when the button is clicked.</p>
  <h4 class="text-lg my-4">Types</h4>
  <ul class="list-inside list-disc rounded-xl overflow-hidden bg-gradient-to-r from-purple-50 to-purple-100 p-10">
    <li class="text-green-400">Default</li>
    <li class="text-blue-400">Primary</li>
    <li class="text-red-400">Danger</li>
    <li class="text-green-400">Success</li>
    <li class="text-yellow-400">Warning</li>
  </ul>
</div>

### Button examples

```vue demo
<template>
  <vui-button :isLoading="true" space="md" rounded="md" class="mb-4 mr-4">Loading</vui-button>

  <vui-button type ="success" space="md" rounded="full" class="mb-4 mr-4">
    <ButtonExample><Icon icon="codicon:add" height="16" /></ButtonExample>
  </vui-button>

  <vui-button space="md" rounded="md" class="mb-4 mr-4">Default</vui-button>
  <vui-button type ="info" space="md" rounded="md" class="mb-4 mr-4">Info</vui-button>
  <vui-button type ="danger" space="md" rounded="md" class="mb-4 mr-4">Danger</vui-button>
  <vui-button type ="success" space="md" rounded="md" class="mb-4 mr-4">Success</vui-button>
  <vui-button type ="warning" space="md" rounded="md" class="mb-4 mr-4">Warning</vui-button>

  <vui-button space="sm" rounded="sm" class="mb-4 mr-4">Small</vui-button>
  <vui-button space="md" rounded="md" class="mb-4 mr-4">Medium</vui-button>
  <vui-button space="lg" rounded="md" class="mb-4 mr-4">Large</vui-button>
  <vui-button space="xl" rounded="md" class="mb-4 mr-4">Extra Large</vui-button>

  <vui-button space="md" rounded="md" class="mb-4 mr-4" hasBorder>Border Default</vui-button>
  <vui-button type="info" space="md" rounded="md" class="mb-4 mr-4" hasBorder>Border Default</vui-button>
  <vui-button type="danger" space="md" rounded="md" class="mb-4 mr-4" hasBorder>Border Danger</vui-button>
  <vui-button type="success" space="md" rounded="md" class="mb-4 mr-4" hasBorder>Border Success</vui-button>
  <vui-button type="warning" space="md" rounded="md" class="mb-4 mr-4" hasBorder>Border Warning</vui-button>

  <vui-button space="md" rounded="md" class="mb-4 mr-4" shadow="sm">Shadow Small</vui-button>
  <vui-button type="info" space="md" rounded="md" class="mb-4 mr-4" shadow="md">Shadow Medium</vui-button>
  <vui-button type="danger" space="md" rounded="md" class="mb-4 mr-4" shadow="lg">Shadow large</vui-button>
  <vui-button type="success" space="md" rounded="md" class="mb-4 mr-4" shadow="xl">Shadow extra large</vui-button>
  <vui-button type="warning" space="md" rounded="md" class="mb-4 mr-4" shadow="2xl">Shadow biggest</vui-button>

  <vui-button iconPrefix="mail" type="info" space="md" rounded="md" class="mb-4 mr-4" hasBorder>help@vitamin.com</vui-button>

  <vui-button iconSufix="source-control" type="success" space="md" rounded="md" class="mb-4 mr-4" hasBorder>https://github.com/websublime/vitamin</vui-button>

  <vui-button type="danger" space="md" rounded="md" class="mb-4 mr-4" hasBorder>
    <template #prefixIcon>
      <ButtonExample class="mr-2"><Icon icon="codicon:mail" height="24" /></ButtonExample>
    </template>
    help@vitamin.com
  </vui-button>

  <vui-button type="warning" space="md" rounded="md" class="mb-4 mr-4" hasBorder>
    <template #sufixIcon>
      <ButtonExample class="ml-2"><Icon icon="codicon:source-control" height="24" /></ButtonExample>
    </template>
    https://github.com/websublime/vitamin
  </vui-button>
</template>

<script>
import { Icon } from '@iconify/vue';
import { defineComponent } from 'vue';

const ButtonExample = defineComponent({
  components: {
    Icon
  },
});

export default ButtonExample;
</script>
```

### Attributes

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
        <td class="py-3 px-6 text-left whitespace-nowrap">iconOnly</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button with icon only</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">boolean</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true or false</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">false</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">hasBorder</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button border</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">boolean</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true or false</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">false</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">rounded</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button rounded</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">sm|md|lg|xl|2xl|full|none</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">none</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">shadow</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button shadow</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">sm|md|lg|xl|2xl|none</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">none</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">isLoading</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button state is loading</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">boolean</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true or false</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">false</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">isDisabled</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button disabled</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">boolean</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true or false</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">false</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">type</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button type</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">default|primary|success|info|danger|warning</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">default</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">space</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button padding</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">sm|md|lg|xl</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">sm</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">iconPrefix</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Prefix button with icon</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">iconSufix</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Sufix button with icon</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
      </tr>
    </tbody>
  </table>
</div>

### Events

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
        <td class="py-3 px-6 text-left whitespace-nowrap">click</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Emits click event</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">Exposes <a href="https://developer.mozilla.org/en-US/docs/Web/API/UIEvent">UIEvent</a></td>
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
        <td class="py-3 px-6 text-left whitespace-nowrap">Default slots applies on description</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">prefixIcon</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Prefix icon slot</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">sufixIcon</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Sufix icon slot</td>
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
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-default</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Default color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.200 <span class="bg-gray-200 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-default-hover</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Default color hover</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.300 <span class="bg-gray-300 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-default-border</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Default border color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.400 <span class="bg-gray-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-default-text</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Default text color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.800 <span class="bg-gray-800 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-info</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button info color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.blue.400 <span class="bg-blue-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-info-hover</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button info color hover</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.blue.300 <span class="bg-blue-300 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-info-border</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button info border color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.blue.400 <span class="bg-blue-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-info-text</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button info color text</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.white <span class="bg-white w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-danger</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button danger color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.red.400 <span class="bg-red-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-danger-hover</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button danger color hover</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.red.300 <span class="bg-red-300 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-danger-border</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button danger border color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.red.400 <span class="bg-red-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-danger-text</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button danger color text</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.white <span class="bg-white w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-success</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button success color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.green.400 <span class="bg-green-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-success-hover</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button success color hover</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.green.300 <span class="bg-green-300 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-success-border</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button success border color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.green.400 <span class="bg-green-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-success-text</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button success color text</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.white <span class="bg-white w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-warning</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button warning color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.yellow.400 <span class="bg-yellow-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-warning-hover</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button warning color hover</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.yellow.300 <span class="bg-yellow-300 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-warning-border</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button warning border color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.yellow.400 <span class="bg-yellow-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-color-warning-text</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Button warning color text</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.white <span class="bg-white w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
    </tbody>
  </table>
</div>
