import dotenv from 'dotenv';
import { Bot, Context } from 'grammy';
import chalk from 'chalk';

import cmd from 'node-cmd';

import { type FileFlavor, hydrateFiles } from '@grammyjs/files';

import type { ITorrent } from 'src/types';

import { access } from 'node:fs/promises';

type MyContext = FileFlavor<Context>;

import * as constants from 'node:constants';

import process from 'node:process';

import { checkId, convertFileSize } from './cmds';

dotenv.config({ path: 'src/.env', quiet: true });

const { TG_BOT_TOKEN, SAVE_DIR, ADMIN_TG_ID, QBT_LOGIN, QBT_PASSWORD, QBT_URL } = process.env;

try {
  if (!TG_BOT_TOKEN) {
    throw new Error('Token is missing');
  }
  const bot = new Bot<MyContext>(TG_BOT_TOKEN);
  bot.api.config.use(hydrateFiles(bot.token));

  // -----------------------------------------------------------------------------
  // Обработка сигналов завершения
  // -----------------------------------------------------------------------------

  process.once('SIGINT', async () => {
    console.log('SIGINT received');
    await bot.stop();
  });
  process.once('SIGTERM', async () => {
    console.log('SIGTERM received');
    await bot.stop();
  });

  // проверяем существование папки для скачивания
  try {
    if (SAVE_DIR) await access(SAVE_DIR, constants.F_OK);
  } catch (err) {
    if (ADMIN_TG_ID) await bot.api.sendMessage(ADMIN_TG_ID, `Папки для скачивания не существует, проверьте файл .env`);
    console.error(chalk.red('Папки для скачивания не существует, проверьте файл .env\n\n'), err);
  }

  bot.on('message:document', async (ctx) => {
    const senderId = ctx.message.from.id;

    // Проверяем есть ли отправитель в белом списке
    if (!checkId(senderId)) {
      await ctx.api.sendMessage(senderId, `Ваш ID (${senderId}) не в белом списке`);
      return;
    }

    // Проверяем является ли отправленный документ торрент файлом
    if (ctx.message.document.mime_type !== 'application/x-bittorrent') {
      await ctx.api.sendMessage(senderId, `Это не торренд файл`);
      return;
    }

    // Если всё ОК - качаем файл и копируем в соответствующую папку
    const file_id = ctx.message.document.file_id;
    const file_name = ctx.message.document.file_name;
    const file = await ctx.api.getFile(file_id);

    await file.download(`${SAVE_DIR}/${file_name}`);

    await ctx.api.sendMessage(
      senderId,
      `Готово.\n\nСохранено: ${SAVE_DIR}/${file_name}\n\nРазмер: ${file.file_size ? (file.file_size / 1024).toFixed(2) : '?'} КиБ`,
    );
  });

  bot.command('torrents_list', async (ctx) => {
    const senderId = ctx.message?.from.id;
    if (senderId) {
      cmd.run(
        `qbt torrent list --format json --url ${QBT_URL} --username ${QBT_LOGIN} --password ${QBT_PASSWORD}`,
        async (_error, data) => {
          const json = JSON.parse(data).map((torrent: ITorrent) => {
            return {
              name: torrent.name,
              progress: (torrent.progress * 100).toFixed(2).toString() + '%',
              size: convertFileSize(torrent.total_size),
              hash: torrent.hash,
            };
          });
          await ctx.api.sendMessage(senderId, `\`\`\`${JSON.stringify(json, null, 2)}\`\`\``, {
            parse_mode: 'MarkdownV2',
          });
        },
      );
    }
  });

  bot.command('ping', async (ctx) => {
    const senderId = ctx.message?.from.id;

    if (senderId) {
      await ctx.api.sendMessage(
        senderId,
        `
\`\`\`Pong!

Node version: ${process.version}\`\`\`
`,
        {
          parse_mode: 'MarkdownV2',
        },
      );
    }
  });

  await bot.api.setMyCommands([
    { command: 'torrents_list', description: 'Список торрентов на закачке' },
    { command: 'ping', description: 'Понг! И некая служебная информация' },
  ]);

  await bot.start();
} catch (err: unknown) {
  if (err instanceof Error) {
    console.error(chalk.red(err.message));
  } else {
    console.error(chalk.red(JSON.stringify(err, null, 2)));
  }
}
