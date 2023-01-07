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
  title: string;
  slug: string;
  summary: string;
  canonical?: string;
  rawContent: string;
  publishedDate: string;
  updatedDate: string;
  cover?: string | PostCover;
  tags: Tag[];
  readingTime: {
    minutes: number;
    words: number;
  };
}

export * from './provider.js';
