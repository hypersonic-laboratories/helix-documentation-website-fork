import React from 'react';

const LOGIN_URL = 'https://helixgame.com/login';

export default function AtlasChatLogin() {
  const redirectUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="atlas-chat__login">
      <div className="atlas-chat__login-icon">&#x1F512;</div>
      <h3 className="atlas-chat__login-title">Chat with Atlas</h3>
      <p className="atlas-chat__login-text">
        Log in with your HELIX account to ask Atlas anything about building
        worlds, scripting, and the HELIX platform.
      </p>
      <a
        href={`${LOGIN_URL}?redirect=${encodeURIComponent(redirectUrl)}`}
        className="atlas-chat__login-btn"
      >
        Log in with HELIX
      </a>
    </div>
  );
}
