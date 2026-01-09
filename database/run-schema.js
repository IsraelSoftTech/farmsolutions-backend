const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

// Create a pool with farmsolutionss_user
const userPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  connectionTimeoutMillis: 5000,
});

async function runSchema() {
  console.log("📄 Reading schema.sql...");

  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSQL = fs.readFileSync(schemaPath, "utf8");

  console.log("🚀 Creating tables...");

  try {
    const client = await userPool.connect();

    // Set schema for this client
    await client.query("SET search_path TO farmsolutionss_schema");

    // Execute the entire schema
    await client.query(schemaSQL);

    client.release();

    console.log("✅✅✅ All tables created successfully! ✅✅✅");

    // List created tables
    const tablesClient = await userPool.connect();
    await tablesClient.query("SET search_path TO farmsolutionss_schema");
    const tablesResult = await tablesClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'farmsolutionss_schema' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    tablesClient.release();

    console.log(`\n📊 Created ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach((row) => {
      console.log(`   ✅ ${row.table_name}`);
    });

    return true;
  } catch (error) {
    if (error.code === "ETIMEDOUT" || error.message.includes("timeout")) {
      console.error("\n❌ CONNECTION TIMEOUT");
      console.error(
        "\n📋 This is normal! The database is not accessible from your local machine."
      );
      console.error("\n✅ SOLUTION: Use pgAdmin instead");
      console.error(
        '\n1. Connect to your database as "postgres" user in pgAdmin'
      );
      console.error(
        "2. Run: ALTER SCHEMA public OWNER TO farmsolutionss_user;"
      );
      console.error(
        "3. Then connect as farmsolutionss_user and run schema.sql"
      );
    } else if (error.message.includes("permission denied")) {
      console.error("\n❌ PERMISSION DENIED");
      console.error("\n📋 SOLUTION: Set permissions first");
      console.error("\nRun this as postgres user:");
      console.error("ALTER SCHEMA public OWNER TO farmsolutionss_user;");
    } else {
      console.error("❌ Error:", error.message);
    }
    return false;
  }
}

async function main() {
  console.log("🚀 Starting database setup...\n");

  const success = await runSchema();

  if (success) {
    console.log("\n🎉 Database setup complete!");
    process.exit(0);
  } else {
    console.log("\n❌ Setup failed. Please check the errors above.");
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await userPool.end();
  process.exit(0);
});

main().catch(async (error) => {
  console.error("Fatal error:", error.message);
  await userPool.end();
  process.exit(1);
});
