import { ObjectId } from "mongodb";

import { TenantIdSchemaFactory } from "@org/common/mongo";

import { AccountVerification } from "../../../domain/account-verification/account-verification";
import { HashToken } from "../../../domain/account-verification/hash-token";

import { AccountVerificationSchema } from "./schema";

class AccountVerificationMapper {
  static toSchema(
    accountVerification: AccountVerification,
  ): AccountVerificationSchema {
    return {
      _id: ObjectId.createFromHexString(accountVerification.id),
      tenantId: TenantIdSchemaFactory.create(accountVerification.tenantId),
      userId: ObjectId.createFromHexString(accountVerification.userId),

      status: accountVerification.status,
      hashToken: accountVerification.hashToken.value,
      expiresAt: accountVerification.expiresAt,

      version: accountVerification.version,
      createdAt: accountVerification.createdAt,
      updatedAt: accountVerification.updatedAt,
    };
  }

  static toDomain(schema: AccountVerificationSchema): AccountVerification {
    return new AccountVerification({
      id: schema._id.toHexString(),
      tenantId: schema.tenantId.toString(),
      userId: schema.userId.toHexString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: schema.status as any,
      hashToken: new HashToken(schema.hashToken),
      expiresAt: schema.expiresAt,
      version: schema.version,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }
}

export { AccountVerificationMapper };
