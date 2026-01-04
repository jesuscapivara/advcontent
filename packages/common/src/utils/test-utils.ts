class TestUtils {
  static mockClass<T>(aClass: Partial<T>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { ...aClass } as any as T;
  }
}

export { TestUtils };
