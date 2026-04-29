import { createContext, useContext, useEffect, useState } from "react";
import { login, me, logout as apiLogout } from "../api/auth.service";
import { InactivityModal } from "../components/popupModal";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInactivityPopup, setShowInactivityPopup] = useState(false);

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


  // AUTO LOGOUT ON IDLE (15 MIN total, Warning at 10 MIN)
  useEffect(() => {
    if (!user) return; // Only track if logged in

    let warningTimeout;
    let logoutTimeout;

    function resetTimer() {
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
      
      if (showInactivityPopup) setShowInactivityPopup(false);

      // Warning at 10 minutes (5 minutes left)
      warningTimeout = setTimeout(() => {
        setShowInactivityPopup(true);
      }, 10 * 60 * 1000);

      // Final Logout at 15 minutes
      logoutTimeout = setTimeout(() => {
        logoutUser();
      }, 15 * 60 * 1000);
    }

    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    resetTimer();

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, showInactivityPopup]);

  async function loginUser(identifier, password) {
    const data = await login(identifier, password);
    const userData = await me();
    setUser(userData);
    return data;
  }

  function logoutUser() {
    apiLogout();
    setUser(null);
    setShowInactivityPopup(false);
  }

  function stayActive() {
    setShowInactivityPopup(false);
    // Timers will be reset by the useEffect watching showInactivityPopup
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logoutUser,
        stayActive,
        isAuthenticated: !!user,
        role: user?.role,
      }}
    >
      {children}
      {showInactivityPopup && (
        <InactivityModal 
          onStayActive={stayActive} 
          onLogout={logoutUser} 
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

