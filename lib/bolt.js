import { App, LogLevel } from "@slack/bolt";
import {
  createHome,
  openModal,
  kadaiMeesage,
  kadaiView,
  updateKadaiMeesage,
} from "./appHome";

export default function bolt(receiver) {
  const app = new App({
    receiver,
    token: process.env.SLACK_BOT_TOKEN,
    logLevel: LogLevel.DEBUG,
  });

  app.event("app_home_opened", async ({ event, context, payload }) => {
    // Display App Home
    const homeView = await createHome(event.user);

    try {
      const result = await app.client.views.publish({
        token: context.botToken,
        user_id: event.user,
        view: homeView,
      });
    } catch (e) {
      app.error(e);
    }
  });

  // Receive button actions from App Home UI "課題を作成する"
  app.action("add_note", async ({ body, context, ack }) => {
    ack();

    console.log("--->", body.user.id);

    // if (body.user.id === process.env.SLACK_USER_ID) {
    const view = openModal();

    try {
      const result = await app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: view,
      });
    } catch (e) {
      console.log(e);
      app.error(e);
    }
    // } else {
    //   console.log("you are not allowed.");
    // }
  });

  app.action("user_select", async ({ ack, body, say }) => {
    await ack();
  });

  app.action("kadai-detail", async ({ ack, body, context }) => {
    await ack();
    const blocks = await kadaiMeesage();

    try {
      const result = await app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: blocks,
      });
    } catch (e) {
      console.log(e);
      app.error(e);
    }
  });

  app.action("kadai-submit", async ({ ack, body, context }) => {
    await ack();
    const chanelId = process.env.SLACK_PRIVATE_SECRET;
    // const blocks = await updateKadaiMeesage();

    // try {
    //   const result = await app.client.views.update({
    //     token: context.botToken,
    //     view_id: body.view.id,
    //     view: blocks,
    //   });
    // } catch (e) {
    //   console.log(e);
    //   app.error(e);
    // }

    try {
      const result = await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: chanelId,
        text: `:wave: Hey, <@${body.user.id}> さんが課題を終わらせました！`,
      });
    } catch (e) {
      app.error(e);
    }
  });

  // Receive view_submissions
  app.view("modal_view", async ({ ack, body, context, view }) => {
    ack();

    const ts = new Date();

    const data = {
      timestamp: ts.toLocaleString(),
      note: view.state.values.note01.content.value,
      url: view.state.values.note02.img_url.value,
      category: view.state.values.note03.category.selected_option.value,
      chanelId: view.state.values.section678.user_select.selected_conversation,
    };

    const homeView = await createHome(body.user.id, data);

    const blocks = kadaiView(data.note, data.url);

    try {
      const result = await app.client.apiCall("views.publish", {
        token: context.botToken,
        user_id: body.user.id,
        view: homeView,
      });
    } catch (e) {
      console.log(e);
      app.error(e);
    }

    try {
      const result = await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: data.chanelId,
        text: `:wave: Hey, I created this note for you in my _Home_: \n ${data.note} & ${data.url} \n you picked ${data.category} for your priority category!`,
        blocks: blocks,
      });
    } catch (e) {
      app.error(e);
    }
  });
}
