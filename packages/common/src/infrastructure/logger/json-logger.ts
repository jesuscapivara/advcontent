/* eslint-disable @typescript-eslint/no-explicit-any */
import { Env } from "../../env/env";
import { Log, LogType } from "../../logger/log";
import { Logger, LogInput } from "../../logger/logger";

class JsonLogger implements Logger {
  constructor(private env: Env) {}

  debug(...message: any[]): void {
    if (this.env.environment === "development") console.log(message);
  }

  info(input: LogInput): void {
    const logger = new Log({ type: LogType.Info, ...input });
    process.stdout.write("\n\n" + JSON.stringify(logger) + "\n\n");
  }

  error(input: LogInput): void {
    const logger = new Log({
      type: LogType.Error,
      ...input,
      payload: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        name: input?.payload?.name,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        message: input?.payload?.message,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        stack: input?.payload?.stack,
        ...input?.payload,
      },
    });
    process.stdout.write(JSON.stringify(logger) + "\n");
  }
}

export { JsonLogger };
