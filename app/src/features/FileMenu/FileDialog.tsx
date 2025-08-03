import { useState, useEffect, useRef } from 'react';
import { useElementSize } from '@/hooks/useElementSize';
import { useClickOutside } from '@/hooks/useClickOutside';
import { FileMenuContent } from './FileMenuContent';


type FileDialogProps = {
  pos: { x: number; y: number };
  showEditOptions?: boolean;
  onClose: () => void;
};
export function FileDialog({ pos, onClose, showEditOptions = false}: FileDialogProps) {
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
    >
      <FileMenuContent showEditOptions={showEditOptions}/>
    </div>
  );
}
