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
