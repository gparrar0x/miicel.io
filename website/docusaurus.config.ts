import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Vendio Documentation',
  tagline: 'Multi-tenant E-commerce Platform',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://sw-commerce-vendio.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'skywalking', // Usually your GitHub org/user name.
  projectName: 'sw_commerce_vendio', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Vendio Docs',
      logo: {
        alt: 'Vendio Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://sw-commerce-vendio.vercel.app',
          label: 'Live App',
          position: 'right',
        },
        {
          href: 'https://github.com/skywalking/sw_commerce_vendio',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started/quick-start',
            },
            {
              label: 'Deployment Guide',
              to: '/getting-started/deployment',
            },
            {
              label: 'API Reference',
              to: '/api/orders',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Live Application',
              href: 'https://sw-commerce-vendio.vercel.app',
            },
            {
              label: 'GitHub Repository',
              href: 'https://github.com/skywalking/sw_commerce_vendio',
            },
            {
              label: 'Roadmap',
              to: '/architecture/roadmap',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Skywalking.dev. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
