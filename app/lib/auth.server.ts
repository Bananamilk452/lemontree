import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./utils/db.server";
import { safeRedirect } from "./utils";
import { redirect } from "react-router";
import { sendEmail } from "./utils/sendEmail";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "비밀번호 재설정",
        text: `링크를 클릭하여 비밀번호를 재설정하세요: ${url}`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "이메일 주소를 인증하세요",
        text: `링크를 클릭하여 이메일 주소를 인증하세요: ${url}`,
      });
    },
  },
});

export async function redirectIfAuthenticated(
  request: Request,
  defaultRedirect: string = "/",
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    const redirectTo = new URL(request.url).searchParams.get("redirectTo");
    return redirectTo
      ? redirect(safeRedirect(redirectTo))
      : redirect(defaultRedirect);
  }

  return null; // 인증되지 않은 경우 null 반환
}
