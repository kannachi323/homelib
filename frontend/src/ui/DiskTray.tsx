import { useDisk } from "../hooks/useDisk";
import { type Disk } from "../contexts/DiskContext";
import { FiHardDrive } from "react-icons/fi";

import { useFileExplorer } from "../hooks/useFileExplorer";
import { useNavigate } from "react-router";

export function DiskTray({isOpen} : {isOpen: boolean}) {
  const navigate = useNavigate();
  const { disks, setCurrentDisk, currentDisk } = useDisk();
  const { setCurrentPath } = useFileExplorer();

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0B";
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(1)} ${sizes[i]}`;
  }

  function handleDiskSelect(disk: Disk) {
    setCurrentDisk(disk);
    setCurrentPath(`/homelib${disk.device}`);
    navigate('/')

  }

  if (!isOpen) {
    return null;
  }

  return (
    <ul className="w-full space-y-3 overflow-y-auto my-10">
      {disks.map((disk) => (
        <li
          key={disk.device}
          className={`flex flex-row items-center gap-3 w-full p-2 transition-colors duration-200 text-gray-200 hover:bg-gray-700 ${currentDisk?.device === disk.device ? 'bg-gray-700': ''} cursor-pointer rounded`}
          onClick={(() => handleDiskSelect(disk))}
        >
          <FiHardDrive className="text-2xl"/>
          <div className={`flex flex-col w-full`}>
            <span className="text-sm">{disk.device}</span>
            <div className="relative w-full h-2 bg-gray-600 rounded overflow-hidden my-1">
              <div
                className="absolute left-0 top-0 h-full bg-green-500"
                style={{ width: `${disk.usedPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{`${formatBytes(disk.free)} free`} / {`${formatBytes(disk.total)} total`}</span>
            
          </div>
          
        </li>
      ))}
    </ul>
  );
}
