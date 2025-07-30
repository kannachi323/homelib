import { writeFile, mkdir } from "@tauri-apps/plugin-fs";

import { type File } from "../../contexts/FileExplorerContext"


export async function createFile(name: string, path: string) : Promise<File> {
    const newFile: File = {
        name: name,
        path: path,
        size: 0,
        isDir: false
    };
    
    try {
        await writeFile(path, new Uint8Array(0));
    } catch (error) {
        console.error("Error creating new file:", error);
    }
    
    return newFile;
}

export async function createFolder(name: string, path: string) {
    const newFolder: File = {
        name: name,
        path: path,
        size: 0,
        isDir: true
    };

    try {
        await mkdir(path);
    } catch (error) {
        console.error("Error creating new folder:", error);
    }

    return newFolder;
}