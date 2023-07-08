import { defineConfig } from 'astro/config';
// eslint-disable-next-line import/no-unresolved
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  base: '/vitamin',
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  integrations: [
    starlight({
      sidebar: [
        {
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Example Guide', link: '/guides/example/' },
          ],
          label: 'Guides'
        },
        {
          autogenerate: { directory: 'reference' },
          label: 'Reference'
        }
      ],
      social: {
        github: 'https://github.com/withastro/starlight',
      },
      title: 'My Docs'
    })
  ],

  site: 'https://websublime.github.io'
});
