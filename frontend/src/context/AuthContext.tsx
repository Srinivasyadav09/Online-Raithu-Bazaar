import { useState, type ReactNode } from "react";

import type { User } from "../types/auth";
import { AuthContext } from "./auth-context";

interface AuthProviderProps {
  children: ReactNode;
}

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(getStoredUser);

  function loginUser(nextUser: User, token: string) {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
