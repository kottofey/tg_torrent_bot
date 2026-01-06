import { type Bot, Context } from 'grammy';

type MyContext = FileFlavor<Context>;

import type { FileFlavor } from '@grammyjs/files';

import os from 'node:os';

export default function pingCommand(bot: Bot<MyContext>) {
  bot.command('ping', async (ctx) => {
    const senderId = ctx.message?.from.id;

    if (senderId) {
      await ctx.api.sendMessage(
        senderId,
        `
\`\`\`Pong!

Server: ${os.hostname()}
Server IP: ${os.hostname()}
Node version: ${process.version}\`\`\`
`,
        {
          parse_mode: 'MarkdownV2',
        },
      );
    }
  });

  console.log('ping command exec');
}
