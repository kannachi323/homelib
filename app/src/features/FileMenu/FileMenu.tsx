import { useRef, useState, useEffect } from 'react';
import { FilePlus, Plus, FolderPlus, FolderUp, FileUp } from 'lucide-react';

import { useClickOutside } from '../../hooks/useClickOutside';
import { useElementSize } from '../../hooks/useElementSize';



import { open } from '@tauri-apps/plugin-dialog';
import { open as openFile } from '@tauri-apps/plugin-fs';
import { useFileExplorerStore } from '../../stores/useFileExplorerStore';
import { useClientStore } from '../../stores/useClientStore';
import { writeFile } from '@tauri-apps/plugin-fs';
import { useBlobBufferStore } from '../../stores/useBlobBufferStore';
import { useChannelStore, TransferStatus } from '../../stores/useChannelStore';


export function FileMenuTab({ isMenuOpen }: { isMenuOpen: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const [fromRightClick, setFromRightClick] = useState(false);

  useClickOutside(ref, () => setShowMenu(false));


  function handleLeftClick() {
    setFromRightClick(false);
    setShowMenu(true);
  }

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className={`
          flex flex-row items-center w-full cursor-pointer z-10
          ${isMenuOpen ? 'justify-start gap-2' : 'justify-center p-2'}
        `}
        onClick={handleLeftClick}
      >
        <Plus className="text-2xl" />
        {isMenuOpen && <b>New</b>}
      </div>

      {showMenu &&
        (fromRightClick ? (
          <FileDialog pos={pos} onClose={() => setShowMenu(false)} />
        ) : (
          <FileMenu onClose={() => setShowMenu(false)} />
        ))}
    </div>
  );
}

export function FileMenu({ onClose }: {onClose: () => void }) {
  return (
    <div
      className="absolute top-0 left-0 w-[200px] bg-[#353434] rounded-lg shadow-md z-50"
      onClick={onClose}
    >
      <FileMenuContent />
    </div>
  );
}


type FileDialogProps = {
  pos: { x: number; y: number };
  onClose: () => void;
};
export function FileDialog({ pos, onClose }: FileDialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const {width, height} = useElementSize(ref);
  const [finalPos, setFinalPos] = useState(pos);

  useEffect(() => {
    if (pos.x + width > window.innerWidth) {
      pos.x = window.innerWidth - width - 10;
    }
    if (pos.y + height > window.innerHeight) {
      pos.y = window.innerHeight - height - 10;
    }

    setFinalPos({ x: pos.x, y: pos.y });


  }, [ref, pos, width, height]);

  useClickOutside(ref, onClose);

  return (
    <div
      ref={ref}
      className="fixed w-[200px] bg-[#353434] rounded-lg shadow-md z-50"
      style={{ top: finalPos.y, left: finalPos.x }}
      onClick={onClose}
    >
      <FileMenuContent />
    </div>
  );
}


function FileMenuContent() {
  return (
    <>
      <ul className="text-sm border-b pb-1">
        <CreateItems />
      </ul>

      <ul className="text-sm pt-1">
        <UploadItems/>
      </ul>
    </>
  );
}

function CreateItems() {
  const { fetchFiles } = useFileExplorerStore();

  async function handleNewFile() {
    const currentPath = useFileExplorerStore.getState().currentPath + "/New File";
    try {
        await writeFile(currentPath, new Uint8Array(0));
    } catch (error) {
        console.error("Error creating new file:", error);
    }
    fetchFiles(currentPath);
  }

  async function handleNewFolder() {
    const currentPath = useFileExplorerStore.getState().currentPath + '/New Folder';
    try {
        await writeFile(currentPath, new Uint8Array(0));
    } catch (error) {
        console.error("Error creating new file:", error);
    }
    fetchFiles(currentPath);
  }
  return (
    <>
      <b className="p-2 block">Create</b>
      <li className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c] rounded-t"
        onClick={() => handleNewFile()}
      >
        <FilePlus className="w-5 h-5 mr-2" />
        <p>New file</p>
      </li>
      <li className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c]"
        onClick={() => handleNewFolder()}
      >
        <FolderPlus className="w-5 h-5 mr-2" />
        <p>New folder</p>
      </li>
    </>
  )
}

function UploadItems() {
  const { client, conn } = useClientStore();
  const { createTransferTask } = useChannelStore.getState();

  if (!client || !conn) {
    console.error("Client or connection is not available");
    return undefined;
  }

  async function handleFileUpload() {
    if (!client || !conn) {
      console.error("Client or connection is not available");
      return;
    }
    const selected = await open({
      multiple: true,
      directory: false,
    });

    if (selected === null) {
      console.log("No files selected");
      return;
    }

    createTransferTask(client, conn, TransferStatus.UploadStart);
    const fileHandle = await openFile(selected[0], { read: true, write: true, create: true });
    for (const filePath of selected as string[]) {
      if (!fileHandle) {
        console.error(`Failed to open file: ${filePath}`);
        break;
      }
      try {
        const currentPath = useFileExplorerStore.getState().currentPath + '/' + filePath.split('/').pop();
        await useBlobBufferStore.getState().sendFileBlobs(currentPath, fileHandle);
      } catch (error) {
        console.error(`Error sending file blobs for ${filePath}:`, error);
      }
    }
  }

  return (
    <>
      <b className="p-2 block">Upload</b>
      <li
        className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c]"
        onClick={() => handleFileUpload()}
      >
        <FileUp className="w-5 h-5 mr-2" />
        <p>File</p>
      </li>
     
      <li
        className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c] rounded-b"
        onClick={() => handleFileUpload()}
      >
        <FolderUp className="w-5 h-5 mr-2" />
        <p>Folder</p>
      </li>
    </>
  );
}