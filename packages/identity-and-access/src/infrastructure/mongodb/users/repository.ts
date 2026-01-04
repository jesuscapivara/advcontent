import { ObjectId } from "mongodb";

import {
  AbstractMongoRepository,
  CollectionType,
  WithLookup,
} from "@org/common/mongo";
import { Result } from "@org/common/result";

import {
  UserConflictError,
  UserNotFoundError,
} from "../../../domain/user/errors";
import { User } from "../../../domain/user/user";
import { UserRepository } from "../../../domain/user/user-repository";
import { RoleSchema } from "../roles/schema";

import { UserMapper } from "./mapper";
import { UserSchema } from "./schema";

class MongoUserRepository
  extends AbstractMongoRepository<UserSchema>
  implements UserRepository
{
  collectionName = CollectionType.Users;

  async add(user: User): Promise<void> {
    await this.collection.insertOne(UserMapper.toSchema(user), {
      session: this.session,
    });
  }

  async save(user: User): Promise<void> {
    const schema = UserMapper.toSchema(user);

    const result = await this.collection.updateOne(
      {
        tenantId: schema.tenantId,
        _id: schema._id,
        version: schema.version,
      },
      {
        $set: {
          ...schema,
          version: schema.version + 1,
        },
      },
      {
        session: this.session,
        ignoreUndefined: true,
      },
    );

    if (!result.matchedCount) {
      throw new UserConflictError();
    }
  }

  async getById(id: string): Promise<Result<User, UserNotFoundError>> {
    const schema = await this.collection
      .aggregate<WithLookup<UserSchema, { role: RoleSchema }>>([
        {
          $match: {
            _id: ObjectId.createFromHexString(id),
          },
        },
        {
          $lookup: {
            from: CollectionType.Roles,
            localField: "roleId",
            foreignField: "_id",
            as: "role",
          },
        },
        {
          $unwind: "$role",
        },
      ])
      .next();

    if (!schema) return Result.fail(new UserNotFoundError(id));

    return Result.ok(UserMapper.toDomain(schema));
  }
}

export { MongoUserRepository };
