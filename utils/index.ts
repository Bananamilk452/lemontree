import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { Memory } from "~/prisma/generated/client";
import {
  diaryFullTextSearchByAccuracy,
  diaryFullTextSearchByDate,
  diarySemanticSearchByAccuracy,
  diarySemanticSearchByDate,
} from "~/prisma/generated/client/sql";

import type { ClassValue } from "clsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentVariant<T extends (...args: any) => any> =
  Parameters<T>[0]["variant"];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_REDIRECT = "/home";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

export const utcDateNow = new Date(
  Date.UTC(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  ),
);

export function removeTimeFromDate(date: Date) {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}

export function parseMemoryDate(content: string) {
  const regex = /(\d{4}-\d{2}-\d{2})|(\d{4}년 \d{1,2}월 \d{1,2}일)/g;
  const splited = content.split(regex);

  const segments = splited.map((seg) => {
    const match = regex.exec(seg);

    if (match) {
      return {
        type: "date",
        content: match[0],
      };
    } else {
      return {
        type: "text",
        content: seg,
      };
    }
  });

  return segments;
}

export const reformDiary = (
  diary:
    | diaryFullTextSearchByAccuracy.Result[]
    | diaryFullTextSearchByDate.Result[]
    | diarySemanticSearchByAccuracy.Result[]
    | diarySemanticSearchByDate.Result[],
) =>
  diary.map((d) => ({
    ...d,
    total: Number(d.total),
    memories: d.memories as unknown as Memory[],
    _count: {
      embeddings: Number(d.embeddingCount),
    },
  }));
