module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    await db.createCollection("accounts_verification");
    await db
      .collection("accounts_verification")
      .createIndex({ tenantId: 1, hashToken: 1 });
    await db
      .collection("accounts_verification")
      .createIndex({ tenantId: 1, userId: 1 });
    await db
      .collection("accounts_verification")
      .createIndex({ tenantId: 1, _id: 1, version: 1 });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    await db.dropCollection("accounts_verification");
  },
};
