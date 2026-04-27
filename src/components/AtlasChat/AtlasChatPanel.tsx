import React, { useRef, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { useAtlasChatContext } from './AtlasChatContext';
import { useAtlasChat } from './useAtlasChat';
import AtlasChatLogin from './AtlasChatLogin';
import AtlasChatMessage from './AtlasChatMessage';
import AtlasChatInput from './AtlasChatInput';

interface AtlasChatPanelProps {
  onClose: () => void;
  initialMessage?: string;
}

export default function AtlasChatPanel({ onClose, initialMessage }: AtlasChatPanelProps) {
  const { auth } = useAtlasChatContext();
  const { messages, isStreaming, error, sendMessage, stopStreaming, clearMessages } =
    useAtlasChat();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send initial message from the pill input
  useEffect(() => {
    if (initialMessage && !initialSent.current && auth.status === 'authenticated') {
      initialSent.current = true;
      sendMessage(initialMessage, location.pathname);
    }
  }, [initialMessage, auth.status]);

  const handleSend = (content: string) => {
    sendMessage(content, location.pathname);
  };

  return (
    <div className="atlas-chat__panel">
      {/* Header */}
      <div className="atlas-chat__header">
        <div className="atlas-chat__header-left">
          <span className="atlas-chat__header-avatar">{'\u{1F916}'}</span>
          <span className="atlas-chat__header-title">Atlas</span>
        </div>
        <div className="atlas-chat__header-right">
          {messages.length > 0 && (
            <button
              className="atlas-chat__header-btn"
              onClick={clearMessages}
              title="New conversation"
            >
              +
            </button>
          )}
          <button
            className="atlas-chat__header-btn"
            onClick={onClose}
            title="Close"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="atlas-chat__body">
        {auth.status === 'loading' && (
          <div className="atlas-chat__loading">Loading...</div>
        )}

        {auth.status === 'unauthenticated' && <AtlasChatLogin />}

        {auth.status === 'authenticated' && (
          <>
            {messages.length === 0 && (
              <div className="atlas-chat__welcome">
                <div className="atlas-chat__welcome-icon">{'\u{1F44B}'}</div>
                <h3>Hey{auth.user?.displayName ? `, ${auth.user.displayName}` : ''}!</h3>
                <p>
                  I'm Atlas, your HELIX docs companion. Ask me anything about
                  building worlds, scripting in Blueprints, Lua, or JavaScript,
                  or debugging your projects.
                </p>
                <div className="atlas-chat__suggestions">
                  {[
                    'How do I spawn a vehicle?',
                    'Show me a BeginPlay Blueprint',
                    'What\'s the difference between a World and a Package?',
                  ].map(q => (
                    <button
                      key={q}
                      className="atlas-chat__suggestion"
                      onClick={() => handleSend(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <AtlasChatMessage
                key={msg.id}
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1}
              />
            ))}

            {error && (
              <div className="atlas-chat__error">{error}</div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {auth.status === 'authenticated' && (
        <AtlasChatInput
          onSend={handleSend}
          disabled={isStreaming}
          isStreaming={isStreaming}
          onStop={stopStreaming}
        />
      )}
    </div>
  );
}
