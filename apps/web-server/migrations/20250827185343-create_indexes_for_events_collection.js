module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    const eventsColl = db.collection("events");

    await eventsColl.createIndex({ status: 1, occurredAt: 1 });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    const eventsColl = db.collection("events");
    await eventsColl.dropIndex("status_1_occurredAt_1");
  },
};
