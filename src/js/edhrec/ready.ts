import bus from "framebus";
import iframe from "Lib/iframe";
import { BUS_EVENTS as events } from "Constants";
import type { EDHRecResponseHandler, EDHRecResponse } from "Js/types/edhrec";

type GetRecsOptions = {
  commanders: string[];
  cards: string[];
};

function getRecs({
  commanders,
  cards,
}: GetRecsOptions): Promise<EDHRecResponse> {
  return window
    .fetch("https://edhrec.com/api/recs/", {
      method: "POST",
      body: JSON.stringify({
        commanders,
        cards,
        name: "",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.json());
}

export default function start(): void {
  if (!iframe.isInsideIframe()) {
    return;
  }

  bus.on(events.REQUEST_EDHREC_RECOMENDATIONS, function (
    payload: GetRecsOptions,
    reply: EDHRecResponseHandler
  ) {
    getRecs(payload)
      .then((res) => reply(res))
      .catch((err) =>
        reply({
          commanders: [],
          outRecs: [],
          inRecs: [],
          errors: [err],
        })
      );
  });
}
