// /*
//  * Home View - Use Block Kit Builder to compose: https://api.slack.com/tools/block-kit-builder
//  */
import { supabase } from "../utils/supabase";

export const updateView = async (user) => {
  // Intro message -
  let blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Welcome!* \nここで課題を確認できるよ📑 \n解き直して理解を深めよう!!",
      },
      accessory: {
        type: "button",
        action_id: "add_note",
        text: {
          type: "plain_text",
          text: "✒️ 課題を作成する",
          emoji: true,
        },
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: ":wave: 課題の表示件数は100件だよ",
        },
      ],
    },
    {
      type: "divider",
    },
  ];

  // Append new data blocks after the intro -
  let newData = [];

  try {
    const rawData = await supabase.from("slack_note").select("*");

    newData = rawData.data.slice().reverse(); // Reverse to make the latest first
    newData = newData.slice(0, 50); // Just display 20. BlockKit display has some limit.
  } catch (error) {
    console.error(error);
  }

  if (newData) {
    let noteBlocks = [];

    newData.map((o) => {
      let note = o.note;
      if (note.length > 3000) {
        note = note.substr(0, 2980) + "... _(truncated)_";
        console.log(note.length);
      }

      const url = o.url;
      let ts = new Date(o.created_at).toLocaleString();

      noteBlocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: note,
          },
        },
        {
          type: "image",
          title: {
            type: "plain_text",
            text: "📸",
            emoji: true,
          },
          image_url: url,
          alt_text: "kadai",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `⌚︎ ${ts}`,
            },
          ],
        },
        {
          type: "divider",
        },
      ];
      blocks = [...blocks, ...noteBlocks];
    });
  }

  // The final view -
  let view = {
    type: "home",
    callback_id: "home_view",
    title: {
      type: "plain_text",
      text: "Keep notes!",
    },
    blocks: blocks,
  };
  return JSON.stringify(view);
};

/* Display App Home */
export const createHome = async (user, data) => {
  if (data) {
    await supabase
      .from("slack_note")
      .insert([{ note: data.note, category: data.category, url: data.url }]);
  }

  const userView = await updateView(user);

  return userView;
};

/* Open a modal */
export const openModal = () => {
  const modal = {
    type: "modal",
    callback_id: "modal_view",
    title: {
      type: "plain_text",
      text: "課題を作成する",
    },
    submit: {
      type: "plain_text",
      text: "Create",
    },
    blocks: [
      // Text input
      {
        type: "input",
        block_id: "note01",
        label: {
          type: "plain_text",
          text: "課題内容",
        },
        element: {
          action_id: "content",
          type: "plain_text_input",
          placeholder: {
            type: "plain_text",
            text: "a new assignment... \n(Text longer than 3000 characters will be truncated!!)",
          },
          multiline: true,
        },
      },

      // image url
      {
        type: "input",
        block_id: "note02",
        label: {
          type: "plain_text",
          text: "課題URL",
        },
        element: {
          action_id: "img_url",
          type: "plain_text_input",
          placeholder: {
            type: "plain_text",
            text: "url for an assignment",
          },
        },
      },

      // Drop-down menu
      {
        type: "input",
        block_id: "note03",
        label: {
          type: "plain_text",
          text: "Categories",
        },
        element: {
          type: "static_select",
          action_id: "category",
          options: [
            {
              text: {
                type: "plain_text",
                text: "math1a",
              },
              value: "math1a",
            },
            {
              text: {
                type: "plain_text",
                text: "math2b",
              },
              value: "math2b",
            },
            {
              text: {
                type: "plain_text",
                text: "math3",
              },
              value: "math3",
            },
            {
              text: {
                type: "plain_text",
                text: "english",
              },
              value: "math1a",
            },
          ],
        },
      },
      {
        type: "section",
        block_id: "section678",
        text: {
          type: "mrkdwn",
          text: "投稿先をドロップダウンから選択",
        },
        accessory: {
          action_id: "user_select",
          type: "conversations_select",
          placeholder: {
            type: "plain_text",
            text: "投稿先を選択",
          },
          filter: {
            include: ["public", "im", "private"],
            exclude_bot_users: true,
          },
        },
      },
    ],
  };

  return modal;
};

// export const kadaiMeesage = async (url) => {

//   try {
//     const { data } = await supabase
//       .from("slack-kadai")
//       .select("kadai_url,created_at, date, is_completed")
//       .order("created_at", { ascending: false })
//       .limit(1)
//       .single();
//     url = data.kadai_url;
//   } catch (error) {
//     console.error(error);
//   }

//   const blocks = [
//     {
//       type: "section",
//       text: {
//         type: "mrkdwn",
//         text: `:pokeballspin: *本日の課題は君に決めた:pokeballspin:*`,
//       },
//     },
//     {
//       type: "context",
//       elements: [
//         {
//           type: "mrkdwn",
//           text: "分からないときは課題のヒントを見よう \n 👉 <https://google.com|課題のヒントはこちら>",
//         },
//       ],
//     },
//     {
//       type: "context",
//       elements: [
//         {
//           type: "image",
//           image_url:
//             "https://api.slack.com/img/blocks/bkb_template_images/placeholder.png",
//           alt_text: "placeholder",
//         },
//       ],
//     },
//     {
//       type: "section",
//       text: {
//         type: "mrkdwn",
//         text: "📰 *本日の課題*",
//       },
//     },
//     {
//       type: "divider",
//     },
//     {
//       type: "image",
//       title: {
//         type: "plain_text",
//         text: "📸",
//         emoji: true,
//       },
//       image_url: url,
//       // image_url: publicURL,
//       alt_text: "kadai",
//     },
//     {
//       type: "context",
//       elements: [
//         {
//           type: "mrkdwn",
//           text: "課題が終わったら👇のボタンを押して教えてね！",
//         },
//       ],
//     },
//     {
//       type: "actions",
//       elements: [
//         {
//           type: "button",
//           text: {
//             type: "plain_text",
//             text: "🎉🛎 課題完了 🛎🎉",
//             emoji: true,
//           },
//           style: "primary",
//           value: "click_me_123",
//           action_id: "kadai-submit",
//         },
//       ],
//     },
//   ];
//   // The final view -
//   let view = {
//     type: "modal",
//     callback_id: "kadai-detail",
//     title: {
//       type: "plain_text",
//       text: "Modal notes!",
//     },
//     // close: {
//     //   type: "plain_text",
//     //   text: "Cancel",
//     // },
//     // submit: {
//     //   type: "plain_text",
//     //   text: "OK",
//     // },
//     blocks: blocks,
//   };

//   return JSON.stringify(view);
// };

export const kadaiView = (note, url) => {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:wave: *新しい課題が届きました！*`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "image",
          image_url:
            "https://api.slack.com/img/blocks/bkb_template_images/placeholder.png",
          alt_text: "placeholder",
        },
      ],
    },

    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `📰 *本日の課題* \n ${note}`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "image",
      title: {
        type: "plain_text",
        text: "📸",
        emoji: true,
      },
      image_url: url,
      alt_text: "kadai",
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "分からないときは課題のヒントを見よう! \n 👉 <https://google.com|課題のヒントはこちら>",
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "image",
          image_url:
            "https://api.slack.com/img/blocks/bkb_template_images/placeholder.png",
          alt_text: "placeholder",
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "課題が終わったら👇のボタンを押して教えてね！",
        },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "🎉🛎 課題完了 🛎🎉",
            emoji: true,
          },
          style: "primary",
          value: "click_me_123",
          action_id: "kadai-submit",
        },
      ],
    },
  ];
  return JSON.stringify(blocks);
};

export const updateKadaiMeesage = async () => {
  let url = "";

  try {
    const { data } = await supabase
      .from("slack-kadai")
      .select("kadai_url, date, is_completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    url = data.kadai_url;
  } catch (error) {
    console.error(error);
  }

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:sonic: *Good jooob :sonic:* この調子でGOGO:sailormoonrgbparty:`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "考え方を確認したい場合はヒントをCheck! \n 👉 <https://google.com|課題のヒントはこちら>",
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "image",
          image_url:
            "https://api.slack.com/img/blocks/bkb_template_images/placeholder.png",
          alt_text: "placeholder",
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "📰 *提出した課題*",
      },
    },
    {
      type: "divider",
    },
    {
      type: "image",
      title: {
        type: "plain_text",
        text: "📸",
        emoji: true,
      },
      image_url: url,
      alt_text: "kadai",
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "分からなかったところは調べたり、質問してね！",
        },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "🎉👍 提出済 👍🎉",
            emoji: true,
          },
          style: "primary",
          value: "click_me_123",
          action_id: "kadai-submit",
        },
      ],
    },
  ];
  // The final view -
  let view = {
    type: "modal",
    callback_id: "kadai-detail",
    title: {
      type: "plain_text",
      text: "提出した課題",
    },
    blocks: blocks,
  };

  return JSON.stringify(view);
};
