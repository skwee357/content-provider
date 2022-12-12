export interface Tag {
  title: string;
  slug: string;
  url: string;
}

export type FileType = 'md' | 'mdx';

export interface PostCover {
  image: string;
  credit?: {
    author?: string;
    url?: string;
  }
}

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
  draft: boolean;
  cover?: string | PostCover;
  tags: Tag[];
  readingTime: {
    minutes: number;
    time: number;
    words: number;
  };
}

export * from './provider.js';
