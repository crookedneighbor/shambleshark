function getDeckId(): string | false {
  const pathParts = window.location.pathname.split("/");

  return pathParts[2] === "decks" && pathParts[3];
}

export default {
  getDeckId,
};
