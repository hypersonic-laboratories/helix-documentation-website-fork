import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthState, AtlasConfig } from './types';

interface AtlasChatContextValue {
  auth: AuthState;
  config: AtlasConfig;
  checkAuth: () => Promise<void>;
}

const ATLAS_API_URL = '/api/atlas';

const AtlasChatContext = createContext<AtlasChatContextValue>({
  auth: { status: 'loading', user: null },
  config: { apiUrl: ATLAS_API_URL },
  checkAuth: async () => {},
});

export function useAtlasChatContext() {
  return useContext(AtlasChatContext);
}

export function AtlasChatProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    status: 'loading',
    user: null,
  });

  const config: AtlasConfig = { apiUrl: ATLAS_API_URL };

  const checkAuth = async () => {
    // In development (localhost), skip auth and use a mock user
    // so the full chat UI can be previewed without a backend.
    const isDev =
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost';

    if (isDev) {
      setAuth({
        status: 'authenticated',
        user: {
          id: 'dev-user',
          username: 'developer',
          displayName: 'Developer',
        },
      });
      return;
    }

    try {
      const res = await fetch(`${config.apiUrl}/auth/check`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setAuth({ status: 'authenticated', user: data.user });
      } else {
        setAuth({ status: 'unauthenticated', user: null });
      }
    } catch {
      setAuth({ status: 'unauthenticated', user: null });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AtlasChatContext.Provider value={{ auth, config, checkAuth }}>
      {children}
    </AtlasChatContext.Provider>
  );
}
