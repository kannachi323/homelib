import { useState } from 'react';

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
    };

    return {blobData, handleBinaryMessage};
}