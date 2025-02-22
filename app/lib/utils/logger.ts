import { createLogger, format, transports } from "winston";

import { singleton } from "~/lib/utils/singleton";

export const logger = singleton("logger", () =>
  createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    ),
    defaultMeta: { service: "rag-diary" },
    transports: [new transports.File({ filename: "rag-diary.log" })],
  }),
);

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}
