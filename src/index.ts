export interface Tag {
  title: string;
  slug: string;
}

export type FileType = 'md' | 'mdx';

export interface PostCover {
  image: string;
  credit?: {
    author?: string;
    url?: string;
  }
}

export interface AttributeDraft {
  draft: boolean;
}

export interface Post {
  file: {
    name: string;
    type: FileType;
  };
  id: string;
  title: string;
  slug: string;
  summary: string;
  canonical?: string;
  rawContent: string;
  publishDate: string;
  updateDate: string;
  cover?: string | PostCover;
  tags: Tag[];
  readingTime: {
    minutes: number;
    words: number;
  };
}

export * from './provider.js';
