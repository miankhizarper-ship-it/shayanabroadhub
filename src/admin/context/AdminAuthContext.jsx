import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../../lib/api";

/**
 * AdminAuthContext — session state for the CMS.
 *
 * Authentication is entirely cookie-based (httpOnly `sb_admin_session`
 * set by the backend): the context only ASKS the API who it is
 * (`GET /api/auth/me`) and mutates state through login/logout.
 * No token is ever stored client-side.
 */

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | unauthenticated

  useEffect(() => {
    let active = true;
    authApi
      .me()
      .then((data) => {
        if (!active) return;
        setAdmin(data?.admin ?? null);
        setStatus(data?.admin ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!active) return;
        setAdmin(null);
        setStatus("unauthenticated");
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    setAdmin(data?.admin ?? null);
    setStatus("authenticated");
    return data?.admin ?? null;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAdmin(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo(
    () => ({ admin, status, login, logout }),
    [admin, status, login, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
