export function $node<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

export function $safeFind<T extends HTMLElement = HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (node === null) {
    throw new Error(`Element with selector ${selector} not found`);
  }

  return node;
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
