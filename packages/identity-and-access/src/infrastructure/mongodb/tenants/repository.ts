import { ObjectId } from "mongodb";

import { AbstractMongoRepository, CollectionType } from "@org/common/mongo";
import { Result } from "@org/common/result";

import {
  TenantInUseError,
  TenantNotFoundError,
  TenantSlugInUseError,
} from "../../../domain/tenant/errors";
import { Slug } from "../../../domain/tenant/slug";
import { Tenant } from "../../../domain/tenant/tenant";
import { TenantRepository } from "../../../domain/tenant/tenant-repository";

import { TenantMapper } from "./mapper";
import { TenantSchema } from "./schema";

class MongoTenantRepository
  extends AbstractMongoRepository<TenantSchema>
  implements TenantRepository
{
  collectionName = CollectionType.Tenants;

  async getBySlug(slug: Slug): Promise<Result<Tenant, TenantNotFoundError>> {
    const schema = await this.collection.findOne({ slug: slug.value });

    if (!schema) {
      return Result.fail(new TenantNotFoundError(slug.value));
    }

    return Result.ok(TenantMapper.toDomain(schema));
  }

  async slugExists(slug: Slug): Promise<boolean> {
    const count = await this.collection.countDocuments(
      { slug: slug.value },
      { limit: 1 },
    );
    return count > 0;
  }

  async add(tenant: Tenant): Promise<void> {
    await this.collection.insertOne(TenantMapper.toSchema(tenant), {
      session: this.session,
    });
  }

  async getById(id: string): Promise<Result<Tenant, TenantNotFoundError>> {
    const schema = await this.collection.findOne({
      _id: ObjectId.createFromHexString(id),
    });

    if (!schema) {
      return Result.fail(new TenantNotFoundError(id));
    }

    return Result.ok(TenantMapper.toDomain(schema));
  }

  async save(tenant: Tenant): Promise<void> {
    const schema = TenantMapper.toSchema(tenant);

    const result = await this.collection.updateOne(
      { _id: schema._id, version: schema.version },
      { $set: { ...schema, version: schema.version + 1 } },
      { session: this.session },
    );

    if (!result.modifiedCount) {
      throw new Error("conflict error");
    }
  }

  async isUnique(
    tenant: Tenant,
  ): Promise<Result<boolean, TenantInUseError | TenantSlugInUseError>> {
    const existingOrNot = await this.collection.findOne(
      {
        $or: [
          { slug: tenant.slug.value },
          { "owner.email": tenant.owner.email },
        ],
      },
      { projection: { slug: 1, "owner.email": 1 } },
    );

    if (existingOrNot) {
      if (existingOrNot.slug === tenant.slug.value) {
        return Result.fail(new TenantSlugInUseError(tenant.slug));
      }

      if (existingOrNot.owner.email === tenant.owner.email) {
        return Result.fail(new TenantInUseError(tenant.owner.email));
      }
    }

    return Result.ok(true);
  }
}

export { MongoTenantRepository };
