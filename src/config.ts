import path from "path";
import fs from 'fs/promises';
import { Static, Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

const CONFIG_FILE = 'content.config.json';

const T = Type.Object({
  sourceDir: Type.String(),
  outFile: Type.String(),
  defaultLocale: Type.String(),
  locales: Type.Array(Type.String()),
});

const Config = TypeCompiler.Compile(T);
type Config = Static<typeof T>;

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

    if (!Config.Check(config)) {
      throw new Error(`config ${CONFIG_FILE} has invalid content`);
    }

    _config = config;
  }

  return _config;
}
