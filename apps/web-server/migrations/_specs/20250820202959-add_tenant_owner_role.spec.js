import { ObjectId } from "mongodb";

import { TestingDatabase } from "../../src/mongodb/_specs/mongo-test-utils";
import migration from "../20250820202959-add_tenant_owner_role";

const database = new TestingDatabase();

describe("20250820202959-add_tenant_owner_role", () => {
  beforeAll(async () => {
    await database.start();

    await database.db.collection("permissions").insertMany([
      {
        tenantId: "system",
        code: "create_role",
        name: "Criar Role",
        description: "Permite criar Roles personalizados",
      },
      {
        tenantId: "system",
        code: "delete_role",
        name: "Deletar Role",
        description: "Permite deletar Roles personalizados",
      },
    ]);
  });

  afterEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.close();
  });

  it("up", async () => {
    await migration.up(database.db, database.client);

    const roles = await database.db.collection("roles").find({}).toArray();

    expect(roles).toEqual([
      {
        _id: expect.any(ObjectId),
        tenantId: "system",
        name: "Administrador do Tenant",
        description:
          "Usuário principal do Tenant. Tem todas as permissões de administração.",
        type: "tenant_owner",
        permissions: [
          {
            permissionId: expect.any(ObjectId),
            code: "create_role",
            name: "Criar Role",
            description: "Permite criar Roles personalizados",
          },
          {
            permissionId: expect.any(ObjectId),
            code: "delete_role",
            name: "Deletar Role",
            description: "Permite deletar Roles personalizados",
          },
        ],
      },
    ]);
  });

  it("down", async () => {
    await migration.up(database.db, database.client);
    await migration.down(database.db, database.client);

    const roles = await database.db.collection("roles").find({}).toArray();

    expect(roles).toHaveLength(0);
  });
});
