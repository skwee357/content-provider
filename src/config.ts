import path from "path";
import fs from 'fs/promises';

const CONFIG_FILE = 'content.config.json';

interface Config {
  sourceDir: string;
  outDir: string;
  defaultLocale: string;
  locales: string[];
}

let _config: Config | null = null;

export async function getConfig() {
  if (_config === null) {
    const p = path.join(process.cwd(), CONFIG_FILE);
    const stats = await fs.stat(p);

    if (!stats.isFile()) {
      throw new Error(`config ${CONFIG_FILE} not found`);
    }

    const data = await fs.readFile(p, 'utf-8');
    const config = JSON.parse(data);

    if (!config.sourceDir || !config.outDir) {
      throw new Error(`config ${CONFIG_FILE} has invalid content`);
    }

    _config = config as Config;
  }

  return _config;
}
