import { useState, useEffect } from "react";

import { AuthContext, type User } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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
          const user : User = {
            id: data.userID,
            name: data.name,
            email: data.email,
          };
          setUser(user);
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
