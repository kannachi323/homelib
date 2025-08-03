import { useFileExplorerStore } from "@/stores/useFileExplorerStore";
import { useEffect, useRef } from "react";

export function useClickOutside(handler: () => void): React.RefObject<HTMLDivElement | null> {
  const setSelectedFiles = useFileExplorerStore.getState().setSelectedFiles;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setSelectedFiles([]);
        handler();
      }
      
    }

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [handler, setSelectedFiles]);

  return ref;
}
