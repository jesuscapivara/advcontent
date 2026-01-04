import { env, Env } from "../../env";
import { Logger } from "../../logger/logger";

import { JsonLogger } from "./json-logger";

class LoggerFactory {
  static createDefault(_env: Env = env): Logger {
    return new JsonLogger(_env);
  }
}

export { LoggerFactory };
