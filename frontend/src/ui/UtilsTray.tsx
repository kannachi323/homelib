import { useNavigate } from "react-router";

import { DiskScannerTab } from "./DiskScanner";
import { FileExplorerTab } from "./FileExplorer";

export function UtilsTray({isOpen}: {isOpen: boolean}) {
  const navigate = useNavigate();
  return (
    <ul className="w-full space-y-3">

        <li
          className={`flex flex-row items-center gap-3 w-full p-2 transition-colors duration-200 text-gray-200 hover:bg-gray-700 cursor-pointer rounded`}
          onClick={() => navigate('/')}
        >
          <FileExplorerTab isOpen={isOpen}/>
        </li>
      
        <li
          className={`flex flex-row items-center gap-3 w-full p-2 transition-colors duration-200 text-gray-200 hover:bg-gray-700 cursor-pointer rounded`}
          onClick={() => navigate('/disk-scan')}
        >
          <DiskScannerTab isOpen={isOpen} />
      
          
        </li>
    </ul>
  );
}
