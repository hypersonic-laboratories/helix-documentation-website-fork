import React from 'react';

interface DownloadTemplateProps {
  name: string;
  description: string;
  href: string;
}

export default function DownloadTemplate({
  name,
  description,
  href,
}: DownloadTemplateProps): React.ReactElement {
  return (
    <div style={{marginBottom: '16px'}}>
      <a className="download-template" href={href} target="_blank" rel="noopener noreferrer">
        {'\u2B07'} {name}
      </a>
      <p style={{marginTop: '4px', fontSize: '0.9rem', opacity: 0.7}}>{description}</p>
    </div>
  );
}
