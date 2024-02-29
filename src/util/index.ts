// export function $node<T extends HTMLElement = HTMLElement>(selector: string): T | null {
//   return document.querySelector<T>(selector);
// }

declare global {
  interface Window {
    GM_registerMenuCommand: (title: string, callback: () => void) => void;
  }
}

export function $node<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

export function $nodeByText<T extends HTMLElement = HTMLElement>(
  selector: string,
  innerText: string
): T | null {
  const nodes = document.querySelectorAll<T>(selector);
  for (const node of nodes) {
    if (node.innerText === innerText) {
      return node;
    }
  }

  return null;
}
