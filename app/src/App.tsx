import { Outlet, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";


import { Menu } from "./features/Menu";
import { useAuthStore } from "./stores/useAuthStore";



window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { isAuthenticated, authChecked, checkUser } = useAuthStore();
  const navigate = useNavigate();



  useEffect(() => {
    if (!authChecked) {
      checkUser();
    } else if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [authChecked, isAuthenticated]);

  return (
    <div className="flex flex-row w-screen h-screen">
  
      {/* Sidebar */}
      <aside
        className={`flex flex-col justify-between items-center transition-all duration-300
          ${isOpen ? "w-[225px]" : "w-[50px]"}
        `}
      >
        <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
      </aside>

      {/* Main Content */}

        <main ref={ref} className={`flex flex-grow h-full`}>
          <Outlet />
        </main>
    </div>

  );
}




export default App;
