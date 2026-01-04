/**
 * Represents the result of an operation, containing either data or an error.
 */
class Result<Data = undefined, ErrorType = undefined> {
  private data?: Data;
  private error?: ErrorType;

  private constructor(data?: Data, error?: ErrorType) {
    this.data = data;
    this.error = error;
  }

  /** Creates a successful result. */
  static ok<Data, ErrorType = undefined>(data: Data): Result<Data, ErrorType> {
    return new Result<Data, ErrorType>(data, undefined);
  }

  /** Creates a failed result. */
  static fail<Data = undefined, ErrorType = undefined>(
    error: ErrorType,
  ): Result<Data, ErrorType> {
    return new Result<Data, ErrorType>(undefined, error);
  }

  /** Returns true if the result is successful. */
  isOk(): this is Result<Data, undefined> {
    return this.error === undefined;
  }

  /** Returns true if the result is an error. */
  isError(): this is Result<undefined, ErrorType> {
    return this.error !== undefined;
  }

  /** Throws the error if present. */
  throwIfError() {
    if (this.error) throw this.error as unknown;
  }

  /** Gets the data if present, otherwise undefined. */
  getData(): Data | undefined {
    return this.data;
  }

  /** Gets the data if present or throw the Error. */
  getDataOrThrow(): Data {
    this.throwIfError();

    return this.data!;
  }

  /** Gets the error if present, otherwise undefined. */
  getError(): ErrorType | undefined {
    return this.error;
  }
}

export { Result };
