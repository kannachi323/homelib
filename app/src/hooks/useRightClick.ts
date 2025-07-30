import { useEffect } from "react";

export function useRightClick(ref: React.RefObject<HTMLElement | null>, handler: (e: MouseEvent) => void) {
  useEffect(() => {
    function handleRightClick(event: MouseEvent) {
      if (event.button !== 2) return;

      if (ref.current && ref.current.contains(event.target as Node)) {
        handler(event);
      }
    }
    document.addEventListener("contextmenu", handleRightClick);
    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
    };
  
  }, [ref, handler]);
}
