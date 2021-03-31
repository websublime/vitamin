---
title: Alert
dics: Alert component
wrapperClass: alert-wrap
---

# Vitamin Alert Component
----

<div class="my-8">
  <h4 class="text-lg mb-4">Context</h4>
  <p class="text-gray-700 dark:text-gray-100 mb-4">Users need to be aware of important information related to their current activity.</p>
  <ul class="list-inside list-disc rounded-xl overflow-hidden bg-gradient-to-r from-purple-50 to-purple-100 p-10">
    <li class="text-gray-700">Contextual alerts are positioned above the area or form they relate to.</li>
    <li class="text-gray-700">They are often triggered by a user interaction.</li>
    <li class="text-gray-700">They can be closable and can have other action buttons or links.</li>
  </ul>
  <h4 class="text-lg my-4">Types</h4>
  <ul class="list-inside list-disc rounded-xl overflow-hidden bg-gradient-to-r from-purple-50 to-purple-100 p-10">
    <li class="text-green-400">Success</li>
    <li class="text-blue-400">Info</li>
    <li class="text-yellow-400">Warning</li>
    <li class="text-red-400">Error</li>
  </ul>
</div>


### Alert examples

```vue demo
<template>
  <vui-alert :title="title" :description="description" rounded="md" hasBorder isClosable class="mb-4" />
  <vui-alert :title="title" :description="description" rounded="md" type="success" class="mb-4" hasBorder />
  <vui-alert :title="title" :description="description" rounded="md" type="warning" class="mb-4" hasBorder />
  <vui-alert :title="title" :description="description" rounded="md" type="error" class="mb-4" hasBorder />
  <vui-alert :isClosable="false" shadow="md" class="mb-4">
    <template #title>
      World United
    </template>

    {{ long }}
  </vui-alert>
  <vui-alert :isClosable="false" :withMedia="false" shadow="md" class="mb-4" rounded="md">
    <template #title>
      World Media
    </template>

    {{ long }}
  </vui-alert>
  <vui-alert :isClosable="false" :withMedia="false" shadow="lg" class="mb-4" rounded="md">
    {{ long }}
  </vui-alert>
  <vui-alert :isClosable="false" type="error" shadow="lg" class="mb-4" rounded="md">
    <template #title>
      World Alert
    </template>
  </vui-alert>
  <vui-alert :isClosable="false" :withMedia="false" type="error" hasBorder class="mb-4" rounded="md">
    <template #title>
      World Alert
    </template>
  </vui-alert>
</template>

<script>
export default {
  data() {
    return {
      title: 'Hello',
      description: 'Once upo an time, a javascript boy',
      long: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
  }
}
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
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">hasBorder</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Box light border</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">boolean</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true or false</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">false</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">isClosable</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Enable close button</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">boolean</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true or false</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">description</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Alert description text</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">rounded</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Alert rounded</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">sm|md|lg|xl|2xl|none</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">none</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">shadow</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Alert shadow</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">sm|md|lg|xl|2xl|none</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">none</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">withMedia</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Alert type icon</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">boolean</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true or false</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">title</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Alert title</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">type</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Alert type</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">success|info|error|warning</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">info</td>
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
        <td class="py-3 px-6 text-left whitespace-nowrap">close</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Emits close event</td>
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
        <td class="py-3 px-6 text-left whitespace-nowrap">title</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Title slot</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">media</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Media slot</td>
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
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-color-info</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Info color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.blue.400 <span class="bg-blue-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-color-success</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Success color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.green.400 <span class="bg-green-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-color-error</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Error color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.red.400 <span class="bg-red-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-color-warning</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Warning color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.yellow.400 <span class="bg-yellow-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-color-padding</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Color padding width</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">padding.4 (1rem)</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-color-title</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Color title</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.900 <span class="bg-gray-900 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-title-size</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Title font size</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">fontSize.lg (1.125rem)</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-title-line</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Title line height</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">lineHeight.7 (1.75rem)</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-color-description</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Color description</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.400 <span class="bg-gray-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-description-size</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Description font size</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">fontSize.sm (0.875rem)</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-description-line</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Description line height</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">lineHeight.5 (1.25rem)</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-media-background</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Media background color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">backgroundColor.transparent <span class="bg-transparent w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-media-color</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Media color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">textColor.white <span class="bg-white w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-alert-description-padding</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Media padding</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">padding[3.5] (0.875rem)</td>
      </tr>
    </tbody>
  </table>
</div>
