import { FileMenuContent } from "./FileMenuContent";

export function FileMenu({ onClose }: {onClose: () => void }) {
  return (
    <div
      className="absolute top-0 left-0 w-[200px] bg-[#353434] rounded-lg shadow-md z-50"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <FileMenuContent/>
      </div>
      
    </div>
  );
}
