import { type Bot, Context } from 'grammy';

type MyContext = FileFlavor<Context>;

import type { FileFlavor } from '@grammyjs/files';

export default function Command(bot: Bot<MyContext>) {}
