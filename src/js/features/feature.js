const notImplementedError = new Error('Method not Implemented')

export default class Feature {
  run () {
    throw notImplementedError
  }

  isEnabled () {
    throw notImplementedError
  }
}
