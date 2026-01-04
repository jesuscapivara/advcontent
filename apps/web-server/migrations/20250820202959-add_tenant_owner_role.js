module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    const permissions = await db.collection("permissions").find({}).toArray();

    const role = {
      tenantId: "system",
      name: "Administrador do Tenant",
      description:
        "Usuário principal do Tenant. Tem todas as permissões de administração.",
      type: "tenant_owner",
      permissions: permissions.map((p) => ({
        permissionId: p._id,
        code: p.code,
        name: p.name,
        description: p.description,
      })),
    };

    await db.collection("roles").insertOne(role);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    await db.collection("roles").deleteOne({ type: "tenant_owner" });
  },
};
