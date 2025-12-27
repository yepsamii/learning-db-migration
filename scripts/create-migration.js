import fs from "fs";
import path from "path";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createMigration() {
  try {
    const name = await question("Migration name: ");
    const description = await question("Description: ");

    const timestamp = Date.now();
    const fileName = `${timestamp}_${name.replace(/\s+/g, "-")}.js`;
    const migrationsDir = path.join(process.cwd(), "migrations");

    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const filePath = path.join(migrationsDir, fileName);
    const date = new Date().toISOString();

    const content = `/*
 * Migration: ${name}
 * Description: ${description}
 * Created: ${date}
 */

export const up = (pgm) => {
  // TODO: Write your migration here
  
};

export const down = (pgm) => {
  // TODO: Write rollback logic here
  
};
`;

    fs.writeFileSync(filePath, content);

    console.log(`\n✅ Migration created: ${fileName}`);
    console.log(`📝 Edit file: ${filePath}\n`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    rl.close();
  }
}

createMigration();
