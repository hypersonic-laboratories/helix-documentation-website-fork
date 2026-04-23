import React, { useState } from 'react';
import { useAtlasChatContext } from './AtlasChatContext';

interface AtlasFeedbackProps {
  messageId: string;
}

export default function AtlasFeedback({ messageId }: AtlasFeedbackProps) {
  const { config } = useAtlasChatContext();
  const [submitted, setSubmitted] = useState<number | null>(null);

  const submitFeedback = async (rating: number) => {
    setSubmitted(rating);
    try {
      await fetch(`${config.apiUrl}/feedback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, rating }),
      });
    } catch {
      // Feedback is best-effort
    }
  };

  if (submitted !== null) {
    return (
      <span className="atlas-chat__feedback atlas-chat__feedback--done">
        {submitted === 5 ? '\u{1F44D}' : '\u{1F44E}'}
      </span>
    );
  }

  return (
    <span className="atlas-chat__feedback">
      <button
        className="atlas-chat__feedback-btn"
        onClick={() => submitFeedback(5)}
        title="Helpful"
      >
        &#x1F44D;
      </button>
      <button
        className="atlas-chat__feedback-btn"
        onClick={() => submitFeedback(1)}
        title="Not helpful"
      >
        &#x1F44E;
      </button>
    </span>
  );
}
