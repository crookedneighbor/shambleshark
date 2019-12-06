global.MutationObserver = class {
  disconnect () {}

  observe () {}
}

global.scrollTo = jest.fn()

afterEach(() => {
  // clean up any dom manipulation between tests
  document.getElementsByTagName('html')[0].innerHTML = ''

  jest.restoreAllMocks()
})
