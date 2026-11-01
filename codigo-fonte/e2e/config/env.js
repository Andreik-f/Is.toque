import fs from 'fs';
import path from 'path';

const ENV = process.env.ENV || 'local';
const envPath = path.resolve(process.cwd(), `config/${ENV}.env.json`);

if (!fs.existsSync(envPath)) {
  throw new Error(`Arquivo de ambiente não encontrado: ${envPath}`);
}

const env = JSON.parse(fs.readFileSync(envPath, 'utf-8'));

export default {
  ...env,
  ambiente: ENV
};
