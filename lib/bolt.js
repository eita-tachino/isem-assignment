import { App, LogLevel } from "@slack/bolt";
import {
  createHome,
  openModal,
  kadaiMeesage,
  kadaiView,
  updateKadaiMeesage,
  kadaiSubmit,
  startQuestion,
} from "./appHome";

export default function bolt(receiver) {
  const app = new App({
    receiver,
    // customPropertiesExtractor: (req) => {
    //   return {
    //     headers: req.headers,
    //     foo: "bar",
    //   };
    // },
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

    if (
      body.user.id === process.env.SLACK_USER_ID ||
      process.env.SLACK_USER_ID_MEMBER
    ) {
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
    } else {
      console.log("you are not allowed.");
    }
  });

  app.action("user_select", async ({ ack, body, say }) => {
    await ack();
  });

  // Receive view_submissions - add_noteで開いたmodalの処理
  app.view("modal_view", async ({ ack, body, context, view }) => {
    ack();

    // ここを年月日表示にする
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
        text: `:wave: ${data.note}`,
        // text: `:wave: Hey, I created this note for you in my _Home_: \n ${data.note} & ${data.url} \n you picked ${data.category} for your priority category!`,
        blocks: blocks,
      });
    } catch (e) {
      app.error(e);
    }
  });

  // blocksの中身をappHome.js pageで作成する
  app.action(
    "kadai-submit",
    async ({ ack, body, action, respond, context }) => {
      await ack();
      const blocks = kadaiSubmit(body.message.text);

      await respond({
        text: "この内容で提出しますか？",
        blocks: blocks,
        replace_original: false,
      });
    }
  );

  // blocksの中身をappHome.js pageで作成する
  app.action("start_question", async ({ ack, context, body }) => {
    await ack();
    const text = body.actions[0].value;

    const view = startQuestion(text);

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
  });

  app.view("kadai_question", async ({ ack, body, context, view }) => {
    await ack();
    const channelId = process.env.SLACK_PRIVATE_SECRET;
    const mondai = body.view.blocks[1].text.text;

    const data = {
      question: view.state.values.my_block.my_action.value,
      level:
        view.state.values["kadai-level"].category.selected_option.text.text,
      ideaTime:
        view.state.values["kadai-idea"].category.selected_option.text.text,
    };

    try {
      const result = await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channelId,
        text: `:wave: Hey, <@${body.user.id}> さんが質問をくれたよ！`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `<@${body.user.id}>さんが質問をくれたよ！\n問題:${mondai} \n質問内容: *${data.question}* \n難易度判定:${data.level} \n解法発意スピード:${data.ideaTime}です！`,
            },
          },
        ],
      });
    } catch (e) {
      app.error(e);
    }
  });

  app.action("start_button", async ({ ack, respond, body }) => {
    await ack();

    // この処理いらなかった
    // try {
    //   const result = await respond({
    //     text: ":loading_color:提出中:loading_color:",
    //     // replace_original: false,
    //   });
    // } catch (e) {
    //   console.log(e);
    //   app.error;
    // }

    const chanelId = process.env.SLACK_PRIVATE_SECRET;

    const data = {
      // content: body.state.values["kadai-question"].content.value,
      level:
        body.state.values["kadai-level"].category.selected_option.text.text,
      ideaTime:
        body.state.values["kadai-idea"].category.selected_option.text.text,
    };

    // ここで時間のかかる処理をの実行
    // sending email
    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await _sleep(500);

    try {
      const result = await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: chanelId,
        text: `:wave: Hey, <@${body.user.id}> さんが課題を終わらせました！ 難易度判定: ${data.level} 解法発意スピード: ${data.ideaTime} でした！`,
      });
    } catch (e) {
      app.error(e);
    }

    try {
      const result = await respond({
        text: "🎉提出完了🎉",
        delete_original: true,
        // replace_original: false,
      });
    } catch (e) {
      console.log(e);
      app.error;
    }
  });
}

// app.action("kadai-detail", async ({ ack, body, context }) => {
//   await ack();
//   const blocks = await kadaiMeesage();

//   try {
//     const result = await app.client.views.open({
//       token: context.botToken,
//       trigger_id: body.trigger_id,
//       view: blocks,
//     });
//   } catch (e) {
//     console.log(e);
//     app.error(e);
//   }
// });
