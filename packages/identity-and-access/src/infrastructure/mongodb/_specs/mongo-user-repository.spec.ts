import { ObjectId } from "mongodb";

import { Env } from "@org/common/env";
import { TestingDatabase } from "@org/common/mongo";

import { RoleType } from "../../../domain/role/role-type";
import {
  UserConflictError,
  UserNotFoundError,
} from "../../../domain/user/errors";
import { HashPassword } from "../../../domain/user/hash-password";
import { User } from "../../../domain/user/user";
import { UserRole } from "../../../domain/user/user-role";
import { UserStatus } from "../../../domain/user/user-status";
import { PermissionCode } from "../../../exports/permission";
import { RoleSchema } from "../roles/schema";
import { MongoUserRepository } from "../users/repository";

const database = new TestingDatabase();
const tenantId = new ObjectId();

const createSut = () => {
  const sut = new MongoUserRepository({
    tenantId,
    env: { database: { name: database.databaseName } } as Env,
  });
  return { sut };
};

describe("MongoUserRepository", () => {
  let role: UserRole;

  beforeAll(async () => {
    await database.start();

    role = new UserRole({
      type: RoleType.TenantOwner,
      roleId: database.createId("tenant_owner").toString(),
      permissions: [PermissionCode.CreateRole],
    });

    await database.applyFixtures({
      roles: [
        {
          _id: database.getId("tenant_owner"),
          name: "Tenant Owner",
          description: "Description",
          permissions: [
            {
              permissionId: database.createId(),
              code: PermissionCode.CreateRole,
              name: "Create role",
              description: "description",
            },
          ],
          tenantId,
          type: RoleType.TenantOwner,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 0,
        },
      ] as RoleSchema[],
    });
  });

  afterAll(async () => {
    await database.close();
  });

  it("add user", async () => {
    const { sut } = createSut();

    const user = new User({
      id: new ObjectId().toHexString(),
      tenantId: tenantId.toHexString(),
      role,
      name: "any_name",
      email: "email@email.com",
      status: UserStatus.Active,
    });

    await sut.add(user);

    const [userAdded] = await database.db
      .collection("users")
      .find({})
      .toArray();

    expect(userAdded).toEqual({
      _id: ObjectId.createFromHexString(user.id),
      tenantId,
      roleId: ObjectId.createFromHexString(role.roleId),
      email: user.email,
      hashPassword: null,
      name: user.name,
      status: user.status,
      version: user.version,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
    });
  });

  it("save user updates existing user", async () => {
    const { sut } = createSut();

    const user = new User({
      id: new ObjectId().toHexString(),
      tenantId: tenantId.toHexString(),
      role,
      name: "initial_name",
      email: "initial@email.com",
      status: UserStatus.Active,
      hashPassword: new HashPassword("Password123"),
    });

    await sut.add(user);
    user.name = "updated_name";
    user.hashPassword = undefined;
    await sut.save(user);

    const updated = await database.db
      .collection("users")
      .findOne({ _id: ObjectId.createFromHexString(user.id) });

    expect(updated?.name).toBe("updated_name");
    expect(updated?.version).toBe(1);
    expect(updated?.hashPassword).toBe("Password123");
  });

  it("save throws error if version mismatch", async () => {
    const { sut } = createSut();

    const user = new User({
      id: new ObjectId().toHexString(),
      tenantId: tenantId.toHexString(),
      role,
      name: "name",
      email: "email@email.com",
      status: UserStatus.Active,
    });

    await sut.add(user);

    await database.db
      .collection("users")
      .updateOne(
        { _id: ObjectId.createFromHexString(user.id) },
        { $set: { version: 99 } },
      );

    await expect(sut.save(user)).rejects.toThrow(UserConflictError);
  });

  it("getById returns user if exists", async () => {
    const { sut } = createSut();

    const user = new User({
      id: new ObjectId().toHexString(),
      tenantId: tenantId.toHexString(),
      role,
      name: "name",
      email: "email@email.com",
      status: UserStatus.Active,
    });

    await sut.add(user);
    const result = await sut.getById(user.id);

    expect(result.isError()).toBe(false);
    expect(result.getData()).toEqual(user);
  });

  it("getById returns fail if user does not exist", async () => {
    const { sut } = createSut();

    const nonExistentId = new ObjectId().toHexString();
    const result = await sut.getById(nonExistentId);
    expect(result.isError()).toBe(true);
    expect(result.getError()).toBeInstanceOf(UserNotFoundError);
  });
});
