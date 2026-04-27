import React, { useState, useRef, lazy, Suspense } from 'react';
import { AtlasChatProvider } from './AtlasChatContext';

const AtlasChatPanel = lazy(() => import('./AtlasChatPanel'));

const SUGGESTIONS = [
  'How do I spawn a vehicle?',
  'Show me a BeginPlay Blueprint',
  'What\'s the difference between a World and a Package?',
];

export default function AtlasChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openChat = (initialMsg?: string) => {
    setPendingMessage(initialMsg);
    setIsOpen(true);
    setShowPopover(false);
  };

  const handlePillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = inputRef.current?.value?.trim();
      openChat(value || undefined);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    hideTimeout.current = setTimeout(() => setShowPopover(false), 200);
  };

  return (
    <AtlasChatProvider>
      {/* Pill bar + popover — visible when chat panel is closed */}
      {!isOpen && (
        <div
          className="atlas-launcher"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Popover */}
          {showPopover && (
            <div className="atlas-popover">
              <div className="atlas-popover__header">
                <span className="atlas-popover__icon">{'\u{1F916}'}</span>
                <span className="atlas-popover__title">Atlas</span>
                <span className="atlas-popover__badge">AI</span>
              </div>
              <p className="atlas-popover__desc">
                Your HELIX docs companion. Ask about building worlds,
                scripting in Blueprints, Lua, or JavaScript, or debugging your projects.
              </p>
              <div className="atlas-popover__suggestions">
                {SUGGESTIONS.map(q => (
                  <button
                    key={q}
                    className="atlas-popover__suggestion"
                    onClick={() => openChat(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pill input */}
          <div className="atlas-pill">
            <div className="atlas-pill__icon">{'\u2728'}</div>
            <input
              ref={inputRef}
              className="atlas-pill__input"
              type="text"
              placeholder="Ask Atlas..."
              onKeyDown={handlePillKeyDown}
              onFocus={handleMouseEnter}
            />
            <button
              className="atlas-pill__btn"
              onClick={() => {
                const value = inputRef.current?.value?.trim();
                openChat(value || undefined);
                if (inputRef.current) inputRef.current.value = '';
              }}
              aria-label="Ask Atlas"
            >
              &#x2192;
            </button>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Suspense
          fallback={
            <div className="atlas-chat__panel atlas-chat__panel--loading">
              <div className="atlas-chat__loading">Loading Atlas...</div>
            </div>
          }
        >
          <AtlasChatPanel
            onClose={() => {
              setIsOpen(false);
              setPendingMessage(undefined);
            }}
            initialMessage={pendingMessage}
          />
        </Suspense>
      )}
    </AtlasChatProvider>
  );
}
