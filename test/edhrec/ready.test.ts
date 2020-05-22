import start from "Js/edhrec/ready";
import iframe from "Lib/iframe";
import wait from "Lib/wait";
import bus from "framebus";

import { mocked } from "ts-jest/utils";

jest.mock("framebus");

describe("EDHRec Ready", function () {
  let replySpy: jest.Mock;
  let fetchSpy: jest.Mock;

  beforeEach(function () {
    jest.spyOn(iframe, "isInsideIframe").mockReturnValue(true);

    mocked(bus.on).mockImplementation((event, reply) => {
      const response = {
        commanders: ["Arjun, the Shifting Flame"],
        cards: ["1 foo", "1 bar"],
      };
      replySpy = jest.fn();

      if (event === "REQUEST_EDHREC_RECOMENDATIONS") {
        reply(response, replySpy);
      }

      return true;
    });
    fetchSpy = jest.fn().mockResolvedValue("result");
    // jest doesn't have fetch on the window
    window.fetch = jest.fn().mockImplementation(
      (): Promise<any> => {
        return Promise.resolve({
          json: fetchSpy,
        });
      }
    );
  });

  afterEach(async function () {
    // allow pending promises to resolve
    await wait();
  });

  it("does not listen for recomendations if not in an iframe", function () {
    (iframe.isInsideIframe as jest.Mock).mockReturnValue(false);

    start();

    expect(bus.on).not.toBeCalled();
  });

  it("listens for recomendations", function () {
    start();

    expect(bus.on).toBeCalledTimes(1);
    expect(bus.on).toBeCalledWith(
      "REQUEST_EDHREC_RECOMENDATIONS",
      expect.any(Function)
    );
  });

  it("requests recomendations from edhrec", function () {
    start();

    expect(window.fetch).toBeCalledTimes(1);
    expect(window.fetch).toBeCalledWith("https://edhrec.com/api/recs/", {
      method: "POST",
      body: JSON.stringify({
        commanders: ["Arjun, the Shifting Flame"],
        cards: ["1 foo", "1 bar"],
        name: "",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("replies with response from edhrec", async function () {
    start();

    // let request promise resolve
    await wait();

    expect(replySpy).toBeCalledTimes(1);
    expect(replySpy).toBeCalledWith([null, "result"]);
  });

  it("sends back errors if request to edhrec resolves with errors", async function () {
    fetchSpy.mockResolvedValue({
      errors: ["1 error", "2 error"],
    });

    start();

    // let request promise resolve
    await wait();

    expect(replySpy).toBeCalledTimes(1);
    expect(replySpy).toBeCalledWith([
      {
        errors: ["1 error", "2 error"],
      },
    ]);
  });

  it("sends back error in array if request to edhrec fails", async function () {
    const err = new Error("fetch error");

    (window.fetch as jest.Mock).mockRejectedValue(err);

    start();

    // let request promise resolve
    await wait();

    expect(replySpy).toBeCalledTimes(1);
    expect(replySpy).toBeCalledWith([err]);
  });
});
