import { exists } from "@tauri-apps/plugin-fs";

export function formatBytes(bytes: number): string {
    if (bytes === 0) return "0B";
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(1)} ${sizes[i]}`;
}

export async function findHomelibRootOnDisk(mountpoint: string): Promise<string | null> {
    if (mountpoint !== "/") {
        return null;
    }

    let homelibRoot = mountpoint;

    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/home`);
        if (!res.ok) {
            throw new Error(`Failed to fetch homelib root: ${res.statusText}`);
        }
        const data = await res.json();

        homelibRoot = data.home + "/homelib";

        const isRootExists = await exists(homelibRoot);
        if (!isRootExists) {
            console.warn(`Homelib root does not exist at ${homelibRoot}`);
            return null;
        }

    } catch (error) {
        console.error("Error checking for homelib root:", error);
        return null;
    }

    return homelibRoot;
}
