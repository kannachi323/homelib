import { useEffect, useState } from "react";
import { MdDevices } from "react-icons/md";
import { type Device } from "../contexts/ClientContext";
import { useClient } from "../hooks/useClient";

import { Loading } from "../components/Loading";

export function DeviceScannerTab({ isOpen } : {isOpen: boolean}) {
  return (
    <div className={`flex flex-row ${isOpen ? 'justify-start gap-2' : 'justify-center'} items-center w-full`}>
      <MdDevices className="text-2xl"/>
      {isOpen && 
          <h1 className="text-lg font-bold whitespace-nowrap">
            Devices
          </h1>
        }
    </div>
  )
}

export function DeviceScannerWelcome({setScanStep}: {setScanStep: (step: number) => void}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center space-y-6 bg-[#222121] text-white">
      <div className="flex items-center justify-center bg-white/10 rounded-full w-28 h-28">
        <MdDevices className="w-12 h-12 text-[#10A37F]" />
      </div>

      <h1 className="text-3xl font-semibold text-white">
        Let’s scan your devices
      </h1>

      <p className="text-gray-300 max-w-md">
        Add, edit, or remove your connected devices. This quick scan helps keep things clean and up to date.
      </p>

      <button
        onClick={() => setScanStep(1)}
        className="px-6 py-3 bg-[#10A37F] text-white rounded-full hover:bg-[#0e8c6f] transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Scan Devices
      </button>
    </div>
  );
}


export function DeviceScannerScanDevices({setScanStep} : {setScanStep: (step: number) => void}) {
  const { setClientDevices } = useClient();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function scanDevice() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/devices`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) {
          console.error("Disk fetch failed:", res.statusText);
          return;
        }

        const data: Device[] = await res.json();
        if (data.length > 0) {
          setClientDevices(data);
          localStorage.setItem('devices', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setTimeout(() => {
          setScanStep(2);
          setLoading(false);
        }, 1500);
      }
    }

    scanDevice();
  }, [setScanStep, setClientDevices]);



  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center space-y-6 bg-[#222121] text-white">
      {loading && (
        <>
          <div className="flex items-center justify-center bg-white/10 rounded-full w-24 h-24">
            <MdDevices className="w-10 h-10 text-[#10A37F]" />
          </div>
          <h1 className="text-2xl font-semibold">Scanning for disks...</h1>
          <p className="text-gray-300 max-w-md">
            Sit tight while we detect your local storage. This won't take long...
          </p>
          <Loading />
        </>
      )}
    </div>
  );
}


export function DeviceScannerResults({ setScanStep }: { setScanStep: (step: number) => void }) {
  const [deviceName, setDeviceName] = useState("");
  const [deviceAddress, setDeviceAddress] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  async function addDevice() {
    if (!deviceName.trim()) {
      setError("Device name is required.");
      return;
    }

    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/device`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: deviceName, address: deviceAddress }),
      });

      if (!res.ok) {
        setError(`Failed to add device: ${res.statusText}`);
        return;
      }

      setShowModal(false);
      setDeviceName("");
      setDeviceAddress("");
      setScanStep(2);
    } catch (err) {
      setError("Error adding device: " + err);
    }
  }

  return (
    <>
      <button onClick={() => setShowModal(true)}>Add a device</button>

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "black",
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "black", padding: 20, borderRadius: 8, width: 300 }}>
            <h3>Add Device</h3>
            <div>
              <label>
                Device Name:
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  autoFocus
                />
              </label>
            </div>
            <div style={{ marginTop: 10 }}>
              <label>
                Device Address (optional):
                <input
                  type="text"
                  value={deviceAddress}
                  onChange={(e) => setDeviceAddress(e.target.value)}
                />
              </label>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div style={{ marginTop: 15, display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={addDevice}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}