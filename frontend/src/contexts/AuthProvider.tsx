import { useState, useEffect } from "react";

import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);


  useEffect(() => {
    async function checkUser() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/user`, {
          method: "GET",
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUser({ id: data.id, username: data.username });
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking user authentication:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
      
      
    }
 
    checkUser();
  }, [])

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, user, setUser, authChecked, setAuthChecked }}
    >
      {children}
    </AuthContext.Provider>
  );
};
