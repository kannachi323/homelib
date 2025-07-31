let _fetchFiles: ((path: string) => void) | null = null;
let _currentPath: string | null = null;

export function setFetchFiles(fn: (path: string) => void) {
  _fetchFiles = fn;
}

export function getFetchFiles(): ((path: string) => void) {
  if (!_fetchFiles) {
    throw new Error("Fetch files function is not set. Please call setFetchFiles first.");
  }
  return _fetchFiles;
}

export function setCurrentPath(path: string | null) {
  _currentPath = path;
}

export function getCurrentPath(): string {
  return _currentPath || '/';
}