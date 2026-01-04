import { ClientSession } from "mongodb";

import { Transaction } from "@org/common/use-case";

import { MongoConnection } from "./mongo-connection";

class MongoTransaction implements Transaction {
  session?: ClientSession;

  start(): void {
    if (this.session) throw new Error("Transaction Session already opened");

    this.session = MongoConnection.getInstance().getClient().startSession();
    this.session.startTransaction();
  }

  async commit(): Promise<void> {
    await this.session?.commitTransaction();
  }

  async abort(): Promise<void> {
    await this.session?.abortTransaction();
  }

  async end(): Promise<void> {
    await this.session?.endSession();
  }
}

export { MongoTransaction };
