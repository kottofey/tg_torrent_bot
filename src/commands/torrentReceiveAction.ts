import { type Bot, Context } from 'grammy';

type MyContext = FileFlavor<Context>;

import type { FileFlavor } from '@grammyjs/files';

import { checkId, convertFileSize } from '../helpers';

const { SAVE_DIR } = process.env;

export default function torrentReceiveAction(bot: Bot<MyContext>) {
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
      `
Готово.

Сохранено: ${SAVE_DIR}/${file_name}

Размер: ${file.file_size ? convertFileSize(file.file_size) : '?'}`,
    );
  });
}
