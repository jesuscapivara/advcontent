import { ObjectId } from "mongodb";

import { TestingDatabase } from "../../src/mongodb/_specs/mongo-test-utils";
import migration from "../20250820200902-add_role_permissions";

const database = new TestingDatabase();

describe("20250820200902-add_role_permissions", () => {
  beforeAll(async () => {
    await database.start();
  });

  afterEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.close();
  });

  it("up", async () => {
    await migration.up(database.db);

    const permissions = await database.db
      .collection("permissions")
      .find({})
      .toArray();

    expect(permissions).toEqual([
      {
        _id: expect.any(ObjectId),
        tenantId: "system",
        code: "create_role",
        name: "Criar Role",
        description: "Permite criar Roles personalizados",
      },
      {
        _id: expect.any(ObjectId),
        tenantId: "system",
        code: "delete_role",
        name: "Deletar Role",
        description: "Permite deletar Roles personalizados",
      },
      {
        _id: expect.any(ObjectId),
        tenantId: "system",
        code: "update_role",
        name: "Modificar Role",
        description: "Permite modificar Roles personalizados",
      },
      {
        _id: expect.any(ObjectId),
        tenantId: "system",
        code: "view_role",
        name: "Visualizar Role",
        description: "Permite visualizar o gerenciador de Roles",
      },
    ]);
  });

  it("down", async () => {
    await migration.up(database.db);
    await migration.down(database.db);

    const permissions = await database.db
      .collection("permissions")
      .find({})
      .toArray();

    expect(permissions).toHaveLength(0);
  });
});
