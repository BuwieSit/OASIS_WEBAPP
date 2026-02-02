import { createContext, useContext, useEffect, useState } from "react";
import { login, me, logout as apiLogout } from "../api/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // INITIAL SESSION CHECK
  useEffect(() => {
    async function init() {
      try {
        const data = await me();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // AUTO LOGOUT ON IDLE (15 MIN)
  useEffect(() => {
    let timeout;

    function resetTimer() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        logoutUser();
      }, 15 * 60 * 1000);
    }

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  async function loginUser(identifier, password) {
    const data = await login(identifier, password);
    const userData = await me();
    setUser(userData);
    return data;
  }

  function logoutUser() {
    apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logoutUser,
        isAuthenticated: !!user,
        role: user?.role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
