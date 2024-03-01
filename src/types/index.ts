declare global {
  interface Window {
    GM_registerMenuCommand: (title: string, callback: () => void) => void;
  }
}

export {};
