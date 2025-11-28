// setup-database.js
// Automatically set up the database schema

const { Pool } = require("pg");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

async function setupDatabase() {
  console.log("🔧 Setting up database schema...\n");

  if (
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("[YOUR_PASSWORD]")
  ) {
    console.log(
      "❌ ERROR: Please update DATABASE_URL in .env file with your actual password!"
    );
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Read schema file
    const schema = fs.readFileSync("schema.sql", "utf8");

    console.log("📝 Executing schema.sql...");

    const client = await pool.connect();

    // Execute schema
    await client.query(schema);

    console.log("✅ Schema executed successfully!\n");

    // Verify tables
    const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'groups', 'groupmembers', 'expenses', 'expensesplits', 'passwordresettokens')
            ORDER BY table_name
        `);

    console.log("📊 Created Tables:");
    tablesResult.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });

    if (tablesResult.rows.length === 6) {
      console.log("\n🎉 All tables created successfully!");
      console.log(
        "\n✅ Database is ready! You can now start the server with: npm start"
      );
    } else {
      console.log(
        `\n⚠️  Only ${tablesResult.rows.length}/6 tables created. Some tables may already exist.`
      );
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.log("❌ Error setting up database:", error.message);
    console.log("\nFull error:", error);
    process.exit(1);
  }
}

setupDatabase();
