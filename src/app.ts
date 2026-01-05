import dotenv from 'dotenv';
import { Bot, Context } from 'grammy';
import chalk from 'chalk';

import { type FileFlavor, hydrateFiles } from '@grammyjs/files';

import * as process from 'node:process';

type MyContext = FileFlavor<Context>;

import { checkId } from './cmds';

dotenv.config({ path: 'src/.env', quiet: true });

const { TG_BOT_TOKEN, SAVE_DIR } = process.env;

try {
  if (!TG_BOT_TOKEN) {
    throw new Error('Token is missing');
  }
  const bot = new Bot<MyContext>(TG_BOT_TOKEN);
  bot.api.config.use(hydrateFiles(bot.token));

  bot.on('message:document', async (ctx) => {
    const senderId = ctx.message.from.id;

    // Проверяем есть ли отправитель в белом списке
    if (!checkId(senderId)) {
      await ctx.api.sendMessage(senderId, `Ваш ID (${senderId}) не в белом списке`);
      return;
    }

    // Проверяем является ли отправленный документ торрент файлом
    if (ctx.message.document.mime_type !== 'application/x-bittorrent') {
      await ctx.api.sendMessage(senderId, `Это не торрент файл`);
      return;
    }

    // Если всё ОК - качаем файл и копируем в соответствующую папку
    const file_id = ctx.message.document.file_id;
    const file_name = ctx.message.document.file_name;
    const file = await ctx.api.getFile(file_id);
    await file.download(`${SAVE_DIR}/${file_name}`);
    await ctx.api.sendMessage(
      senderId,
      `Готово.\n\nФайл: ${file_name}\n\nРазмер: ${file.file_size ? (file.file_size / 1024).toFixed(2) : '?'} КиБ`,
    );
  });

  await bot.start();
} catch (err: unknown) {
  if (err instanceof Error) {
    console.error(chalk.red(err.message));
  } else {
    console.error(chalk.red(JSON.stringify(err, null, 2)));
  }
}
