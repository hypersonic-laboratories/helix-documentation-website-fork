import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HeroSection() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className="container">
        <h1 className={styles.heroTitle}>
          <span className="hero-gradient">HELIX</span> Documentation
        </h1>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <p className={styles.heroDescription}>
          Everything you need to create multiplayer worlds on Unreal Engine 5 —
          whether you're brand new to game dev or a seasoned modder.
        </p>
        <div className={styles.heroButtons}>
          <Link className="button button--primary button--lg" to="/docs/getting-started/install">
            Get Started
          </Link>
          <Link className="button button--outline button--lg" to="/docs/intro/what-is-helix">
            What is HELIX?
          </Link>
        </div>
      </div>
    </header>
  );
}

interface PathCardProps {
  emoji: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

function PathCard({emoji, title, description, link, linkText}: PathCardProps) {
  return (
    <div className={styles.pathCard}>
      <div className={styles.pathCardEmoji}>{emoji}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to={link}>{linkText} &rarr;</Link>
    </div>
  );
}

function PickYourPath() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Pick Your Path</h2>
        <p className={styles.sectionSubtitle}>
          Where are you coming from? We'll get you up to speed.
        </p>
        <div className={styles.pathGrid}>
          <PathCard
            emoji={"\uD83C\uDF31"}
            title="New to Game Dev"
            description="Never built a game before? No worries. We'll walk you through everything from scratch."
            link="/docs/getting-started/install"
            linkText="Start from zero"
          />
          <PathCard
            emoji={"\uD83C\uDFCE\uFE0F"}
            title="Coming from FiveM"
            description="Already know QBCore and FiveM? You'll feel right at home. Here's what's different."
            link="/docs/migration/from-fivem"
            linkText="FiveM migration guide"
          />
          <PathCard
            emoji={"\uD83E\uDDF1"}
            title="Coming from Roblox"
            description="Used to Roblox Studio and Luau? HELIX uses Lua too, but with the power of Unreal Engine 5."
            link="/docs/migration/from-roblox"
            linkText="Roblox migration guide"
          />
          <PathCard
            emoji={"\u2699\uFE0F"}
            title="UE5 Developer"
            description="Already know your way around Unreal? Jump straight into HELIX-specific APIs and systems."
            link="/docs/scripting/choosing-your-language"
            linkText="Dive into scripting"
          />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Why HELIX?</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <h3>{"\uD83C\uDFAE"} Full Game Engine Power</h3>
            <p>
              Built on Unreal Engine 5 with Nanite, Lumen, World Partition, Chaos Physics,
              and MetaHumans. Not a stripped-down modding tool — the real deal.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>{"\u270D\uFE0F"} Script Your Way</h3>
            <p>
              Use Blueprints for visual scripting, Lua for quick prototyping,
              or JavaScript with the full npm ecosystem. Your choice, your workflow.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>{"\uD83D\uDCB0"} Earn Real Money</h3>
            <p>
              Monetize your worlds with LIX — our platform currency that cashes out
              to real money. Build, publish, and get paid.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>{"\uD83D\uDE80"} Instant Hosting</h3>
            <p>
              One-click server deployment on the HELIX network. No server management,
              no port forwarding, no headaches.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>{"\uD83D\uDCC1"} Own Your Content</h3>
            <p>
              Everything you create is yours. Full IP ownership. Publish to the Vault
              marketplace and share with the community.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>{"\uD83E\uDD16"} Meet Atlas</h3>
            <p>
              Our AI docs companion knows these docs inside and out. Stuck on something?
              Ask Atlas for help anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickLinks() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Quick Links</h2>
        <div className={styles.quickLinksGrid}>
          <Link className={styles.quickLink} to="/docs/core-concepts/actors">
            <strong>Core Concepts</strong>
            <span>Actors, Components, Levels & more</span>
          </Link>
          <Link className={styles.quickLink} to="/api/classes/actor">
            <strong>API Reference</strong>
            <span>Every class, function & enum</span>
          </Link>
          <Link className={styles.quickLink} to="/docs/scripting/choosing-your-language">
            <strong>Scripting Guide</strong>
            <span>Blueprint, Lua & JavaScript</span>
          </Link>
          <Link className={styles.quickLink} to="/docs/qbcore/overview">
            <strong>QBCore</strong>
            <span>RP framework for HELIX</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description={siteConfig.tagline}>
      <HeroSection />
      <main>
        <PickYourPath />
        <FeaturesSection />
        <QuickLinks />
      </main>
    </Layout>
  );
}
