// test-connection.js
// Quick PostgreSQL Connection Test

const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

async function testConnection() {
  console.log("🔍 Testing PostgreSQL Connection...\n");

  if (
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("[YOUR_PASSWORD]")
  ) {
    console.log(
      "❌ ERROR: Please update DATABASE_URL in .env file with your actual password!"
    );
    console.log(
      "\nOpen .env and replace [YOUR_PASSWORD] with your actual Supabase password.\n"
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
    console.log(
      "Connecting to:",
      process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")
    );

    const client = await pool.connect();
    console.log("✅ Connection successful!\n");

    // Test query
    const result = await client.query(
      "SELECT NOW() as current_time, version() as pg_version"
    );
    console.log("📅 Server Time:", result.rows[0].current_time);
    console.log(
      "🗄️  PostgreSQL Version:",
      result.rows[0].pg_version.split(",")[0]
    );

    // Check if tables exist
    const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'groups', 'groupmembers', 'expenses', 'expensesplits', 'passwordresettokens')
            ORDER BY table_name
        `);

    console.log("\n📊 Database Tables:");
    if (tablesResult.rows.length === 0) {
      console.log(
        "⚠️  No tables found. Please run schema.sql to create tables."
      );
      console.log(
        "   Open Supabase SQL Editor and paste the contents of schema.sql"
      );
    } else {
      tablesResult.rows.forEach((row) => {
        console.log(`   ✓ ${row.table_name}`);
      });

      if (tablesResult.rows.length === 6) {
        console.log(
          "\n🎉 All tables are present! You can now start the server."
        );
      } else {
        console.log(
          `\n⚠️  Found ${tablesResult.rows.length}/6 tables. Please run schema.sql to create missing tables.`
        );
      }
    }

    client.release();
    await pool.end();

    console.log("\n✅ Connection test complete!");
  } catch (error) {
    console.log("❌ Connection failed:", error.message);
    console.log("\nPlease check:");
    console.log("1. Your DATABASE_URL in .env has the correct password");
    console.log("2. Your Supabase database is running");
    console.log("3. Your internet connection is working\n");
    process.exit(1);
  }
}

testConnection();
