import dotenv from 'dotenv';
import { Bot, Context } from 'grammy';
import chalk from 'chalk';

import { type FileFlavor, hydrateFiles } from '@grammyjs/files';

import { access } from 'node:fs/promises';

type MyContext = FileFlavor<Context>;

import * as constants from 'node:constants';

import { checkId, initBot } from './helpers';

dotenv.config({ path: 'src/.env', quiet: true });

const { TG_BOT_TOKEN, SAVE_DIR, ADMIN_TG_ID } = process.env;

try {
  if (!TG_BOT_TOKEN) {
    throw new Error('Token is missing');
  }
  const bot = new Bot<MyContext>(TG_BOT_TOKEN);
  bot.api.config.use(hydrateFiles(bot.token));

  // -----------------------------------------------------------------------------
  // Обработка сигналов завершения
  // -----------------------------------------------------------------------------

  process.once('SIGINT', () => {
    console.log('SIGINT received');
    void bot.stop();
  });
  process.once('SIGTERM', () => {
    console.log('SIGTERM received');
    void bot.stop();
  });

  // проверяем существование папки для скачивания
  try {
    if (SAVE_DIR) await access(SAVE_DIR, constants.F_OK);
  } catch (err) {
    if (ADMIN_TG_ID) await bot.api.sendMessage(ADMIN_TG_ID, `Папки для скачивания не существует, проверьте файл .env`);
    console.error(chalk.red('Папки для скачивания не существует, проверьте файл .env\n\n'), err);
  }

  await initBot(bot);

  await bot.start();
} catch (err: unknown) {
  if (err instanceof Error) {
    console.error(chalk.red(err.message));
  } else {
    console.error(chalk.red(JSON.stringify(err, null, 2)));
  }
}
