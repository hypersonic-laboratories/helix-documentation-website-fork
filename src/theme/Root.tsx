import React from 'react';
import AtlasChat from '@site/src/components/AtlasChat/AtlasChat';
import '@site/src/components/AtlasChat/atlas-chat.css';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AtlasChat />
    </>
  );
}
