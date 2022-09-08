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
          text: ":wave: 課題の表示件数は20件だよ",
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
            // text: `${note} \n ${url} `,
            text: `${note}  `,
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
            text: "a new assignment... \n(Text longer than 3000 characters will be truncated!)",
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
            include: ["public", "private"],
            exclude_bot_users: true,
          },
        },
      },
    ],
  };

  return modal;
};

export const kadaiView = (note, url) => {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:wave: *新しい課題のお届けです！*`,
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
          text: "課題が終わったら👇のボタンから課題レビューを作成してね！",
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
            text: "🚀 課題レビュー作成 🚀",
            emoji: true,
          },
          style: "primary",
          value: `${note}`,
          action_id: "kadai-submit",
        },
      ],
    },
  ];
  return JSON.stringify(blocks);
  // return blocks;
};

export const kadaiSubmit = (note) => {
  // body.message.text => text

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `_${note}_ はバッチリ解けましたか？👋\n\n分からないところがあればすぐに質問してくださいね🏎`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `:sailormoonrgbparty: GOGO Let's go この調子:sailormoonrgbparty:`,
        },
        // {
        //   type: "mrkdwn",
        //   text: `:sailormoonrgbparty: GOGO Let's go この調子:sailormoonrgbparty: <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>`,
        // },
      ],
    },
    {
      type: "input",
      block_id: "kadai-level",
      label: {
        type: "plain_text",
        text: "課題の難易度を選択 (必須)",
      },
      element: {
        type: "static_select",
        action_id: "category",
        options: [
          {
            text: {
              type: "plain_text",
              text: "🔥",
            },
            value: "easy,easy",
          },
          {
            text: {
              type: "plain_text",
              text: "🔥🔥",
            },
            value: "ぼちぼちやね",
          },
          {
            text: {
              type: "plain_text",
              text: "🔥🔥🔥",
            },
            value: "ムズイわ！",
          },
        ],
      },
    },
    {
      type: "input",
      block_id: "kadai-idea",
      label: {
        type: "plain_text",
        text: "解法はすぐに思い浮かびましたか？ (必須)",
      },
      element: {
        type: "static_select",
        action_id: "category",
        options: [
          {
            text: {
              type: "plain_text",
              text: "一瞬で思いついた！",
            },
            value: "blink an eyes!",
          },
          {
            text: {
              type: "plain_text",
              text: "2~3分考えた",
            },
            value: "bring me on!",
          },
          {
            text: {
              type: "plain_text",
              text: "5~10分考えた",
            },
            value: "tough one...",
          },
          {
            text: {
              type: "plain_text",
              text: "全く思いつかなかった",
            },
            value: "珍紛漢紛",
          },
        ],
      },
    },
    {
      type: "input",
      block_id: "kadai-question",
      element: {
        type: "plain_text_input",
        action_id: "my_action",
        placeholder: {
          type: "plain_text",
          text: "Don't hesitate to ask any questions!",
        },
      },
      label: {
        type: "plain_text",
        text: "気軽にじゃんじゃん質問してください",
        emoji: true,
      },
      optional: true,
    },
  ];
  const view = {
    type: "modal",
    callback_id: "kadai_post",
    title: {
      type: "plain_text",
      // text: `noteeee`,
      text: `${note}`,
    },
    submit: {
      type: "plain_text",
      text: "提出",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Close",
    },
    blocks: blocks,
  };

  return JSON.stringify(view);
};

export const startQuestion = (text) => {
  // const text = body.actions[0].value;

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🔊 *kadai君に質問*`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${text}`,
      },
    },
    {
      type: "input",
      block_id: "kadai-level",
      label: {
        type: "plain_text",
        text: "課題の難易度を選択 (必須)",
      },
      element: {
        type: "static_select",
        action_id: "category",
        options: [
          {
            text: {
              type: "plain_text",
              text: "🔥",
            },
            value: "easy,easy",
          },
          {
            text: {
              type: "plain_text",
              text: "🔥🔥",
            },
            value: "ぼちぼちやね",
          },
          {
            text: {
              type: "plain_text",
              text: "🔥🔥🔥",
            },
            value: "ムズイわ！",
          },
        ],
      },
    },
    {
      type: "input",
      block_id: "kadai-idea",
      label: {
        type: "plain_text",
        text: "解法はすぐに思い浮かびましたか？ (必須)",
      },
      element: {
        type: "static_select",
        action_id: "category",
        options: [
          {
            text: {
              type: "plain_text",
              text: "一瞬で思いついた！",
            },
            value: "blink an eyes!",
          },
          {
            text: {
              type: "plain_text",
              text: "2~3分考えた",
            },
            value: "bring me on!",
          },
          {
            text: {
              type: "plain_text",
              text: "5~10分考えた",
            },
            value: "tough one...",
          },
          {
            text: {
              type: "plain_text",
              text: "全く思いつかなかった",
            },
            value: "珍紛漢紛",
          },
        ],
      },
    },
    {
      type: "input",
      block_id: "my_block",
      element: {
        type: "plain_text_input",
        action_id: "my_action",
        placeholder: {
          type: "plain_text",
          text: "Don't hesitate to ask any questions!",
        },
      },
      label: {
        type: "plain_text",
        text: "気軽にじゃんじゃん質問してください",
        emoji: true,
      },
    },
  ];

  const view = {
    type: "modal",
    callback_id: "kadai_question",
    title: {
      type: "plain_text",
      text: "課題の質問と提出",
    },
    submit: {
      type: "plain_text",
      text: "Submit",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true,
    },
    blocks: blocks,
  };

  // JSON.stringifyしなくても動作する
  // return view;
  return JSON.stringify(view);
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

// export const updateKadaiMeesage = () => {
//   let url = "";

//   // try {
//   //   const { data } = await supabase
//   //     .from("slack-kadai")
//   //     .select("kadai_url, date, is_completed")
//   //     .order("created_at", { ascending: false })
//   //     .limit(1)
//   //     .single();
//   //   url = data.kadai_url;
//   // } catch (error) {
//   //   console.error(error);
//   // }

//   const blocks = [
//     {
//       type: "section",
//       text: {
//         type: "mrkdwn",
//         text: `:sonic: *Good jooob :sonic:* この調子でGOGO:sailormoonrgbparty:`,
//       },
//     },
//     {
//       type: "context",
//       elements: [
//         {
//           type: "mrkdwn",
//           text: "考え方を確認したい場合はヒントをCheck! \n 👉 <https://google.com|課題のヒントはこちら>",
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
//         text: "📰 *提出した課題*",
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
//       alt_text: "kadai",
//     },
//     {
//       type: "context",
//       elements: [
//         {
//           type: "mrkdwn",
//           text: "分からなかったところは調べたり、質問してね！",
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
//             text: "🎉👍 提出済 👍🎉",
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
//     callback_id: "kadai-submit",
//     title: {
//       type: "plain_text",
//       text: "提出した課題",
//     },
//     blocks: blocks,
//   };

//   return JSON.stringify(view);
// };
