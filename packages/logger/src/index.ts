import pino from "pino";

interface LoggerOptions {
  name?: string;
  level?: string;
  prettyPrint?: boolean;
}

function createLogger(options: LoggerOptions = {}) {
  const {
    name = "tokistack",
    level = process.env.LOG_LEVEL || "info",
    prettyPrint = process.env.DEV_OR_INTEGRATION_USE,
  } = options;

  const transport = prettyPrint
    ? {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    }
    : undefined;

  return pino({
    name,
    level,
    ...transport,
    formatters: {
      level: (label) => ({ level: label }),
    },
  });
}

export const logger = createLogger();
