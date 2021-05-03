---
title: Card
dics: Card component
wrapperClass: card-wrap
---

# Vitamin Card Component
----

<div class="my-8">
  <h4 class="text-lg mb-4">Context</h4>
  <p class="text-gray-700 dark:text-gray-100 mb-4">A card is a flexible and extensible content container. It includes options for headers and footers, a wide variety of content, contextual background colors, and powerful display options.</p>
</div>

### Card examples

```vue demo
<template>
  <div class="grid grid-cols-3 gap-4 py-6 px-3 bg-gray-100 text-gray-800">
    <vui-card title="My Card" type="success" image="https://via.placeholder.com/450x450">
      <p>My content body</p>
    </vui-card>

    <vui-card title="Card Shadow" shadow="lg" rounded="lg" image="https://via.placeholder.com/450x450">
      <p>Cool shadow</p>
    </vui-card>

    <vui-card title="Card Border" hasBorder rounded="lg" image="https://via.placeholder.com/450x450">
      <p>With border</p>
    </vui-card>

    <vui-card title="Card Footer" hasBorder rounded="lg" image="https://via.placeholder.com/450x450">
      <p>With footer</p>

      <template #footer>
        <vui-button-group>
          <vui-button iconOnly iconPrefix="mail" space="sm" rounded="md" />
          <vui-button iconOnly iconPrefix="device-camera-video" space="sm" rounded="md" />
          <vui-button iconOnly iconPrefix="device-camera" space="sm" rounded="md" />
        </vui-button-group>
      </template>
    </vui-card>

    <vui-card title="Lorem Ipsum" hasBorder rounded="lg" shadow="xl">
      <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </vui-card>

    <vui-card hasBorder>
      <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </vui-card>

    <vui-card class="col-span-3">
      <template #media>
        <img src="https://source.unsplash.com/random">
      </template>

      <template #footer>
        <h3 class="text-2xl mb-4">Some awesome title</h3>

        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
      </template>
    </vui-card>

    <vui-card class="col-span-3" image="https://source.unsplash.com/random/?nature,water">
      <template #footer>
        <h3 class="text-2xl mb-4">Some awesome title</h3>

        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
      </template>
    </vui-card>
  </div>
</template>
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
        <td class="py-3 px-6 text-left whitespace-nowrap">title</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card header title</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">null</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">hasBorder</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card border</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">boolean</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">true or false</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">false</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">rounded</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card rounded</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">sm|md|lg|xl|2xl|full|none</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">none</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">shadow</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card shadow</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">sm|md|lg|xl|2xl|none</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">none</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">image</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Image for media content background</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">-</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">null</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">type</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card type</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">string</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">default|primary|success|info|danger|warning</td>
        <td class="py-3 px-6 text-center whitespace-nowrap">default</td>
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
        <td class="py-3 px-6 text-left whitespace-nowrap">Default slots</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">header</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Header slot</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">media</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Media or middle slots</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">footer</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Footer slot</td>
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
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-background-color</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card background color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.white <span class="bg-white w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-body-padding</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card body padding</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">padding.4</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-header-padding</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card header padding</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">padding.4</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-footer-padding</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card footer padding</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">padding.4</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-border-color</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card border color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.200 <span class="bg-gray-200 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-header-background-color</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card header background color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.50 <span class="bg-gray-50 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-footer-background-color</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card footer background color</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">colors.gray.50 <span class="bg-gray-50 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-media-min-height</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card middle/media content minimal height</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">height.56</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-media-padding</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card middle/media padding</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">padding.4</td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-type-border-height</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card top border type height</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">8px</td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-type-color-info</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card top color info</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">var(--vui-color-info) <span class="bg-blue-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-type-color-success</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card top color success</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">var(--vui-color-success) <span class="bg-green-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-type-color-error</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card top color error</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">var(--vui-color-error) <span class="bg-red-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
      <tr class="border-b border-gray-200 dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-50 hover:bg-gray-100">
        <td class="py-3 px-6 text-left whitespace-nowrap">--vui-card-type-color-warning</td>
        <td class="py-3 px-6 text-left whitespace-nowrap">Card top color warning</td>
        <td class="py-3 px-6 text-center whitespace-nowrap flex justify-end items-center">var(--vui-color-warning) <span class="bg-yellow-400 w-8 h-8 border border-gray-200 inline-block"></span></td>
      </tr>
    </tbody>
  </table>
</div>
