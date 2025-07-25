import { useState } from "react";

import { useDisk } from "../hooks/useDisk";


function renderStep(step: number) {
  switch (step) {
    case 0:
      return <DeviceScanWelcome />;
    case 1:
      return <DeviceScanDevices />;
    case 2:
      return <DeviceScanResults />;
    default:
      return null;
  }
}

export default function DeviceScan() {
  const [scanStep, setScanStep] = useState(0);
  const { clientDevices, setClientDevices } = useDisk();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {renderStep(scanStep)}
    </div>
  );
}

export function DeviceScanWelcome({setScanStep} : {setScanStep: (step: number) => void}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Hey there! Let's do a quick scan of your devices. You can add/edit/delete your devices here</h1>
      <div className="rounded-full w-[128px] h-[128px] flex items-center justify-center border cursor-pointer hover:bg-white/20"
        onClick={() => setScanStep(1)}
      >
        Scan
      </div>
    </div>
  )
}

export function DeviceScanDevices({setScanStep} : {setScanStep: (step: number) => void}) {
  return (
    useEffect(() => {
      
    })
  )
}
