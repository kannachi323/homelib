import { GiHamburgerMenu } from "react-icons/gi";

import { DiskTray } from "./DiskTray";
import { UtilsTray } from "./UtilsTray";

export function Menu({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  return (
    <div className="flex flex-col items-center w-full h-full p-1 bg-[#181818]">
      <AppLogo isOpen={isOpen} setIsOpen={setIsOpen} />
      
      
      <UtilsTray isOpen={isOpen}/>


     
      <DiskTray isOpen={isOpen}/>
      
    </div>
  );
}

export function AppLogo({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  return (
    <div className={`flex flex-row ${isOpen ? 'justify-between p-2' : 'justify-center p-2'} items-center w-full rounded mb-5 transition-colors duration-200 text-gray-200 hover:bg-gray-800 cursor-pointer`}
      onClick={() => setIsOpen(!isOpen)}
    >
        {isOpen && 
          <h1 className="text-2xl font-bold whitespace-nowrap">
            HomeLib
          </h1>
        }
        
        <GiHamburgerMenu
          className="text-2xl cursor-pointer"
        />
        
       
      </div>
    
  );
}
