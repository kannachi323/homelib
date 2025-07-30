import { Outlet, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";


import { DiskProvider } from "./contexts/DiskProvider";
import { FileExplorerProvider } from "./contexts/FileExplorerProvider";
import { Menu } from "./features/Menu";
import { useAuthContext } from "./hooks/useAuth";



window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { isAuthenticated, setAuthChecked, authChecked } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthChecked(false);
      navigate('/auth');
    }
  }, [setAuthChecked, isAuthenticated, navigate]);


  if (!authChecked) {
    return null;
  }

  return (
    <DiskProvider>
      <FileExplorerProvider>
        <div className="flex flex-row w-screen h-screen overflow-hidde">
      
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
  

      
      </FileExplorerProvider>
    </DiskProvider>
        
  );
}




export default App;
