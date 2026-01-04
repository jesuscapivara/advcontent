const tenantId = "system";
const permissions = [
  {
    tenantId,
    code: "create_role",
    name: "Criar Role",
    description: "Permite criar Roles personalizados",
  },
  {
    tenantId,
    code: "delete_role",
    name: "Deletar Role",
    description: "Permite deletar Roles personalizados",
  },
  {
    tenantId,
    code: "update_role",
    name: "Modificar Role",
    description: "Permite modificar Roles personalizados",
  },
  {
    tenantId,
    code: "view_role",
    name: "Visualizar Role",
    description: "Permite visualizar o gerenciador de Roles",
  },
];

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    const collection = db.collection("permissions");

    await collection.insertMany(permissions);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    const collection = db.collection("permissions");

    await collection.deleteMany({
      $or: permissions.map(({ code, tenantId }) => ({ code, tenantId })),
    });
  },
};
