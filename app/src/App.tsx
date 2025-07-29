import { Outlet, useNavigate } from "react-router";
import { useState, useEffect } from "react";

import { DiskProvider } from "./contexts/DiskProvider";
import { FileExplorerProvider } from "./contexts/FileExplorerProvider";
import { Menu } from "./features/Menu";
import { useAuthContext } from "./hooks/useAuth";

function App() {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="flex flex-row w-screen h-screen overflow-hidden">
      
          {/* Sidebar */}
          <aside
            className={`flex flex-col justify-between items-center transition-all duration-300
              ${isOpen ? "w-[20vw]" : "w-[5vw]"}
            `}
          >
            <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
          </aside>

          {/* Main Content */}
  
            <main className={`${isOpen ? "w-[80vw]" : "w-[95vw]"} h-full`}>
              <Outlet />
            </main>
        </div>
      </FileExplorerProvider>
    </DiskProvider>
        
  );
}




export default App;
