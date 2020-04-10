// adapted from http://ryanmorr.com/using-mutation-observers-to-watch-for-element-availability/

let readyObserver;
const listeners = [];

export function reset() {
  readyObserver = null;
  listeners.splice(0, listeners.length);
}

export function ready(selector, fn) {
  // Store the selector and callback to be monitored
  listeners.push({
    selector: selector,
    fn: fn,
  });
  if (!readyObserver) {
    // Watch for changes in the document
    readyObserver = new global.MutationObserver(check);
    readyObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // Check if the element is currently in the DOM
  check();
}

export function change(parentSelector, fn) {
  ready(parentSelector, (parentNode) => {
    const observer = new global.MutationObserver(function () {
      fn(parentNode);
    });
    observer.observe(parentNode, {
      childList: true,
      subtree: true,
    });
  });
}

function check() {
  // Check the DOM for elements matching a stored selector
  listeners.forEach((listener) => {
    // Query for elements matching the specified selector
    const elements = Array.from(document.querySelectorAll(listener.selector));

    elements.forEach((element) => {
      // Make sure the callback isn't invoked with the
      // same element more than once
      if (!element.ready) {
        element.ready = true;
        // Invoke the callback with the element
        listener.fn.call(element, element);
      }
    });
  });
}

export default {
  ready,
  change,
};
