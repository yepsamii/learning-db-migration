import "dotenv/config";
import { Client } from "pg";
import fs from "fs";
import path from "path";

async function getMigrationStatus() {
  const dbHost =
    process.env.DB_HOST === "db" ? "localhost" : process.env.DB_HOST;

  const client = new Client({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    host: dbHost,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "todo_db",
  });

  try {
    await client.connect();

    // Get applied migrations from database
    let appliedMigrations = [];
    try {
      const result = await client.query(`
        SELECT id, name, run_on 
        FROM pgmigrations 
        ORDER BY id ASC
      `);
      appliedMigrations = result.rows;
    } catch (error) {
      if (error.code !== "42P01") {
        // Table doesn't exist
        throw error;
      }
    }

    // Get all migration files
    const migrationsDir = path.join(process.cwd(), "migrations");
    let migrationFiles = [];

    if (fs.existsSync(migrationsDir)) {
      migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith(".js") || file.endsWith(".sql"))
        .sort();
    }

    console.log("\n" + "=".repeat(80));
    console.log("📊 MIGRATION STATUS SUMMARY");
    console.log("=".repeat(80) + "\n");

    if (migrationFiles.length === 0) {
      console.log("❌ No migration files found in ./migrations directory\n");
      return;
    }

    // Create a map of applied migrations
    const appliedMap = new Map(appliedMigrations.map((m) => [m.name, m]));

    console.log("Migration Files:\n");

    migrationFiles.forEach((file, index) => {
      const fileName = file.replace(/\.(js|sql)$/, "");
      const [timestamp, ...nameParts] = fileName.split("_");
      const migrationName = nameParts.join("_");

      const isApplied = appliedMap.has(fileName);
      const status = isApplied ? "✅ APPLIED" : "⏳ PENDING";
      const statusColor = isApplied ? "\x1b[32m" : "\x1b[33m";
      const resetColor = "\x1b[0m";

      console.log(`${statusColor}${status}${resetColor}`);
      console.log(`  Revision: ${timestamp}`);
      console.log(`  Name:     ${migrationName}`);
      console.log(`  File:     ${file}`);

      if (isApplied) {
        const appliedData = appliedMap.get(fileName);
        const runDate = new Date(appliedData.run_on);
        console.log(`  Applied:  ${runDate.toLocaleString()}`);
      }

      // Read and show description from file
      const filePath = path.join(migrationsDir, file);
      if (file.endsWith(".js")) {
        const content = fs.readFileSync(filePath, "utf8");
        const commentMatch = content.match(
          /\/\*\s*\n?\s*Description:\s*(.+?)\s*\n?\s*\*\//
        );
        if (commentMatch) {
          console.log(`  Info:     ${commentMatch[1]}`);
        }
      }

      console.log("");
    });

    console.log("-".repeat(80));
    console.log(`Total Migrations: ${migrationFiles.length}`);
    console.log(`Applied: ${appliedMigrations.length}`);
    console.log(`Pending: ${migrationFiles.length - appliedMigrations.length}`);
    console.log("-".repeat(80) + "\n");

    if (appliedMigrations.length > 0) {
      const lastApplied = appliedMigrations[appliedMigrations.length - 1];
      console.log(`Current revision: ${lastApplied.name}`);
      console.log(
        `Last applied: ${new Date(lastApplied.run_on).toLocaleString()}\n`
      );
    } else {
      console.log("Current revision: <base> (no migrations applied)\n");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.end();
  }
}

getMigrationStatus();
