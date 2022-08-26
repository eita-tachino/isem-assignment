import { ExpressReceiver, HTTPReceiver, LogLevel } from "@slack/bolt";
import bolt from "../../../lib/bolt";

const receiver = new HTTPReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true,
  endpoints: "/api/slack/events",
  logLevel: LogLevel.DEBUG,
  customPropertiesExtractor: (req) => {
    return {
      headers: req.headers,
      foo: "bar",
    };
  },
});

// const receiver = new ExpressReceiver({
//   signingSecret: process.env.SLACK_SIGNING_SECRET,
//   customPropertiesExtractor: (req) => {
//     return {
//       headers: req.headers,
//       foo: "barrr",
//       origin: true,
//     };
//   },
// });

bolt(receiver);

export default receiver.requestListener;

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
