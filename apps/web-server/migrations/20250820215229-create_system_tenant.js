const tenant = {
  _id: "system",
  name: "System",
  ownerId: "system_owner",
  slug: "system",
  status: "active",
  subscription: {
    status: "ready",
  },
};

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    const collection = db.collection("tenants");

    await collection.insertOne(tenant);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    const collection = db.collection("tenants");

    await collection.deleteOne({ slug: "system" });
  },
};
