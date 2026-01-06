import type { Bot, Context } from 'grammy';

type MyContext = FileFlavor<Context>;

import type { FileFlavor } from '@grammyjs/files';

import { pingCommand, torrentsListActiveCommand, torrentsListAllCommand, torrentReceiveAction } from '../commands';

export default async function initBot(bot: Bot<MyContext>) {
  await bot.api.setMyCommands([
    { command: 'torrents_list_all', description: 'Список торрентов полный' },
    { command: 'torrents_list_active', description: 'Список торрентов на закачке' },
    { command: 'ping', description: 'Понг! И некая служебная информация' },
    { command: 'start', description: 'Старт бота' },
  ]);

  // -----------------------------------------------------------------------------
  // Установка комманд
  // -----------------------------------------------------------------------------

  pingCommand(bot);
  torrentsListActiveCommand(bot);
  torrentsListAllCommand(bot);
  torrentReceiveAction(bot);
}
