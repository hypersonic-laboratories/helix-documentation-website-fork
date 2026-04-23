import React from 'react';

interface ConceptCalloutProps {
  title: string;
  children: React.ReactNode;
  emoji?: string;
}

export default function ConceptCallout({
  title,
  children,
  emoji = '\uD83D\uDCA1',
}: ConceptCalloutProps): React.ReactElement {
  return (
    <div className="concept-callout">
      <div className="concept-callout__title">
        <span>{emoji}</span> {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
