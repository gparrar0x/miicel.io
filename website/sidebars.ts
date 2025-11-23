import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/quick-start',
        'getting-started/deployment',
        'getting-started/environment',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/admin-theme-editor',
        'guides/product-management',
        'guides/user-flows',
        'guides/quick-wins',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/database',
        'architecture/templates',
        'architecture/roadmap',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/orders',
      ],
    },
  ],
};

export default sidebars;
