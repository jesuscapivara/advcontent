interface Transaction {
  start(): void;
  commit(): Promise<void>;
  abort(): Promise<void>;
  end(): Promise<void>;
}

export type { Transaction };
