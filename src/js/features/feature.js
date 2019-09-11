const notImplementedError = new Error('Method not Implemented')

export default class Feature {
  addToDeckEditPage () {
    throw notImplementedError
  }

  isEnabled () {
    throw notImplementedError
  }
}
