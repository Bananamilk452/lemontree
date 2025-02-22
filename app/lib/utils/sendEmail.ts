import Mailgun from "mailgun.js";

export function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  if (!process.env.MAILGUN_API_KEY) {
    throw new Error("MAILGUN_API_KEY is not set");
  }

  if (!process.env.MAILGUN_DOMAIN) {
    throw new Error("MAILGUN_DOMAIN is not set");
  }

  if (!process.env.MAILGUN_FROM) {
    throw new Error("MAILGUN_FROM is not set");
  }

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
  });

  return mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: process.env.MAILGUN_FROM,
    to: [to],
    subject,
    text,
  });
}
