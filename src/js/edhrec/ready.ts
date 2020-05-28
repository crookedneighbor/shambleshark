import bus from "framebus";
import iframe from "Lib/iframe";
import { BUS_EVENTS as events } from "Constants";

type GetRecsOptions = {
  commanders: string[];
  cards: string[];
};

type GetRecsPayload = {
  errors?: Error[];
  [prop: string]: unknown;
};

function getRecs({
  commanders,
  cards,
}: GetRecsOptions): Promise<GetRecsPayload> {
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

export default function start() {
  if (!iframe.isInsideIframe()) {
    return;
  }

  bus.on(events.REQUEST_EDHREC_RECOMENDATIONS, function (payload, reply) {
    getRecs(payload as GetRecsOptions)
      .then((result) => {
        if (result.errors) {
          reply([result]);
          return;
        }

        reply([null, result]);
      })
      .catch((err) => reply([err]));
  });
}
