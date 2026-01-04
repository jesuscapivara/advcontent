import { ObjectId } from "mongodb";

type MongoSchema<Id = ObjectId> = {
  _id: Id;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type { MongoSchema };
