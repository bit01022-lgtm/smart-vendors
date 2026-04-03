import React, { useEffect, useMemo, useState } from 'react';
import {
  AUTH_CHANGED_EVENT,
  fetchCurrentUser,
  getStoredUser,
  logoutUser,
} from '../services/authService';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const cached = getStoredUser();
      if (cached && mounted) {
        setCurrentUser(cached);
        setProfile(cached);
      }

      try {
        const user = await fetchCurrentUser();
        if (!mounted) {
          return;
        }

        setCurrentUser(user);
        setProfile(user);
      } catch {
        if (!mounted) {
          return;
        }

        setCurrentUser(null);
        setProfile(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    const handleAuthChanged = () => {
      loadSession();
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);

    return () => {
      mounted = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    };
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      profile,
      loading,
      logout: async () => {
        await logoutUser();
        setCurrentUser(null);
        setProfile(null);
      },
    }),
    [currentUser, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
