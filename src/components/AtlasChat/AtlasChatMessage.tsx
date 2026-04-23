import React from 'react';
import type { ChatMessage } from './types';
import AtlasBlueprintBlock from './AtlasBlueprintBlock';
import AtlasFeedback from './AtlasFeedback';

interface AtlasChatMessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

/**
 * Renders a single chat message. User messages show as plain text.
 * Assistant messages render markdown-like content with code blocks and
 * inline BlueprintGraph tool calls.
 */
export default function AtlasChatMessage({
  message,
  isStreaming,
}: AtlasChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`atlas-chat__message atlas-chat__message--${message.role}`}
    >
      <div className="atlas-chat__message-avatar">
        {isUser ? '\u{1F464}' : '\u{1F916}'}
      </div>
      <div className="atlas-chat__message-body">
        {isUser ? (
          <div className="atlas-chat__message-text">{message.content}</div>
        ) : (
          <>
            <div
              className="atlas-chat__message-text"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(message.content),
              }}
            />
            {message.toolCalls?.map((tc, i) =>
              tc.name === 'blueprint_graph' ? (
                <AtlasBlueprintBlock key={i} toolCall={tc} />
              ) : null
            )}
            {!isStreaming && message.content && (
              <AtlasFeedback messageId={message.id} />
            )}
          </>
        )}
        {isStreaming && !isUser && (
          <span className="atlas-chat__cursor" />
        )}
      </div>
    </div>
  );
}

/**
 * Minimal markdown renderer for chat messages.
 * Handles: code blocks, inline code, bold, links.
 * Does NOT use dangerouslySetInnerHTML for user content — only for assistant output.
 */
function renderMarkdown(text: string): string {
  if (!text) return '';

  // Escape HTML first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks: ```lang\n...\n```
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_, lang, code) => {
      const langLabel = lang ? `<span class="atlas-chat__code-lang">${lang}</span>` : '';
      return `<div class="atlas-chat__code-block">${langLabel}<pre><code>${code.trim()}</code></pre></div>`;
    }
  );

  // Inline code: `...`
  html = html.replace(/`([^`]+)`/g, '<code class="atlas-chat__inline-code">$1</code>');

  // Bold: **...**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="atlas-chat__link" target="_blank" rel="noopener">$1</a>'
  );

  // Paragraphs: double newlines
  html = html.replace(/\n\n/g, '</p><p>');

  // Single newlines to <br>
  html = html.replace(/\n/g, '<br/>');

  return `<p>${html}</p>`;
}
