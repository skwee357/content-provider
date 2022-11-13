import matter from "gray-matter";
import path from "path";
import os from "os";
import { globby } from "globby";
import { promises as fs } from 'fs';
import slugify from "slugify";
import RemoveMarkdown from 'remove-markdown';
import readingTime from "reading-time";
import { Document, FileType, Page, Post } from "./index.js";
import { getConfig } from "./config.js";

const CONTENT_FILES_GLOB = '**/*.(md|mdx)';
const EXCERPT_SEPARATOR = '<!--more-->';
const SUPPORTED_DIRS = ['', 'post'];

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

async function createDocuments(files: File[], defaultLocale: string): Promise<Document[]> {
  return Promise.all(files.map(async (file) => {
    const source = await fs.readFile(file.path, 'utf-8');
    const { data: { title: maybeTitle, slug: maybeSlug, locale: maybeLocale, canonical, summary: maybeSummary, ...frontmatter }, excerpt, content } = matter(source, { excerpt_separator: EXCERPT_SEPARATOR });
    const title = (maybeTitle as string | undefined) || file.name;
    const slug = (maybeSlug as string | undefined) || slugify(file.name, { lower: true });
    const summary = RemoveMarkdown(excerpt || maybeSummary || "");
    const locale = (maybeLocale as string | undefined) || defaultLocale;
    const rawContent = content.replace(EXCERPT_SEPARATOR, '');

    let document: Post | Page;

    if (file.dir === '') {
      document = {
        type: 'page',
        file: {
          name: file.name,
          type: file.ext as FileType,
        },
        title,
        slug,
        locale,
        summary,
        rawContent,
        url: `/${slug}`,
        translations: []
      }
    } else if (file.dir === 'post') {
      const { date, draft, tags } = frontmatter;

      if (!date || !(date instanceof Date)) {
        throw new Error(`post ${slug} is missing date attribute`);
      }

      const { time, words, minutes } = readingTime(content);

      document = {
        type: 'post',
        file: {
          name: file.name,
          type: file.ext as FileType,
        },
        title,
        slug,
        locale,
        summary,
        rawContent,
        translations: [],
        url: `/post/${slug}`,
        date: (date as Date).toISOString(),
        future: (date as Date).getTime() > Date.now(),
        draft: (draft as boolean | undefined) || false,
        readingTime: { time, words, minutes: Math.ceil(minutes) },
        tags: ((tags || []) as string[]).map(tag => {
          const title = tag.trim().replaceAll(/[-_]/g, ' ');
          const slug = slugify(title, { lower: true });
          return {
            title,
            slug,
            url: `/tag/${slug}`
          };
        })
      }
    } else {
      throw new Error(`unsupported dir ${file.dir}`);
    }

    if (canonical) {
      document.canonical = canonical;
    }

    return document;
  }))
}

export async function generateContent() {
  const config = await getConfig();
  const files = await getFiles(config.sourceDir);
  const documents = (await createDocuments(files, config.defaultLocale))
    .filter(({ locale }) => config.locales.includes(locale));

  documents.forEach((document, index) => {
    document.translations = documents.filter((d, i) => d.type === document.type && d.slug === document.slug && i !== index).map(({ locale, title, url }) => ({ locale, title, url }))
  })

  await fs.writeFile(path.join(process.cwd(), config.outFile), JSON.stringify(documents), { encoding: 'utf-8', flag: 'w' });
}
