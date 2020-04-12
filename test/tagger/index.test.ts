import start from "Js/scryfall/tagger";
import iframe from "Lib/iframe";
import * as bus from "framebus";
import SpyInstance = jest.SpyInstance;

describe("Tagger", () => {

  let xhrSpy: SpyInstance;
  const xhrMock: Partial<XMLHttpRequest> = {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    readyState: 4,
    status: 200,
    responseText: JSON.stringify({
      data: {
        card: "fake-card",
      },
    }),
  };

  beforeEach(() => {
    jest.spyOn(iframe, "isInsideIframe").mockReturnValue(true);

    jest.spyOn(bus, "on").mockImplementation();
    jest.spyOn(bus, "emit").mockImplementation();

    xhrSpy = jest
      .spyOn(window, "XMLHttpRequest")
      .mockImplementation(() => xhrMock as XMLHttpRequest);

    const meta = document.createElement("meta");
    meta.setAttribute("name", "csrf-token");
    meta.setAttribute("content", "token");

    document.head.appendChild(meta);
  });

  afterEach(() => {
    xhrSpy.mockRestore();
  });

  it("does not listen for recomendations if not in an iframe", () => {
    (iframe.isInsideIframe as jest.Mock).mockReturnValue(false);

    start();

    expect(bus.on).not.toBeCalled();
  });

  it("emits a ready event", () => {
    start();

    expect(bus.emit).toBeCalledTimes(1);
    expect(bus.emit).toBeCalledWith("TAGGER_READY");
  });

  it("listens for tag requests", () => {
    start();

    expect(bus.on).toBeCalledTimes(1);
    expect(bus.on).toBeCalledWith("TAGGER_TAGS_REQUEST", expect.any(Function));
  });

  it("requests tags", async () => {
    const replySpy = jest.fn();
    (bus.on as jest.Mock).mockImplementation(
      (eventName: string, cb: Function) => {
        cb(
          {
            set: "set",
            number: "number",
          },
          replySpy
        );
      }
    );

    start();

    expect(xhrMock.open).toBeCalledTimes(1);
    expect(xhrMock.open).toBeCalledWith(
      "POST",
      "https://tagger.scryfall.com/graphql",
      true
    );

    expect(xhrMock.setRequestHeader).toBeCalledWith(
      "Content-Type",
      "application/json"
    );
    expect(xhrMock.setRequestHeader).toBeCalledWith("X-CSRF-Token", "token");
    expect(xhrMock.send).toBeCalledWith(expect.stringContaining("FetchCard"));

    const body = JSON.parse((xhrMock.send as jest.Mock).mock.calls[0][0]);

    expect(body.variables.set).toBe("set");
    expect(body.variables.number).toBe("number");

    (xhrMock.onreadystatechange as Function)();

    expect(replySpy).toBeCalledTimes(1);
    expect(replySpy).toBeCalledWith("fake-card");
  });
});
