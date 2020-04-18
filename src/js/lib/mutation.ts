// adapted from http://ryanmorr.com/using-mutation-observers-to-watch-for-element-availability/

let readyObserver: MutationObserver | null;
const listeners: { selector: string; fn: Function }[] = [];

export function reset() {
  readyObserver = null;
  listeners.splice(0, listeners.length);
}

function check() {
  // Check the DOM for elements matching a stored selector
  listeners.forEach((listener) => {
    // Query for elements matching the specified selector
    const elements = Array.of(
      document.querySelectorAll<HTMLElement>(listener.selector)
    );

    elements.forEach((element) => {
      // Make sure the callback isn't invoked with the
      // same element more than once
      if (!(element as any).ready) {
        (element as any).ready = true;
        // Invoke the callback with the element
        listener.fn.call(element, element);
      }
    });
  });
}

export function ready(selector: string, fn: Function) {
  // Store the selector and callback to be monitored
  listeners.push({ selector, fn });
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

export function change(parentSelector: string, fn: Function) {
  ready(parentSelector, (parentNode: Element) => {
    const observer = new window.MutationObserver(function () {
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
