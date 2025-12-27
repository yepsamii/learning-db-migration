import "dotenv/config";
import { Client } from "pg";

async function showHistory() {
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

    const result = await client.query(`
      SELECT id, name, run_on 
      FROM pgmigrations 
      ORDER BY run_on DESC
    `);

    console.log("\n" + "=".repeat(80));
    console.log("📜 MIGRATION HISTORY");
    console.log("=".repeat(80) + "\n");

    if (result.rows.length === 0) {
      console.log("No migrations have been applied yet.\n");
      return;
    }

    result.rows.forEach((row, index) => {
      const [timestamp, ...nameParts] = row.name.split("_");
      const name = nameParts.join("_");
      const date = new Date(row.run_on);
      const isLatest = index === 0;

      console.log(`${isLatest ? "→" : " "} ${row.id}. ${name}`);
      console.log(`  Revision: ${timestamp}`);
      console.log(`  Applied:  ${date.toLocaleString()}`);
      console.log("");
    });

    console.log("-".repeat(80));
    console.log(`Total applied: ${result.rows.length}\n`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.end();
  }
}

showHistory();
