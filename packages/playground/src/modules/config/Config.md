<h1 class="text-4xl mb-8">Welcome to Vitamin UI</h1>

<h4 class="text-2xl mb-4">What is Vitamin UI?</h4>
<p class="text-sm mb-6">Vitamin UI is a component library for Vue 3. It is minimal themed by Tailwind with a default theme that is used here in docs. It is almost pure css with the awesome PostCSS. Theme is compiled with minimal and only needed classes for the library. When used on your app backed by Tailwind it will use your config to style it.</p>

<h4 class="text-2xl mb-4">An why another component library?</h4>
<p class="text-sm mb-6">The main propose was learning Vue 3, consolidate acknowledgement on it and css. Also explore Tailwind and offer an open source component based on it. Most of them are payed libs.</p>

<h2 class="text-3xl mb-4">Start</h2>

<p class="text-sm mb-6">Install library from npm with yarn or npm. Node version needed is >= 14.</p>

```bash
yarn add @websublime/vitamin-ui
```

<p class="text-sm my-6">After that, all you need is to define it and use the desired icons from Iconify. Default theme uses codicon.</p>

```typescript
import codicon from '@iconify/json/json/codicon.json';
import Vitamin from '@websublime/vitamin-ui';

app.use(Vitamin, {
  iconifyPack: codicon,
  iconifyPrefix: 'codicon'
});
```

<p class="text-sm my-6">Config your app with Tailwind and you are ready to use it. You can check package <a class="text-blue-700 dark:text-indigo-300 hover:underline" href="https://github.com/websublime/vitamin/tree/main/packages/playground" _blank>playground</a> where demonstrate the use of it and is this documentation site.</p>

<h2 class="text-3xl mb-4">Custom theme</h2>

<p class="text-sm my-6">The library also offers the source files of the base theme. If you prefer customize it you can check on node_modules folder lib the theme folder or import to your base css and override default and global variables. I will document the process to customize it. (WIP)</p>
