export const addHooksToCardManagementEvents = jest.fn();
export const getDeckMetadata = jest.fn();
export const getActiveDeckId = jest.fn();
export const getActiveDeck = jest.fn();
export const reset = jest.fn();
export const getDeck = jest.fn();
export const addCard = jest.fn();
export const updateEntry = jest.fn();
export const removeEntry = jest.fn();
export const cleanUp = jest.fn();
export const pushNotification = jest.fn();

// TODO moving to the mock style, we don't need to export a default
// object anymore. When the code has been fully moved over, we can
// remoe this bit
export default {
  addCard,
  addHooksToCardManagementEvents,
  cleanUp,
  getDeck,
  getDeckMetadata,
  pushNotification,
  removeEntry,
  updateEntry,
};
