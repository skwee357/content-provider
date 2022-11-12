export interface Translation {
  title: string;
  url: string;
  locale: string;
}

export interface Tag {
  title: string;
  slug: string;
  url: string;
}

export type FileType = 'md' | 'mdx';

interface DocumentBase {
  type: 'page' | 'post';
  file: {
    name: string;
    type: FileType;
  };
  title: string;
  slug: string;
  summary: string;
  canonical?: string;
  url: string;
  locale: string;
  translations: Translation[];
  rawContent: string;
}

export interface Page extends DocumentBase {
  type: 'page';
}

export interface Post extends DocumentBase {
  type: 'post',
  date: string;
  future: boolean;
  draft: boolean;
  tags: Tag[];
  readingTime: {
    minutes: number;
    time: number;
    words: number;
  }
}

export type Document = Page | Post;
export * from './provider.js';
