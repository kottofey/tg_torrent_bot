import dotenv from 'dotenv';

import process from 'node:process';

dotenv.config({ path: 'src/.env', quiet: true });

const { ALLOWED_IDS } = process.env;

const ids = (ALLOWED_IDS?.split('$') || []).map((id: string) => parseInt(id));

if (!ids.length) {
  throw new Error('No ids specified in .env');
}

const checkId = (id: number) => ids.includes(id);

export default checkId;
