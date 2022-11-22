import matter from "gray-matter";
import path from "path";
import os from "os";
import { globby } from "globby";
import { promises as fs } from 'fs';
import slugify from "slugify";
import RemoveMarkdown from 'remove-markdown';
import readingTime from "reading-time";
import { FileType, Post } from "./index.js";
import { getConfig } from "./config.js";

const CONTENT_FILES_GLOB = 'post/*.(md|mdx)';
const EXCERPT_SEPARATOR = '<!--more-->';
const SUPPORTED_DIRS = ['post'];

interface File {
  path: string;
  name: string;
  dir: string;
  ext: string;
}

function resolveHome(filepath: string): string {
  if (filepath[0] === '~' && filepath[1] === '/') {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

async function getFiles(contentDir: string): Promise<File[]> {
  const pathToContent = path.join(resolveHome(contentDir));
  const files = (await globby(CONTENT_FILES_GLOB, { cwd: pathToContent }))
    .map(file => {
      const { name, ext, dir } = path.parse(file);

      if (!SUPPORTED_DIRS.includes(dir)) {
        throw new Error(`unsupported dir ${dir} - ${name}`);
      }

      return {
        path: path.join(pathToContent, file),
        name,
        dir,
        ext,
      }
    });

  return files;
}

async function createPost(files: File[]): Promise<Post[]> {
  return Promise.all(files.map(async (file) => {
    const source = await fs.readFile(file.path, 'utf-8');
    const { data: { title: maybeTitle, slug: maybeSlug, canonical, summary: maybeSummary, date, draft, tags, cover }, excerpt, content } = matter(source, { excerpt_separator: EXCERPT_SEPARATOR });
    const title = (maybeTitle as string | undefined) || file.name;
    const slug = (maybeSlug as string | undefined) || slugify(file.name, { lower: true });
    const summary = RemoveMarkdown(excerpt || maybeSummary || "");
    const rawContent = content.replace(EXCERPT_SEPARATOR, '');

    if (!date || !(date instanceof Date)) {
      throw new Error(`post ${slug} is missing date attribute`);
    }

    const { time, words, minutes } = readingTime(content);

    const post: Post = {
      file: {
        name: file.name,
        type: file.ext.slice(1) as FileType
      },
      title,
      slug,
      summary,
      rawContent,
      url: `/post/${slug}`,
      date: (date as Date).toISOString(),
      future: (date as Date).getTime() > Date.now(),
      draft: (draft as boolean | undefined) || false,
      readingTime: { time, words, minutes: Math.ceil(minutes) },
      tags: ((tags || []) as (string | null)[])
        .filter((tag): tag is Exclude<typeof tag, null> => !!tag)
        .map(tag => tag?.trim())
        .filter(tag => tag?.length || 0 > 0)
        .map(tag => {
          const title = tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          const slug = slugify(title, { lower: true });
          return {
            title,
            slug,
            url: `/tag/${slug}`
          };
        })
    }

    if (cover) {
      post.cover = cover;
    }

    if (canonical) {
      post.canonical = canonical;
    }

    return post;
  }))
}

export async function generateContent() {
  const config = await getConfig();
  const files = await getFiles(config.sourceDir);
  const documents = (await createPost(files))
    .filter(doc => {
      if (doc.draft) {
        console.warn(`-> Found draft post: ${doc.file.name} - skipping`);
      }

      return !doc.draft;
    })

  await fs.writeFile(path.join(process.cwd(), config.outFile), JSON.stringify(documents), { encoding: 'utf-8', flag: 'w' });
}
