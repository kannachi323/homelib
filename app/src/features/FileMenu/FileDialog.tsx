import { useState, useEffect } from 'react';
import { useElementSize } from '@/hooks/useElementSize';
import { FileMenuContent } from './FileMenuContent';
import { useClickOutside } from '@/hooks/useClickOutside';


type FileDialogProps = {
  pos: { x: number; y: number };
  showEditOptions?: boolean;
  onClose: () => void
};
export function FileDialog({ pos, showEditOptions = false, onClose}: FileDialogProps) {
  const ref = useClickOutside(onClose);
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

  return (
    <div
      ref={ref}
      className="fixed w-[200px] bg-[#353434] rounded-lg shadow-md z-50"
      style={{ top: finalPos.y, left: finalPos.x }}
    >
      <FileMenuContent showEditOptions={showEditOptions}/>
    </div>
  );
}
