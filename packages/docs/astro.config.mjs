import { defineConfig } from 'astro/config';
// eslint-disable-next-line import/no-unresolved
import starlight from '@astrojs/starlight';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  base: '/vitamin',
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  integrations: [
    starlight({
      customCss: ['/src/theme/base.css'],
      sidebar: [{
        items: [
        // Each item here is one entry in the navigation menu.
        {
          label: 'Example Guide',
          link: '/guides/example/'
        }],
        label: 'Guides'
      }, {
        autogenerate: {
          directory: 'reference'
        },
        label: 'Reference'
      }],
      social: {
        github: 'https://websublime.github.io/vitamin'
      },
      title: 'Vitamin UI'
    }),
    tailwind({ applyBaseStyles: false, config: './tailwind.config.cjs' }),
    {
      hooks: {
        'astro:config:setup': ({ injectScript }) => {
          injectScript('page', `document.getElementsByTagName('html')[0].setAttribute('theme', 'orizon');`);
        }
      },
      name: '@websublime/vitamin-docs-theme'
    }
  ],
  site: 'https://websublime.github.io'
});