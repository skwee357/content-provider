export interface Tag {
  title: string;
  slug: string;
  url: string;
}

export type FileType = 'md' | 'mdx';

export interface Post {
  file: {
    name: string;
    type: FileType;
  };
  title: string;
  slug: string;
  summary: string;
  canonical?: string;
  rawContent: string;
  url: string;
  date: string;
  future: boolean;
  draft: boolean;
  cover?: string;
  tags: Tag[];
  readingTime: {
    minutes: number;
    time: number;
    words: number;
  };
}

export * from './provider.js';
