
import { FiHardDrive } from "react-icons/fi";

import { useNavigate } from "react-router";
import { formatBytes, findHomelibRootOnDisk } from "../utils/disks";
import { useDiskStore, type Disk } from "../stores/useDiskStore";
import { useFileExplorerStore } from "../stores/useFileExplorerStore";

export function DiskTray({isOpen} : {isOpen: boolean}) {
  const navigate = useNavigate();
  const { disks, setCurrentDisk, currentDisk } = useDiskStore();
  const { setCurrentPath } = useFileExplorerStore();

  async function handleDiskSelect(disk: Disk) {
    setCurrentDisk(disk);
    setCurrentPath(`${disk.device}/homelib/`);
    navigate('/')


    const homePath = await findHomelibRootOnDisk(disk.mountpoint);
    console.log('Found homelib root:', homePath);

    if (!homePath || !homePath.includes('homelib')) {
      console.log("hello")
      alert('This disk does not contain a valid homelib installation.');
      return
    }

    setCurrentPath(homePath);
    navigate('/')
  }

  if (!isOpen) {
    return null;
  }

  return (
    <ul className="w-full space-y-3 overflow-y-auto my-5">
      {disks.map((disk) => (
        <li
          key={disk.device}
          className={`flex flex-row items-center gap-3 w-full p-2 transition-colors duration-200 text-gray-200 hover:bg-gray-800 ${currentDisk?.device === disk.device ? 'bg-gray-700': ''} cursor-pointer rounded`}
          onClick={(() => handleDiskSelect(disk))}
        >
          <FiHardDrive className="text-2xl"/>
          <div className={`flex flex-col w-full`}>
            <span className="text-sm">{disk.name}</span>
            <div className="relative w-full h-2 bg-gray-600 rounded overflow-hidden my-1">
              <div
                className="absolute left-0 top-0 h-full bg-[#10A37F]"
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
