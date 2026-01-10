import React from 'react';
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
            to="/docs/intro">
            Start Reading
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Physical AI & Humanoid Robotics Course Book">
      <HomepageHeader />
      <main>
        <div className="container">
          <div className="row">
            <div className="col col--8 col--offset-2 margin-vert--lg">
               <h2>Welcome to the Course</h2>
               <p>
                 This book serves as the primary resource for the Physical AI & Humanoid Robotics capstone quarter.
                 It covers everything from ROS 2 fundamentals to advanced NVIDIA Isaac simulations and VLA (Vision-Language-Action) models.
               </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
