import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'HELIX Documentation',
  tagline: 'Build Worlds. Script Anything. Own Everything.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.helixgame.com',
  baseUrl: '/',

  organizationName: 'hypersonic-laboratories',
  projectName: 'new-docs',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Tomorrow:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
      },
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/hypersonic-laboratories/new-docs/edit/develop/',
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly' as const,
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'api',
        path: 'api',
        routeBasePath: 'api',
        sidebarPath: './sidebarsApi.ts',
        editUrl: 'https://github.com/hypersonic-laboratories/new-docs/edit/develop/',
      },
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexDocs: true,
        indexPages: true,
        docsRouteBasePath: ['docs', 'api'],
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchBarShortcutHint: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/helix-social-card.jpg',
    metadata: [
      {name: 'keywords', content: 'HELIX, game development, UE5, Unreal Engine, modding, FiveM, roleplay, sandbox, Lua, JavaScript, Blueprint'},
      {name: 'description', content: 'Official documentation for HELIX - the open-world multiplayer sandbox platform built on Unreal Engine 5. Create, script, and monetize your own game worlds.'},
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'HELIX',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guideSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/roadmap',
          label: 'Roadmap',
          position: 'left',
          activeBaseRegex: '/docs/roadmap',
        },
        {
          to: '/docs/changelog',
          label: 'Changelog',
          position: 'left',
          activeBaseRegex: '/docs/changelog',
        },
        {
          href: 'https://helixgame.com/news',
          label: 'News',
          position: 'left',
        },
        {
          to: '/api/classes/actor',
          label: 'API Reference',
          position: 'left',
          activeBaseRegex: '/api/',
        },
        {
          href: 'https://discord.gg/helixgame',
          label: 'Discord',
          position: 'right',
        },
        {
          href: 'https://helixgame.com',
          label: 'HELIX',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {label: 'Getting Started', to: '/docs/getting-started/install'},
            {label: 'Core Concepts', to: '/docs/core-concepts/actors'},
            {label: 'Scripting Guide', to: '/docs/scripting/choosing-your-language'},
            {label: 'API Reference', to: '/api/classes/actor'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Discord', href: 'https://discord.gg/helixgame'},
            {label: 'YouTube', href: 'https://www.youtube.com/@play_HELIX'},
            {label: 'Reddit', href: 'https://www.reddit.com/r/play_HELIX/'},
            {label: 'Twitter', href: 'https://twitter.com/play_helix'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'HELIX Website', href: 'https://helixgame.com'},
            {label: 'Vault', href: 'https://helixgame.com/vault'},
            {label: 'GitHub', href: 'https://github.com/hypersonic-laboratories/new-docs'},
          ],
        },
      ],
      copyright: `\u00a9 ${new Date().getFullYear()} HELIX\u00ae is a registered trademark of Hypersonic Laboratories.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['lua', 'json', 'bash', 'typescript'],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
