import { create } from 'zustand';

type Layout = 'grid' | 'list';

export type File = {
  path: string;
  name: string;
  size: number;
  type: string;
  isDir: boolean;
};

type FileExplorerState = {
  currentPath: string;
  selectedFiles: File[];
  layout: Layout;
  files: File[];
  backStack: string[];
  forwardStack: string[];


  setCurrentPath: (path: string) => void;
  setSelectedFiles: (files: File[]) => void;
  setFiles: (files: File[]) => void;
  setLayout: (layout: Layout) => void;
  startAt: (path: string | null) => void;
  navigateTo: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
  fetchFiles: (path?: string) => void;
  handleContextMenu: (file: File) => void;
};

export const useFileExplorerStore = create<FileExplorerState>((set, get) => ({
  currentPath: '/',
  layout: 'grid',
  files: [],
  selectedFiles: [],
  backStack: [],
  forwardStack: [],

  setCurrentPath: (path) => set({ currentPath: path }),
  setFiles: (files) => set({ files }),
  setSelectedFiles: (files) => set({ selectedFiles: files }),

  setLayout: (layout) => set({ layout }),

  startAt: (path) => {
    set({ currentPath: path || '/homelib' });

    const fStack = localStorage.getItem('forwardStack');
    const bStack = localStorage.getItem('backStack');

    set({
      forwardStack: fStack ? JSON.parse(fStack) : [],
      backStack: bStack ? JSON.parse(bStack) : [],
    });
  },

  navigateTo: async (newPath) => {
    const { currentPath, backStack } = get();
    set({
      backStack: [...backStack, currentPath],
      forwardStack: [],
      currentPath: newPath,
    });
    await get().fetchFiles(newPath);
  },

  goBack: () => {
    const { backStack, currentPath, forwardStack, fetchFiles } = get();
    if (backStack.length > 0) {
      const prev = backStack[backStack.length - 1];
      set({
        currentPath: prev,
        backStack: backStack.slice(0, -1),
        forwardStack: [...forwardStack, currentPath],
      });
      fetchFiles(prev);
    }
  },

  goForward: () => {
    const { forwardStack, currentPath, backStack, fetchFiles } = get();
    if (forwardStack.length > 0) {
      const next = forwardStack[forwardStack.length - 1];
      set({
        currentPath: next,
        forwardStack: forwardStack.slice(0, -1),
        backStack: [...backStack, currentPath],
      });
      fetchFiles(next);
    }
  },

  fetchFiles: async (path?: string) => {
    const targetPath = path || get().currentPath;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/files?path=${targetPath}`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      set({ files: data });
    } catch (err) {
      console.error("Failed to fetch files:", err);
      set({ files: [] });
    }
  },

  handleContextMenu: (file) => {
    const setSelectedFiles = get().setSelectedFiles;
    const selectedFiles = get().selectedFiles;
    setSelectedFiles([...selectedFiles, file]);
    console.log("Context menu for file:", file);
  }
}));
