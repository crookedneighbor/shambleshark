global.MutationObserver = class {
  disconnect () {}

  observe () {}
}

afterEach(() => {
  // clean up any dom manipulation between tests
  document.getElementsByTagName('html')[0].innerHTML = ''

  jest.restoreAllMocks()
})
