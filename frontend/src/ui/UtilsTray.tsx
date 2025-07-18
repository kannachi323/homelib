import { useNavigate } from "react-router";

import { DiskScannerTab } from "./DiskScanner";
import { FileExplorerTab } from "./FileExplorer";

export function UtilsTray({isOpen}: {isOpen: boolean}) {
  const navigate = useNavigate();
  return (
    <ul className="w-full space-y-3 justify-center items-center">

        <li
          className={`flex flex-row items-center w-full p-2 transition-colors duration-200 text-gray-200 hover:bg-gray-700 cursor-pointer rounded-lg`}
          onClick={() => navigate('/')}
        >
          <FileExplorerTab isOpen={isOpen}/>
        </li>
      
        <li
          className={`flex flex-row items-center w-full p-2 transition-colors duration-200 text-gray-200 hover:bg-gray-700 cursor-pointer rounded-lg`}
          onClick={() => navigate('/disk-scan')}
        >
          <DiskScannerTab isOpen={isOpen} />
        </li>
    </ul>
  );
}
