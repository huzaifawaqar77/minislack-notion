import { db } from "./database";
import fs from "fs";
import path from "path";
import { sql } from "kysely";

async function runMigration(migrationFile: string) {
  try {
    console.log(`Running migration: ${migrationFile}`);

    // Read the SQL file
    const filePath = path.join(__dirname, "migrations", migrationFile);
    const sqlContent = fs.readFileSync(filePath, "utf8");

    // Execute the SQL
    await db.executeQuery(sql`${sql.raw(sqlContent)}`.compile(db));

    console.log(`✅ Migration ${migrationFile} completed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${migrationFile} failed:`, error);
    process.exit(1);
  }
}

// Run the migration
async function main() {
  try {
    // Add migrations in the order they should be executed
    const migrations = [
      "create_verification_tokens_table.sql",
      "create_organizations_table.sql",
      "create_additional_tables.sql",
      "create_integration_tables.sql",
      "add_oauth_fields.sql",
    ];

    // Run each migration
    for (const migration of migrations) {
      try {
        await runMigration(migration);
      } catch (error) {
        console.error(`Migration ${migration} failed:`, error);
        throw error;
      }
    }

    console.log("All migrations completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration process failed:", error);
    process.exit(1);
  }
}

main();
