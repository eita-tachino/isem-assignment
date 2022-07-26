import { HTTPReceiver, LogLevel } from "@slack/bolt";

const receiver = new HTTPReceiver({
  signingSecret: "",
  processBeforeResponse: true,
  endpoints: "/api/slack/events",
  logLevel: LogLevel.DEBUG,
});

export default receiver.requestListener;

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
