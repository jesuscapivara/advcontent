import { AbstractMongoRepository, CollectionType } from "@org/common/mongo";

import { Role } from "../../../domain/role/role";
import { RoleRepository } from "../../../domain/role/role-repository";
import { RoleType } from "../../../domain/role/role-type";

import { RoleMapper } from "./mapper";
import { RoleSchema } from "./schema";

class MongoRoleRepository
  extends AbstractMongoRepository<RoleSchema>
  implements RoleRepository
{
  collectionName = CollectionType.Roles;

  async getSystemRole(role: RoleType): Promise<Role> {
    const schema = await this.collection.findOne({
      tenantId: "system",
      type: role,
    });

    if (!schema)
      throw new Error(`The following Role was not found. Role = ${role}`);

    return RoleMapper.toDomain(schema);
  }
}

export { MongoRoleRepository };
