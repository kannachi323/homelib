import { useEffect } from "react";
import { FaRegFolder } from "react-icons/fa";
import { FaRegFile } from "react-icons/fa";


import { useDisk } from "../hooks/useDisk";
import { useFileExplorer } from "../hooks/useFileExplorer";
import { FiltersBar } from "../ui/FileExplorer";


export default function Files() {
  const { setDisks, currentDisk } = useDisk();
  const { setCurrentPath, setFiles, files } = useFileExplorer();

  useEffect(() => {
    if (!currentDisk || !currentDisk.mountpoint) {
      console.warn("No disk selected or mountpoint missing");
      setFiles([]);
      return;
    }
    
    async function fetchFiles() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/files?path=${currentDisk?.mountpoint}/Users/mtccool668/projects`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          setFiles([]);
          throw new Error(`Error fetching files: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.length > 0) {
          setFiles(data);
        }
       
   
      } catch (error) {
        console.error("Failed to fetch files:", error);
      }
    }

    fetchFiles();
  }, [currentDisk, setDisks, setCurrentPath, setFiles]);


  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="relative flex-grow overflow-auto">
        <FiltersBar />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-5 p-2">
          {files.map((file) => (
            <div key={file.name} className="flex flex-col items-center rounded cursor-pointer hover:bg-white/10 p-2">
              {file.isDir ? <FaRegFolder className="text-4xl mb-2 text-gray-300" /> : <FaRegFile className="text-4xl mb-2 text-gray-300" />}
              <p className="text-sm text-center truncate w-full">{file.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

  );

}
