import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { useAuthContext } from "../../hooks/useAuth";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLandingPage = location.pathname === "/auth";

  const { authChecked, isAuthenticated } = useAuthContext();


  useEffect(() => {
    if (authChecked && isAuthenticated) {
      navigate("/");
    }
  }, [authChecked, isAuthenticated, navigate]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-10">
      {isLandingPage ? (
        <>
          <h1 className="text-4xl font-bold">Welcome to HomeLib!</h1>
          <h2>Get Started</h2>

          <div className="flex flex-row justify-center gap-5 w-1/2 h-[64px] p-2">
            <button
              className="p-1 border-2 rounded-full w-1/5"
              onClick={() => navigate("/auth/login")}
            >
              Log in
            </button>
            <button
              className="p-1 border-2 rounded-full w-1/5"
              onClick={() => navigate("/auth/signup")}
            >
              Sign Up
            </button>
          </div>
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
