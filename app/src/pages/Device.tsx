
import { useState} from "react";

import { DeviceScannerScanDevices, DeviceScannerWelcome, DeviceScannerResults } from "../features/DeviceScanner";

function renderStep(step: number, setScanStep: (step: number) => void) {
  switch (step) {
    case 0:
      return <DeviceScannerWelcome setScanStep={setScanStep}/>;
    case 1:
      return <DeviceScannerScanDevices setScanStep={setScanStep}/>;
    case 2:
      return <DeviceScannerResults setScanStep={setScanStep}/>;
    default:
      return null;
  }
}

export default function DeviceScan() {
  const [scanStep, setScanStep] = useState(0);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {renderStep(scanStep, setScanStep)}
    </div>
  );
}

