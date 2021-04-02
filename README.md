<p align="center">
  <img src="./logo.svg" alt="vitamin"/>
</p>

<p align="center">
  <img style="display: inline; margin: 0 6px" alt="GitHub issues" src="https://img.shields.io/github/issues/websublime/vitamin?style=flat-square">
  <img style="display: inline; margin: 0 6px" alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/websublime/vitamin?style=flat-square">
  <img style="display: inline; margin: 0 6px" alt="GitHub" src="https://img.shields.io/github/license/websublime/vitamin?style=flat-square">
</p>


<p align="center">💊 Vitamin - A Vue.js 3.0 UI library</p>

* 💪 Vue 3.0 Composition API
* 🔥 Written in TypeScript
* 🎨 TailwindCss
-----

## ⛓ Installation (WIP)

Install library with npm or yarn

```bash
yarn add @websublime/vitamin-ui
```

## 🧮 Usage

Choose your desired icons from Iconify.

```ts
import codicon from '@iconify/json/json/codicon.json';
import Vitamin from '@websublime/vitamin-ui';

app.use(Vitamin, {
  iconifyPack: codicon,
  iconifyPrefix: 'codicon'
});
```

## ⚒ Develop

Clone project and install with yarn because we use monorepo style.

Run with start

## 🦾 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## 📝 License
[MIT](https://choosealicense.com/licenses/mit/)
