import fs from 'fs/promises';
import path from 'path';
import { Document, Page, Post } from ".";
import { getConfig } from './config.js';

let content: Document[] | null = null;

async function getContent(): Promise<Document[]> {
  if (!content) {
    const config = await getConfig();
    const file = await fs.readFile(path.join(process.cwd(), config.outFile), 'utf-8');
    content = JSON.parse(file);
  }
  return content as Document[];
}

export const isPage = (document: Document): document is Page => document.type === 'page';
export const isPost = (document: Document): document is Post => document.type === 'post';

export const ofLocale = (locale: string) => (document: Document) => document.locale === locale;
export const sortChronologically = (a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime();

export const getDocuments = async () => getContent();
