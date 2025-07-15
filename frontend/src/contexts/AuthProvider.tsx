import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "./AuthContext";

const protectedRoutes = ["/play"];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
 
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:8080/check-auth", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser({ id: data.id, username: data.username });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          navigate("/signup");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthenticated(false);
        navigate("/signup");
      } finally {
        setAuthChecked(true);
      }
    }
  
  if (protectedRoutes.includes(location.pathname)) {
    checkAuth();
  }
  }, [location.pathname, navigate]);


  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, 
        user, setUser, authChecked, setAuthChecked}}
    >
      {children}
    </AuthContext.Provider>
  );
};