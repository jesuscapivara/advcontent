import { ObjectId } from "mongodb";

import { AbstractMongoRepository, CollectionType } from "@org/common/mongo";
import { Result } from "@org/common/result";

import { AccountVerification } from "../../../domain/account-verification/account-verification";
import { AccountVerificationRepository } from "../../../domain/account-verification/account-verification-repository";
import {
  AccountVerificationConflictError,
  AccountVerificationNotFoundError,
} from "../../../domain/account-verification/errors";
import { HashToken } from "../../../domain/account-verification/hash-token";

import { AccountVerificationMapper } from "./mapper";
import { AccountVerificationSchema } from "./schema";

class MongoAccountVerificationRepository
  extends AbstractMongoRepository<AccountVerificationSchema>
  implements AccountVerificationRepository
{
  collectionName = CollectionType.AccountsVerification;

  async getByHashToken(
    hashToken: HashToken,
  ): Promise<Result<AccountVerification, AccountVerificationNotFoundError>> {
    const schema = await this.collection.findOne({
      tenantId: this.tenantId,
      hashToken: hashToken.value,
    });

    if (!schema) return Result.fail(new AccountVerificationNotFoundError());

    return Result.ok(AccountVerificationMapper.toDomain(schema));
  }

  async add(accountVerification: AccountVerification): Promise<void> {
    await this.collection.insertOne(
      AccountVerificationMapper.toSchema(accountVerification),
      {
        session: this.session,
      },
    );
  }

  async save(accountVerification: AccountVerification): Promise<void> {
    const schema = AccountVerificationMapper.toSchema(accountVerification);

    const result = await this.collection.updateOne(
      { tenantId: schema.tenantId, _id: schema._id, version: schema.version },
      { $set: { ...schema, version: schema.version + 1 } },
      { session: this.session },
    );

    if (!result.modifiedCount) {
      throw new AccountVerificationConflictError();
    }
  }

  async hasExisting(userId: string): Promise<boolean> {
    const count = await this.collection.countDocuments(
      {
        tenantId: this.tenantId,
        userId: new ObjectId(userId),
      },
      { limit: 1 },
    );

    return !!count;
  }
}

export { MongoAccountVerificationRepository };
