import { useState, useRef } from "react";
import { FiltersBar, HomeView} from "../features/MyHomelib";

import { FileExplorer } from "../features/FileExplorer";
import { FileDialog } from "@/features/FileMenu/FileDialog";

export default function Home() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showFileDialog, setShowFileDialog] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function handleRightClick(e : React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setShowFileDialog(true);
  }

  


  return (
    <div className="flex flex-col h-full w-full">
        <FileExplorer />
        <FiltersBar />
        <div ref={ref} className="flex-grow h-[95vh] overflow-y-auto"
          onContextMenu={(e) => handleRightClick(e)}
        >
          <HomeView />
          {showFileDialog && 
            <FileDialog pos={pos} onClose={() => setShowFileDialog(false)}/>
          }

        </div>
    </div>

  );

}

