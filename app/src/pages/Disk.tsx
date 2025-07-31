import { useEffect } from "react";

import { DiskScannerScanDisks, DiskScannerResults, DiskScannerWelcome } from "../features/DiskScanner";
import { useDiskStore } from "../stores/useDiskStore";



function renderStep(step: number) {
  switch (step) {
    case 0:
      return <DiskScannerWelcome />;
    case 1:
      return <DiskScannerScanDisks />;
    case 2:
      return <DiskScannerResults />;
    default:
      return null;
  }
}

export default function DiskScan() {
  const { scanStep, setScanStep } = useDiskStore();

  useEffect(() => {
    const lastScanStep = localStorage.getItem('lastScanStep');
    if (lastScanStep) {
      const step = parseInt(lastScanStep, 10);
      if (!isNaN(step)) {
        setScanStep(step);
      }
    } else {
      setScanStep(0);
    }
  }, [setScanStep]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {renderStep(scanStep)}
    </div>
  );
}
