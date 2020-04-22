window.MutationObserver = class {
  disconnect() {
    // noop
  }

  observe() {
    // noop
  }
};

window.chrome = {
  runtime: {
    id: "some-id",
  },
  storage: {
    sync: {
      get() {
        // noop
      },
      set() {
        // noop
      },
    },
  },
};

window.scrollTo = jest.fn();

afterEach(() => {
  // clean up any dom manipulation between tests
  document.getElementsByTagName("html")[0].innerHTML = "";

  jest.restoreAllMocks();
});
