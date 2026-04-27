import React, { useState, useRef, useEffect } from 'react';

interface AtlasChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
}

export default function AtlasChatInput({
  onSend,
  disabled,
  isStreaming,
  onStop,
}: AtlasChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="atlas-chat__input-container">
      <textarea
        ref={textareaRef}
        className="atlas-chat__input"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Ask Atlas anything..."
        disabled={disabled}
        rows={1}
      />
      {isStreaming ? (
        <button
          className="atlas-chat__send-btn atlas-chat__stop-btn"
          onClick={onStop}
          title="Stop generating"
        >
          &#9632;
        </button>
      ) : (
        <button
          className="atlas-chat__send-btn"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          title="Send message"
        >
          &#9650;
        </button>
      )}
    </div>
  );
}
