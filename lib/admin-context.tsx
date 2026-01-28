"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase, getUserProfile } from "@/lib/supabase";

export interface AdminContextValue {
  isAdmin: boolean;
  loading: boolean;
  isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  loading: true,
  isAuthenticated: false,
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!cancelled) setLoading(true);
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) {
          if (!cancelled) {
            setIsAuthenticated(false);
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }
        setIsAuthenticated(true);
        const profile = await getUserProfile(user.id);
        if (!cancelled) {
          setIsAdmin(!!profile?.isAdmin);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    }
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // If there is no session, immediately mark as signed out and non-admin
      if (!session) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // Otherwise re-check profile
      load();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ isAdmin, loading, isAuthenticated }),
    [isAdmin, loading, isAuthenticated],
  );
  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  return useContext(AdminContext);
}
