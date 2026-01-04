/* eslint-disable @typescript-eslint/no-explicit-any */

type LogInput = {
  message: string;
  payload?: any;
  module?: string;
  tenantId?: string;
};

interface Logger {
  /**
   * To be used just on local development.
   * Logs will not go to production
   */
  debug(...message: any[]): void;

  /**
   * Logs will go to production
   */
  info(input: LogInput): void;

  /**
   * Logs will go to production
   */
  error(input: LogInput): void;
}

export type { Logger, LogInput };
