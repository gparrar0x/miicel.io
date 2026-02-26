import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Heading from '@theme/Heading'
import Layout from '@theme/Layout'
import clsx from 'clsx'
import type { ReactNode } from 'react'

import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/getting-started/quick-start">
            Get Started - 5min ⏱️
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/architecture/overview"
          >
            Architecture Overview
          </Link>
        </div>
      </div>
    </header>
  )
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
                Ready-made storefront templates optimized for different business types: Gallery,
                Detail, Minimal, and Restaurant.
              </p>
              <Link to="/architecture/templates">Learn more →</Link>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>Theme Editor</h3>
              <p>
                Customize colors, typography, and layout with our intuitive admin interface. Changes
                apply in real-time with live preview.
              </p>
              <Link to="/guides/admin-theme-editor">Learn more →</Link>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>Multi-Tenant</h3>
              <p>
                Each business gets isolated data, custom themes, and independent inventory. Built
                for scale from day one.
              </p>
              <Link to="/architecture/overview">Learn more →</Link>
            </div>
          </div>
        </div>
        <div className="row margin-top--lg">
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>Testing</h3>
              <p>
                50+ Playwright E2E tests with comprehensive coverage. Test your changes with
                confidence.
              </p>
              <Link to="/guides/quick-wins">Learn more →</Link>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>Deployment</h3>
              <p>
                Deploy to Vercel in minutes. Complete setup guide with environment variables,
                webhooks, and monitoring.
              </p>
              <Link to="/getting-started/deployment">Learn more →</Link>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>API Reference</h3>
              <p>
                Complete API documentation for orders, products, and tenant management. Integrate
                with your existing systems.
              </p>
              <Link to="/api/orders">Learn more →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Complete documentation for Vendio - Multi-tenant e-commerce platform with dynamic template system"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section className="margin-top--xl">
          <div className="container">
            <div className="row">
              <div className="col col--offset-2 col--8">
                <div className="card">
                  <div className="card__header">
                    <h2>Quick Links</h2>
                  </div>
                  <div className="card__body">
                    <ul>
                      <li>
                        <Link to="/getting-started/quick-start">Quick Start Guide</Link> - Get up
                        and running in 5 minutes
                      </li>
                      <li>
                        <Link to="/getting-started/deployment">Deployment Guide</Link> - Deploy to
                        production on Vercel
                      </li>
                      <li>
                        <Link to="/guides/user-flows">User Flows</Link> - Understand how users
                        interact with Vendio
                      </li>
                      <li>
                        <Link to="/architecture/roadmap">Product Roadmap</Link> - See what's coming
                        next
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
