
import { FiltersBar} from "../features/MyHomelib";


import { MyHomelib } from "../features/MyHomelib"
import { FileExplorer } from "../features/FileExplorer";

export default function Home() {


  return (
    <div className="flex flex-col h-full w-full">
   
        <FileExplorer />
        <FiltersBar />

        <MyHomelib />
    </div>

  );

}

