// ----------------------------------------------------------------------------
// TutorialMeta — small visual header row for tutorial pages.
// Matches the Step badge / time / tag-pill aesthetic of the Essentials cards
// on the Tutorials Home page, so individual tutorial pages don't feel like a
// raw wall of markdown text.
//
// Usage in MDX:
//   import TutorialMeta from '@site/src/components/TutorialMeta';
//   <TutorialMeta status="Coming soon" time="~30 min"
//                 tags={['World', 'Beginner', 'Scripting']} />
// ----------------------------------------------------------------------------

import React from 'react';
import styles from './styles.module.css';

interface Props {
  /** e.g. "Coming soon", "Beta", "New" — leave undefined to omit */
  status?: string;
  /** e.g. "~30 min" */
  time?: string;
  /** e.g. ["World", "Beginner", "Scripting"] */
  tags?: string[];
}

export default function TutorialMeta({status, time, tags = []}: Props) {
  return (
    <div className={styles.meta}>
      {status && <span className={styles.statusBadge}>{status}</span>}
      {time && <span className={styles.timeBadge}>⏱ {time}</span>}
      {tags.map((tag) => (
        <span key={tag} className={styles.tagPill}>{tag}</span>
      ))}
    </div>
  );
}
