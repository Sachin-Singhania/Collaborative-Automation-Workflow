export const actionapps = [
  // {
  //   appId: 'd7731f34-d89c-439e-8932-bbfb8350368f',
  //   name: 'Webhooks',
  //   icon: '🔗',
  // },
  {
    appId: 'discord',
    name: 'discord',
    icon: '💬',
  },
  {
    appId: 'google-sheets',
    name: 'Google Sheets',
    icon: '📊',
  },
  {
    appId: '4eb59280-6077-43b2-85db-0f37896f521e',
    name: 'Email',
    icon: '📧',
  },
];
export const Triggerapps=[
  {
    appId: 'd7731f34-d89c-439e-8932-bbfb8350368f',
    name: 'Webhooks',
    icon: '🔗',
  },
]

export const triggers = {
  'd7731f34-d89c-439e-8932-bbfb8350368f': [
    {
      id: 'catch_hook',
      name: 'Catch Hook',
      description: 'Catch a web hook',
    },
    // {
    //   id: 'catch_raw_hook',
    //   name: 'Catch Raw Hook',
    //   description: 'Catch a raw web hook',
    // },
  ],
  // discord: [
  //   {
  //     id: 'new_message',
  //     name: 'New Message',
  //     description: 'Trigger on new message',
  //   },
  // ],
  // 'google-sheets': [
  //   {
  //     id: 'new_row',
  //     name: 'New Row',
  //     description: 'Trigger on new row',
  //   },
  // ],
};

export const actions = {
  discord: [
    {
      id: 'send_channel_message',
      name: 'Send Channel Message',
      description: 'Send a message to a channel',
      configure :{
        channel : "Select Channel",
        message : "Enter Text",
      }
    },
  ],
  'google-sheets': [
    {
      id: 'create_row',
      name: 'Create Row',
      description: 'Create a new row',
    },
  ],
  '4eb59280-6077-43b2-85db-0f37896f521e': [
    {
      id: 'send_email',
      name: 'Send Email',
      description: 'Send an email',
      configure :{
          to: "Enter Text or insert",
          subject: "Enter Text or insert",
          body: "Enter Text or insert"
      },
    },
  ],
};

export const generateWebhookUrl = (): string => {
  const randomId = Math.random().toString(36).substring(2, 15);
  return `http://localhost:3000/api/webhook/${randomId}/`;
};

export const childKeyFields = [
  'id',
  'name',
  'email',
  'timestamp',
  'status',
  'value',
  'type',
];
export const QUEUE_NAME= "executions123"