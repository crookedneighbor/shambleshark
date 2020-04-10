import start from "Js/scryfall/tagger";
import iframe from "Lib/iframe";
import bus from "framebus";

describe("Tagger", () => {
  const mockXHR = {
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
  const oldXMLHttpRequest = window.XMLHttpRequest;

  beforeEach(() => {
    jest.spyOn(iframe, "isInsideIframe").mockReturnValue(true);

    jest.spyOn(bus, "on").mockImplementation();
    jest.spyOn(bus, "emit").mockImplementation();

    window.XMLHttpRequest = jest.fn(() => mockXHR);

    const meta = document.createElement("meta");
    meta.setAttribute("name", "csrf-token");
    meta.setAttribute("content", "token");

    document.head.appendChild(meta);
  });

  afterEach(() => {
    window.XMLHttpRequest = oldXMLHttpRequest;
  });

  it("does not listen for recomendations if not in an iframe", () => {
    iframe.isInsideIframe.mockReturnValue(false);

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
    bus.on.mockImplementation((eventName, cb) => {
      cb(
        {
          set: "set",
          number: "number",
        },
        replySpy
      );
    });

    start();

    expect(mockXHR.open).toBeCalledTimes(1);
    expect(mockXHR.open).toBeCalledWith(
      "POST",
      "https://tagger.scryfall.com/graphql",
      true
    );

    expect(mockXHR.setRequestHeader).toBeCalledWith(
      "Content-Type",
      "application/json"
    );
    expect(mockXHR.setRequestHeader).toBeCalledWith("X-CSRF-Token", "token");
    expect(mockXHR.send).toBeCalledWith(expect.stringContaining("FetchCard"));

    const body = JSON.parse(mockXHR.send.mock.calls[0][0]);

    expect(body.variables.set).toBe("set");
    expect(body.variables.number).toBe("number");

    mockXHR.onreadystatechange();

    expect(replySpy).toBeCalledTimes(1);
    expect(replySpy).toBeCalledWith("fake-card");
  });
});
