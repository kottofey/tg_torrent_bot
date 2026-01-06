import type { Bot, Context } from 'grammy';
import cmd from 'node-cmd';

type MyContext = FileFlavor<Context>;

import type { FileFlavor } from '@grammyjs/files';

import type { ITorrent } from '../types';
import { convertFileSize } from '../helpers';

const { QBT_LOGIN, QBT_PASSWORD, QBT_URL } = process.env;

export default function torrentsListActiveCommand(bot: Bot<MyContext>) {
  bot.command('torrents_list_active', async (ctx) => {
    const senderId = ctx.message?.from.id;
    if (senderId) {
      cmd.run(
        `qbt torrent list --filter downloading --format json --url ${QBT_URL} --username ${QBT_LOGIN} --password ${QBT_PASSWORD}`,
        async (_error, data) => {
          const json = JSON.parse(data).map((torrent: ITorrent) => {
            return {
              name: torrent.name,
              progress: (torrent.progress * 100).toFixed(2).toString() + '%',
              size: convertFileSize(torrent.total_size),
              hash: torrent.hash,
            };
          });

          if (json.length === 0) {
            json.push('Список пуст');
          }
          await ctx.api.sendMessage(senderId, `\`\`\`${JSON.stringify(json, null, 2)}\`\`\``, {
            parse_mode: 'MarkdownV2',
          });
        },
      );
    }
  });
}
