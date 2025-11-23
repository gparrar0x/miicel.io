import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/quick-start">
            Get Started - 5min ⏱️
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/architecture/overview">
            Architecture Overview
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>Templates</h3>
              <p>
                Ready-made storefront templates optimized for different business types: 
                Gallery, Detail, Minimal, and Restaurant.
              </p>
              <Link to="/docs/architecture/templates">Learn more →</Link>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>Theme Editor</h3>
              <p>
                Customize colors, typography, and layout with our intuitive admin interface. 
                Changes apply in real-time with live preview.
              </p>
              <Link to="/docs/guides/admin-theme-editor">Learn more →</Link>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>Multi-Tenant</h3>
              <p>
                Each business gets isolated data, custom themes, and independent inventory. 
                Built for scale from day one.
              </p>
              <Link to="/docs/architecture/overview">Learn more →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Complete documentation for Vendio - Multi-tenant e-commerce platform with dynamic template system">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
