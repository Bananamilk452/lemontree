import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "~/utils/db";
import { sendEmail } from "~/utils/sendEmail";

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
