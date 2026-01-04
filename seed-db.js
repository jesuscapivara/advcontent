// seed-db.js
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config({ path: "apps/web-server/.env" }); // Lê sua senha do .env

async function run() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "❌ Erro: MONGODB_URI não encontrado no apps/web-server/.env"
    );
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log("🌱 Conectando ao Atlas para semear o banco...");
    await client.connect();

    // O nome do banco deve bater com o da URL (provavelmente 'marketing_juridico' ou 'rossetti01')
    // O driver pega automático da URL, mas garantimos aqui pegando o database padrão
    const dbName = process.env.DATABASE_NAME || "org";
    const db = client.db(dbName);

    console.log(`🔌 Conectado ao banco: ${db.databaseName}`);

    // 1. Criar o Tenant (Escritório) seguindo o schema correto
    const ownerId = new ObjectId();
    const tenant = {
      _id: "testing", // String conforme o schema permite
      name: "Maná Advocacia & Engenharia",
      slug: "testing", // <--- O NOME QUE O ERRO RECLAMOU
      status: "active",
      owner: {
        ownerId: ownerId,
        email: "lucas@rossetti.eng.br",
      },
      subscription: {
        status: "pending_setup",
        subscriptionId: undefined,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
      contactInformation: undefined,
    };

    // Deletar se já existir para não duplicar
    await db.collection("tenants").deleteMany({ slug: "testing" });
    await db.collection("tenants").insertOne(tenant);

    console.log("✅ Tenant 'testing' criado com sucesso!");

    // 2. Buscar o role TenantOwner do sistema (necessário para criar o usuário)
    const role = await db
      .collection("roles")
      .findOne({ tenantId: "system", type: "tenant_owner" });

    if (!role) {
      console.warn(
        "⚠️  Role TenantOwner não encontrado. Execute as migrations primeiro: yarn migrate:up"
      );
    } else {
      // 3. Criar um Usuário Admin (Opcional, mas útil pro futuro)
      const user = {
        _id: ownerId, // Mesmo ID do owner do tenant
        tenantId: "testing",
        email: "lucas@rossetti.eng.br",
        name: "Lucas Rossetti",
        roleId: role._id,
        status: "active",
        hashPassword: "$2b$10$placeholder_hash_here", // Em produção usamos bcrypt real
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 0,
      };

      await db.collection("users").deleteMany({
        email: "lucas@rossetti.eng.br",
      });
      await db.collection("users").insertOne(user);

      console.log("✅ Usuário Admin criado.");
    }
  } catch (err) {
    console.error("❌ Erro no Seed:", err);
    throw err;
  } finally {
    await client.close();
    console.log("👋 Conexão fechada.");
  }
}

run()
  .then(() => {
    console.log("🎉 Seed concluído com sucesso!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("💥 Erro fatal:", err);
    process.exit(1);
  });
