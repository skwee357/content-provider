import fs from 'fs/promises';
import path from 'path';
import { Post } from ".";
import { getConfig } from './config.js';

let _posts: Post[] | null = null;

export const sortChronologically = (a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime();

export async function getPosts(): Promise<Post[]> {
  if (!_posts) {
    const config = await getConfig();
    const file = await fs.readFile(path.join(process.cwd(), config.outFile), 'utf-8');
    _posts = JSON.parse(file);
  }
  return _posts as Post[];
}
