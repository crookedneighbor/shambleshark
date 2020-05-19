// adapted from http://ryanmorr.com/using-mutation-observers-to-watch-for-element-availability/

type MutationHandler = (el: HTMLElement) => void;
type Listener = {
  elements: HTMLElement[];
  selector: string;
  fn: MutationHandler;
};

let readyObserver: MutationObserver | null;
const listeners: Listener[] = [];

export function reset(): void {
  readyObserver = null;
  listeners.splice(0, listeners.length);
}

function check(): void {
  // Check the DOM for elements matching a stored selector
  listeners.forEach((listener) => {
    // Query for elements matching the specified selector
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(listener.selector)
    );

    elements.forEach((element) => {
      // Invoke the callback with the element
      if (!listener.elements.find((el) => el === element)) {
        listener.elements.push(element);
        listener.fn(element);
      }
    });
  });
}

export function ready(selector: string, fn: MutationHandler): void {
  // Store the selector and callback to be monitored
  listeners.push({ selector, fn, elements: [] });

  if (!readyObserver) {
    // Watch for changes in the document
    readyObserver = new window.MutationObserver(check);
    readyObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // Check if the element is currently in the DOM
  check();
}

export function change(parentSelector: string, fn: MutationHandler): void {
  ready(parentSelector, (parentNode) => {
    const observer = new window.MutationObserver(() => {
      fn(parentNode);
    });
    observer.observe(parentNode, {
      childList: true,
      subtree: true,
    });
  });
}

export default {
  ready,
  change,
};
