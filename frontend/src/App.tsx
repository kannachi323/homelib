


import { Outlet } from "react-router"; // ✅ Use react-router-dom!
import { useState } from "react";



import { DiskProvider } from "./contexts/DiskProvider";
import { FileExplorerProvider } from "./contexts/FileExplorerProvider";
import { Menu } from "./ui/Menu";
import { FileExplorer } from "./ui/FileExplorer";


function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-row w-screen h-screen">
      <DiskProvider>
        <FileExplorerProvider>
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
  
        </FileExplorerProvider>



      </DiskProvider>
    </div>
        
  );
}




export default App;
