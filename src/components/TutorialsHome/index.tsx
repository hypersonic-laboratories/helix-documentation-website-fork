// ----------------------------------------------------------------------------
// TutorialsHome — the merged tutorials-home content (Kostas's prototype
// structure + Jack's audience-router section), rendered as the docs landing
// page at /docs/.
//
// This component is intentionally Layout-less. It's meant to be embedded
// inside a Docusaurus docs page (so the doc's sidebar + top nav wrap it
// automatically). For the redirect from `/` see src/pages/index.tsx, and for
// the doc that hosts this component see docs/learn-to-create.mdx.
//
// COPY NOTE: tutorial titles, section copy, and topic-card link labels are
// ported verbatim from Kostas's prototype. Some terminology may need a HELIX
// content pass later — e.g. "Avatar" probably wants to be "Character" since
// HELIX doesn't use the Roblox-style "avatar" term, and some sub-tutorial
// links are placeholders Kostas borrowed from create.roblox.com/docs/tutorials
// that don't yet (or won't) map to real HELIX features.
//
// Links are deliberately set to "#" for now — we'll wire them as content
// gets ported into the merged site.
// ----------------------------------------------------------------------------

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// ----------------------------------------------------------------------------
// Hero — Kostas's copy, Jack's CTA buttons
// ----------------------------------------------------------------------------
function HeroSection() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <h1 className={styles.heroTitle}>
          Learn to Create on <span className="hero-gradient">HELIX</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Follow step-by-step tutorials to build worlds, characters, wearables,
          and more. Start with the essentials, then explore deeper topics at
          your own pace.
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

// ----------------------------------------------------------------------------
// Pick Your Path — kept verbatim from Jack's original homepage. Per Kostas's
// own annotated mock, this section is meant to live inside the merged page.
// ----------------------------------------------------------------------------
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
      {/* No eyebrow on this section — Pick Your Path keeps Jack's original
          "title + one-line subtitle" treatment from the prototype. */}
      <h2 className={styles.sectionTitle}>Pick Your Path</h2>
      <p className={styles.sectionSubtitle}>
        Where are you coming from? We'll get you up to speed.
      </p>
      <div className={styles.pathGrid}>
        <PathCard
          emoji={"🌱"}
          title="New to Game Dev"
          description="Never built a game before? No worries. We'll walk you through everything from scratch."
          link="/docs/getting-started/install"
          linkText="Start from zero"
        />
        <PathCard
          emoji={"🏎️"}
          title="Coming from FiveM"
          description="Already know QBCore and FiveM? You'll feel right at home. Here's what's different."
          link="/docs/migration/from-fivem"
          linkText="FiveM migration guide"
        />
        <PathCard
          emoji={"🧱"}
          title="Coming from Roblox"
          description="Used to Roblox Studio and Luau? HELIX uses Lua too, but with the power of Unreal Engine 5."
          link="/docs/migration/from-roblox"
          linkText="Roblox migration guide"
        />
        <PathCard
          emoji={"⚙️"}
          title="UE5 Developer"
          description="Already know your way around Unreal? Jump straight into HELIX-specific APIs and systems."
          link="/docs/scripting/choosing-your-language"
          linkText="Dive into scripting"
        />
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Essentials — three numbered tutorial cards
// ----------------------------------------------------------------------------
interface EssentialCardProps {
  step: number;
  time: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
}

function EssentialCard({step, time, title, description, tags, link}: EssentialCardProps) {
  return (
    <div className={styles.essentialCard}>
      <div className={styles.essentialCardHeader}>
        <span className={styles.stepBadge}>Step {step}</span>
        <span className={styles.timeBadge}>{time}</span>
      </div>
      <h3 className={styles.essentialCardTitle}>{title}</h3>
      <p className={styles.essentialCardDesc}>{description}</p>
      <div className={styles.tagPills}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tagPill}>{tag}</span>
        ))}
      </div>
      <Link to={link} className={styles.startTutorialLink}>
        Start tutorial &rarr;
      </Link>
    </div>
  );
}

function Essentials() {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <p className={styles.sectionEyebrow}>Essentials</p>
      <h2 className={styles.sectionTitle}>Start with these three tutorials</h2>
      <div className={styles.essentialsGrid}>
        <EssentialCard
          step={1}
          time="~30 min"
          title="Create Your First Experience"
          description="Build a simple multiplayer world from scratch — spawn characters, add vehicles, create a basic UI, and test it locally."
          tags={['World', 'Beginner', 'Scripting']}
          link="/docs/start-here/create-your-first-experience"
        />
        <EssentialCard
          step={2}
          time="~20 min"
          title="Create Your First Avatar"
          description="Import or create a custom character mesh, set up animations, and bring your avatar to life in HELIX."
          tags={['Character', 'Beginner', '3D']}
          link="/docs/start-here/create-your-first-avatar"
        />
        <EssentialCard
          step={3}
          time="~25 min"
          title="Create Your First Wearable"
          description="Design and import a custom clothing item — jackets, accessories, or gear — and test it on your character."
          tags={['Wearable', 'Beginner', 'Blender']}
          link="/docs/start-here/create-your-first-wearable"
        />
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// By Topic — nine emoji-led category cards
// ----------------------------------------------------------------------------
interface TopicLink {
  label: string;
  to: string;
}

interface TopicCardProps {
  emoji: string;
  title: string;
  tagline: string;
  links: TopicLink[];
}

function TopicCard({emoji, title, tagline, links}: TopicCardProps) {
  return (
    <div className={styles.topicCard}>
      <div className={styles.topicEmoji}>{emoji}</div>
      <h3 className={styles.topicTitle}>{title}</h3>
      <p className={styles.topicTagline}>{tagline}</p>
      <ul className={styles.topicLinks}>
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to}>&rarr; {l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ByTopic() {
  return (
    <section className={styles.section}>
      <p className={styles.sectionEyebrow}>By Topic</p>
      <h2 className={styles.sectionTitle}>Explore tutorials by what you want to build</h2>
      <div className={styles.topicGrid}>
        <TopicCard
          emoji="🗺️"
          title="Maps & Environments"
          tagline="Build immersive worlds"
          links={[
            {label: 'Import maps from Blender', to: '#'},
            {label: 'Import maps from Fab', to: '#'},
            {label: 'Add collisions & doors', to: '#'},
            {label: 'Default materials system', to: '#'},
            {label: 'Player starts & testing', to: '#'},
          ]}
        />
        <TopicCard
          emoji="🧑"
          title="Characters & Avatars"
          tagline="Custom player models"
          links={[
            {label: 'Create character from scratch', to: '#'},
            {label: 'Import from Fab marketplace', to: '#'},
            {label: 'AI-generated characters (Meshy)', to: '#'},
            {label: 'Advanced: Physics bones', to: '#'},
            {label: 'MetaHuman face/head', to: '#'},
          ]}
        />
        <TopicCard
          emoji="👕"
          title="Wearables & Clothing"
          tagline="Fashion & accessories"
          links={[
            {label: 'Import from Marvelous Designer', to: '#'},
            {label: 'Import from Blender', to: '#'},
            {label: 'Default clothing materials', to: '#'},
            {label: 'Accessories (hats, chains, etc)', to: '#'},
            {label: 'Testing in Build Mode', to: '#'},
          ]}
        />
        <TopicCard
          emoji="💃"
          title="Animations"
          tagline="Bring characters to life"
          links={[
            {label: 'Browse default animations', to: '#'},
            {label: 'Import from Mixamo', to: '#'},
            {label: 'Import from Fab', to: '#'},
            {label: 'AI: Video to animation', to: '#'},
            {label: 'Using custom anims in Lua', to: '#'},
          ]}
        />
        <TopicCard
          emoji="🚗"
          title="Vehicles"
          tagline="Cars, bikes & more"
          links={[
            {label: 'Convert FBX to HVehicle', to: '#'},
            {label: 'Assign materials & lights', to: '#'},
            {label: 'Adjust physics properties', to: '#'},
            {label: 'Testing in Build Mode', to: '#'},
          ]}
        />
        <TopicCard
          emoji="🎨"
          title="User Interface"
          tagline="Menus, HUDs & overlays"
          links={[
            {label: 'Core-UI with Lua', to: '#'},
            {label: 'UMG (Unreal native UI)', to: '#'},
            {label: 'WebUI (HTML/CSS/JS)', to: '#'},
            {label: 'CEF inspector debugging', to: '#'},
            {label: 'Multi-UI management', to: '#'},
          ]}
        />
        <TopicCard
          emoji="📝"
          title="Scripting"
          tagline="Lua, Blueprints & logic"
          links={[
            {label: 'Scripting basics (Lua)', to: '#'},
            {label: 'Intro to UnLua', to: '#'},
            {label: 'Blueprint fundamentals', to: '#'},
            {label: 'BP ↔ Lua interop', to: '#'},
            {label: 'Hot reload & debugging', to: '#'},
          ]}
        />
        <TopicCard
          emoji="🖥️"
          title="Servers & Hosting"
          tagline="Go live with your world"
          links={[
            {label: 'Host a dedicated server', to: '#'},
            {label: 'One-click cloud deploy', to: '#'},
            {label: 'Access permissions', to: '#'},
            {label: 'Monitor with Nucleus', to: '#'},
            {label: 'Restart & update workflow', to: '#'},
          ]}
        />
        <TopicCard
          emoji="🏠"
          title="Shells & Prefabs"
          tagline="Reusable interior spaces"
          links={[
            {label: 'Create a shell package', to: '#'},
            {label: 'Add doors & player starts', to: '#'},
            {label: 'Load shells via Lua', to: '#'},
            {label: 'Use default materials', to: '#'},
          ]}
        />
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Deep Dives — four wider learning-path cards
// ----------------------------------------------------------------------------
interface DeepDiveCardProps {
  lessonCount: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
}

function DeepDiveCard({lessonCount, title, description, tags, link}: DeepDiveCardProps) {
  return (
    <Link to={link} className={styles.deepDiveCard}>
      <div className={styles.lessonCountBadge}>{lessonCount}</div>
      <h3 className={styles.deepDiveTitle}>{title}</h3>
      <p className={styles.deepDiveDesc}>{description}</p>
      <div className={styles.tagPills}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tagPill}>{tag}</span>
        ))}
      </div>
    </Link>
  );
}

function DeepDives() {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <p className={styles.sectionEyebrow}>Deep Dives</p>
      <h2 className={styles.sectionTitle}>Comprehensive learning paths</h2>
      <div className={styles.deepDiveGrid}>
        <DeepDiveCard
          lessonCount="10+ lessons"
          title="Scripting & Blueprints Mastery"
          description="Go from zero to advanced HELIX scripting. Learn Lua, UnLua, Blueprints, networking, and how to build complex game systems."
          tags={['Lua', 'Blueprints', 'UnLua', 'Networking', 'Events']}
          link="#"
        />
        <DeepDiveCard
          lessonCount="8+ lessons"
          title="Custom Assets Pipeline"
          description="Master the full asset creation workflow — from Blender/Fab to packaged, published content on the Vault."
          tags={['Blender', 'Fab', 'Materials', 'Packaging', 'Vault']}
          link="#"
        />
        <DeepDiveCard
          lessonCount="6+ lessons"
          title="Full RP Server Setup"
          description="Build a complete roleplay server from scratch using QBCore — configure jobs, install scripts, deploy hosting, and manage players."
          tags={['QBCore', 'Dedicated Server', 'Nucleus', 'Config']}
          link="#"
        />
        <DeepDiveCard
          lessonCount="4+ lessons"
          title="Publish & Monetize"
          description="Learn how to package, publish, and monetize your worlds and content through Creator Hub and the Vault."
          tags={['Creator Hub', 'LIX', 'Vault', 'CI/CD']}
          link="#"
        />
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Default export: composed page (no Layout — host page provides that)
// ----------------------------------------------------------------------------
export default function TutorialsHome(): React.ReactElement {
  return (
    <div className={styles.tutorialsHome}>
      <HeroSection />
      <PickYourPath />
      <Essentials />
      <ByTopic />
      <DeepDives />
    </div>
  );
}
