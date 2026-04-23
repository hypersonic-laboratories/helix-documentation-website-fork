import React from 'react';

type Authority = 'server' | 'client' | 'both';

interface AuthorityBadgeProps {
  type: Authority;
}

const labels: Record<Authority, { emoji: string; text: string }> = {
  server: { emoji: '\uD83D\uDDA5\uFE0F', text: 'Server' },
  client: { emoji: '\uD83D\uDCBB', text: 'Client' },
  both: { emoji: '\uD83D\uDD04', text: 'Server & Client' },
};

export default function AuthorityBadge({ type }: AuthorityBadgeProps): React.ReactElement {
  const { emoji, text } = labels[type];
  return (
    <span className={`authority-badge authority-badge--${type}`}>
      {emoji} {text}
    </span>
  );
}
