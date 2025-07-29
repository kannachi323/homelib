import { useNavigate } from "react-router";

import { DiskScannerTab } from "./DiskScanner";
import { MyHomelibTab } from "./MyHomelib";
import { DeviceScannerTab } from "./DeviceScanner";
import { NewFileMenuTab } from "../features/NewFileMenu";

export function UtilsTray({isOpen}: {isOpen: boolean}) {
  const navigate = useNavigate();
  return (
    <ul className="w-full space-y-3 justify-center items-center">

        <li
          className={`flex flex-row items-center w-full transition-colors duration-200 text-gray-200 hover:bg-gray-800 cursor-pointer rounded-lg
            ${isOpen ? 'p-2': 'p-0'}
          `}
          onClick={() => navigate('/')}
        >
          <NewFileMenuTab isMenuOpen={isOpen}/> 
        </li>

        <li
          className={`flex flex-row items-center w-full transition-colors duration-200 text-gray-200 hover:bg-gray-800 cursor-pointer rounded-lg
            ${isOpen ? 'p-2': 'p-0'}
          `}
          onClick={() => navigate('/')}
        >
          <MyHomelibTab isOpen={isOpen}/> 
        </li>
      
        <li
          className={`flex flex-row items-center w-full transition-colors duration-200 text-gray-200 hover:bg-gray-800 cursor-pointer rounded-lg
            ${isOpen ? 'p-2': 'p-0'}`}
          onClick={() => navigate('/disk')}
        >
          <DiskScannerTab isOpen={isOpen} />
        </li>

        <li 
          className={`flex flex-row items-center w-full transition-colors duration-200 text-gray-200 hover:bg-gray-800 cursor-pointer rounded-lg
            ${isOpen ? 'p-2': 'p-0'}`}
          onClick={() => navigate('/device')}
        >
          <DeviceScannerTab isOpen={isOpen} />
        </li>
    </ul>
  );
}
