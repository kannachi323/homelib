


import { Outlet, useNavigate } from "react-router";
import { useState, useEffect } from "react";

import { DiskProvider } from "./contexts/DiskProvider";
import { FileExplorerProvider } from "./contexts/FileExplorerProvider";
import { Menu } from "./ui/Menu";
import { FileExplorer } from "./ui/FileExplorer";
import { useAuthContext } from "./hooks/useAuthContext";

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
        <div className="flex flex-row w-screen h-screen">
      
          {/* Sidebar */}
          <aside
            className={`
              h-full border-r flex flex-col justify-between items-center 
              transition-all duration-300 bg-[#181818]
              ${isOpen ? "w-[25vw]" : "w-[5vw]"}
            `}
          >
            <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
          </aside>

          {/* Main Content */}
          <div className="w-full flex flex-col">
            <header className="h-1/12 border-b">
              
              <FileExplorer />
              
              
            </header>
            <main className="h-11/12 p-2">
              <Outlet />
            </main>
          </div>
        </div>
      </FileExplorerProvider>
    </DiskProvider>
        
  );
}




export default App;
