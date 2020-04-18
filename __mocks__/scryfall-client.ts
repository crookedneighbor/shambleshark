function ScryfallClient() {}

ScryfallClient.prototype.get = jest.fn();
ScryfallClient.prototype.post = jest.fn();

export = ScryfallClient;
