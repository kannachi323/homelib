import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { FileMenu } from './FileMenu';
import { FileDialog } from './FileDialog';

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