import bus from "framebus";
import iframe from "Lib/iframe";
import { BUS_EVENTS as events } from "Constants";

export default function start() {
  if (!iframe.isInsideIframe()) {
    return;
  }

  bus.on(events.REQUEST_EDHREC_RECOMENDATIONS, function (payload, reply) {
    getRecs(payload)
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

function getRecs({ commanders, cards }) {
  return global
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
