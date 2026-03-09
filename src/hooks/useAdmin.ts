"use client";

import { useAuth } from "./useAuth";

export function useAdmin() {
  const { user, profile, loading } = useAuth();

  return {
    isAdmin: profile?.role === "admin",
    user,
    profile,
    loading,
  };
}
