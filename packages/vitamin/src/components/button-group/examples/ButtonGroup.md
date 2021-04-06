---
title: ButtonGroup
dics: ButtonGroup component
wrapperClass: button-group-wrap
---

# Vitamin ButtonGroup Component
----

<div class="my-8">
  <h4 class="text-lg mb-4">Context</h4>
  <p class="text-gray-700 dark:text-gray-100 mb-4">Related buttons can be grouped together to show associations and improve clarity.</p>
</div>

### Button group examples

```vue demo
<template>
  <vui-button-group class="mb-4">
    <vui-button type ="info" space="md" rounded="md">Info</vui-button>
    <vui-button type ="info" space="md" rounded="md">Reset</vui-button>
    <vui-button type ="info" space="md" rounded="md">New</vui-button>
    <vui-button type ="info" space="md" rounded="md">Edit</vui-button>
    <vui-button type ="info" space="md" rounded="md">Delete</vui-button>
    <vui-button type ="info" space="md" rounded="md">Announce</vui-button>
  </vui-button-group>

  <vui-button-group class="mb-4">
    <vui-button iconPrefix="mail" type="success" space="sm" rounded="md">Mail</vui-button>
    <vui-button iconPrefix="device-camera-video" type="success" space="sm" rounded="md">Call</vui-button>
    <vui-button iconPrefix="device-camera" type="success" space="sm" rounded="md">Photo</vui-button>
  </vui-button-group>

  <vui-button-group class="mb-4">
    <vui-button iconOnly iconPrefix="mail" type="success" space="sm" rounded="md" />
    <vui-button iconOnly iconPrefix="device-camera-video" type="warning" space="sm" rounded="md" />
    <vui-button iconOnly iconPrefix="device-camera" type="danger" space="sm" rounded="md" />
  </vui-button-group>
</template>
```

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
        <td class="py-3 px-6 text-left whitespace-nowrap">Default slots</td>
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
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-button-group-border-color-separator</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Separator color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.white <span class="bg-white w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
    </tbody>
  </table>
</div>
