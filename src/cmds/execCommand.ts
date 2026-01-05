// import chalk from 'chalk';
//
// export default async function execCommand(cmd: string | undefined, botInstance: TelegramBot, chatId: number) {
//   switch (cmd) {
//     case 'list':
//       await list(botInstance, chatId);
//       break;
//     case 'del':
//       await del(botInstance, chatId);
//       break;
//     default:
//       await botInstance.sendMessage(chatId, ` ***Unknown command*** ${cmd}`, {
//         parse_mode: 'MarkdownV2',
//       });
//   }
// }
