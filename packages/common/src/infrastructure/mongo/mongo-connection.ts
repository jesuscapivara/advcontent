import { MongoClient, Db } from "mongodb";

import { CollectionType } from "./collection-type";

class MongoConnection {
  static Collections = CollectionType;
  private static instance: MongoConnection;
  private client!: MongoClient;
  private isConnected = false;

  private constructor() {}

  static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  async connect(uri: string): Promise<void> {
    if (this.isConnected) return;

    this.client = new MongoClient(uri);

    await this.client.connect();
    this.isConnected = true;
  }

  getClient() {
    return this.client;
  }

  getDb(name: string): Db {
    return this.client.db(name);
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
    }
  }
}

export { MongoConnection };
