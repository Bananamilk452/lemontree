import { authClient } from "~/lib/auth-client";

export type UserWithRole = NonNullable<
  Awaited<
    ReturnType<
      typeof authClient.admin.listUsers<{ query: Record<string, string> }>
    >
  >["data"]
>["users"][number];
