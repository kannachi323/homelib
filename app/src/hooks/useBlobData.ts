import { useState } from 'react';
import { writeFile } from '@tauri-apps/plugin-fs';
import { getCurrentPath } from '../globalFileExplorer';

export function useBlobData() {
    const [blobData, setBlobData] = useState<Uint8Array>(new Uint8Array(0));

    const handleBinaryMessage = (data: ArrayBuffer) => {
        const uint8Array = new Uint8Array(data);
        setBlobData((prev) => {
            const newBlobData = new Uint8Array(prev.length + uint8Array.length);
            newBlobData.set(prev);
            newBlobData.set(uint8Array, prev.length);
            return newBlobData;
        });
        console.log("Received binary data:", uint8Array);
    };

    const writeBlob = async () => {
        const currentPath =  getCurrentPath();
        await writeFile(currentPath, blobData);
    };





    return {blobData, handleBinaryMessage, writeBlob};
}