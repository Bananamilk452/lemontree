import { type Session, type User } from "better-auth";
import { clsx, type ClassValue } from "clsx";
import { useRouteLoaderData } from "react-router";
import { twMerge } from "tailwind-merge";

import { authClient } from "~/lib/auth";

export type ComponentVariant<T extends (...args: any) => any> =
  Parameters<T>[0]["variant"];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_REDIRECT = "/";

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

export function useUserData() {
  const loaderData = useRouteLoaderData("root") as {
    session: Session;
    user: User;
  };

  const { data } = authClient.useSession();

  const result = data ?? loaderData;
  return result;
}

export function parseFormData<FormSchema>(formData: FormData) {
  const parsedData: Partial<Record<keyof FormSchema, string | File>> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      parsedData[key as keyof FormSchema] = value as never;
    } else if (typeof value === "string") {
      parsedData[key as keyof FormSchema] = value as never;
    }
  }

  return parsedData as Record<keyof FormSchema, string | File>;
}
