import fs from 'fs/promises';
import { globby } from 'globby';
import path from 'path';
import { Post } from ".";
import { getConfig } from './config.js';

let _posts: Post[] | null = null;

export const sortChronologically = (a: Post, b: Post) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();

export async function getPosts(): Promise<Post[]> {
  if (!_posts) {
    const config = await getConfig();
    const outDir = path.join(process.cwd(), config.outDir);
    const paths = (await globby('*.json', { cwd: outDir }));
    _posts = (await Promise.all(paths.map(file => fs.readFile(path.join(outDir, file), 'utf-8'))))
      .map(content => JSON.parse(content));
  }
  return _posts as Post[];
}
