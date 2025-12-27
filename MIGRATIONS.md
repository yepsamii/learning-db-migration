# Database Migrations Guide

This guide covers everything you need to know about database migrations in this project using [node-pg-migrate](https://github.com/salsita/node-pg-migrate).

## Table of Contents

- [What Are Migrations?](#what-are-migrations)
- [Quick Start](#quick-start)
- [Migration Commands](#migration-commands)
- [Creating Migrations](#creating-migrations)
- [Migration Patterns](#migration-patterns)
- [Advanced Techniques](#advanced-techniques)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Migration History](#migration-history)

---

## What Are Migrations?

Database migrations are version-controlled changes to your database schema. They allow you to:

- **Track Changes**: Every schema modification is recorded in a migration file
- **Collaborate**: Multiple developers can work on schema changes without conflicts
- **Rollback**: Undo changes safely if something goes wrong
- **Deploy**: Apply the same changes consistently across environments
- **Document**: Each migration serves as documentation of what changed and when

### How Migrations Work

1. Each migration has a unique timestamp-based filename
2. Migrations are applied in chronological order
3. The `pgmigrations` table tracks which migrations have been applied
4. Each migration has an `up()` function (apply) and `down()` function (rollback)

---

## Quick Start

### Check Current Status

```bash
npm run migrate:status
```

This shows which migrations are applied and which are pending.

### Apply All Pending Migrations

```bash
npm run migrate:up
```

Runs all migrations that haven't been applied yet.

### Rollback Last Migration

```bash
npm run migrate:down
```

Undoes the most recently applied migration.

---

## Migration Commands

| Command | Description |
|---------|-------------|
| `npm run migrate:status` | Check which migrations are applied/pending |
| `npm run migrate:history` | View history of applied migrations |
| `npm run migrate:create` | Create a new migration file |
| `npm run migrate:up` | Apply all pending migrations |
| `npm run migrate:down` | Rollback the last migration |
| `npm run migrate:redo` | Rollback and reapply the last migration |

### Detailed Command Usage

#### `migrate:status`

Shows the current state of all migrations:

```bash
npm run migrate:status
```

Output example:
```
✅ APPLIED
  Revision: 1766822566208
  Name:     create-todos-table
  File:     1766822566208_create-todos-table.js
  Applied:  12/27/2025, 8:20:31 AM

⏳ PENDING
  Revision: 1766829999999
  Name:     add-tags-to-todos
  File:     1766829999999_add-tags-to-todos.js
```

#### `migrate:history`

Shows only the migrations that have been applied, in reverse chronological order:

```bash
npm run migrate:history
```

#### `migrate:up`

Applies all pending migrations. You can optionally specify how many:

```bash
npm run migrate:up           # Apply all pending
```

#### `migrate:down`

Rolls back migrations. Be careful with this in production!

```bash
npm run migrate:down         # Rollback last migration
```

#### `migrate:redo`

Useful for testing - rolls back and reapplies the last migration:

```bash
npm run migrate:redo
```

---

## Creating Migrations

### Step 1: Generate Migration File

```bash
npm run migrate:create
```

You'll be prompted for:
1. **Migration name**: Use descriptive kebab-case (e.g., "add-tags-to-todos")
2. **Description**: Brief explanation of what this migration does

### Step 2: Edit the Migration File

The generated file will be in `migrations/` folder with this structure:

```javascript
export const up = (pgm) => {
  // TODO: Write your migration here
};

export const down = (pgm) => {
  // TODO: Write rollback logic here
};
```

### Step 3: Implement Up and Down Functions

**Example: Adding a column**

```javascript
export const up = (pgm) => {
  pgm.addColumn('todos', {
    tags: {
      type: 'text[]',  // PostgreSQL array type
      default: '{}'
    }
  });
};

export const down = (pgm) => {
  pgm.dropColumn('todos', 'tags');
};
```

### Step 4: Apply the Migration

```bash
npm run migrate:up
```

### Step 5: Test the Rollback

Always test that your down function works:

```bash
npm run migrate:down
npm run migrate:up
```

---

## Migration Patterns

### Creating Tables

```javascript
export const up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',  // Shorthand for serial primary key
    username: { type: 'varchar(100)', notNull: true, unique: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });
};

export const down = (pgm) => {
  pgm.dropTable('users');
};
```

### Adding Columns

```javascript
export const up = (pgm) => {
  pgm.addColumn('todos', {
    priority: {
      type: 'varchar(20)',
      default: 'medium'
    }
  });
};

export const down = (pgm) => {
  pgm.dropColumn('todos', 'priority');
};
```

### Creating Indexes

**Single Column Index:**
```javascript
pgm.createIndex('todos', 'status');
```

**Multi-Column Index:**
```javascript
pgm.createIndex('todos', ['user_id', 'created_at']);
```

**Unique Index:**
```javascript
pgm.createIndex('todos', 'email', { unique: true });
```

**Partial Index (Conditional):**
```javascript
pgm.createIndex('todos', 'created_at', {
  where: 'status = \'pending\'',
  name: 'idx_pending_todos_created_at'
});
```

**Rollback:**
```javascript
pgm.dropIndex('todos', 'status');
pgm.dropIndex('todos', ['user_id', 'created_at']);
pgm.dropIndex('todos', 'idx_pending_todos_created_at');
```

### Foreign Keys

```javascript
export const up = (pgm) => {
  pgm.addColumn('todos', {
    user_id: {
      type: 'integer',
      notNull: false,  // Allow null for existing data
      references: 'users(id)',
      onDelete: 'CASCADE'
    }
  });

  // Index on foreign key for performance
  pgm.createIndex('todos', 'user_id');
};

export const down = (pgm) => {
  pgm.dropColumn('todos', 'user_id');
};
```

### Creating ENUM Types

```javascript
export const up = (pgm) => {
  // Create the enum type
  pgm.createType('priority_level', ['low', 'medium', 'high', 'urgent']);

  // Use it in a column
  pgm.addColumn('todos', {
    priority: {
      type: 'priority_level',
      notNull: true,
      default: 'medium'
    }
  });
};

export const down = (pgm) => {
  pgm.dropColumn('todos', 'priority');
  pgm.dropType('priority_level');
};
```

### Migrating Data

When you need to change a column type while preserving data:

```javascript
export const up = (pgm) => {
  // 1. Add new column
  pgm.addColumn('todos', {
    status: { type: 'varchar(20)' }
  });

  // 2. Migrate data
  pgm.sql(`
    UPDATE todos
    SET status = CASE
      WHEN completed = true THEN 'done'
      ELSE 'pending'
    END
  `);

  // 3. Make it not null
  pgm.alterColumn('todos', 'status', {
    notNull: true
  });

  // 4. Drop old column
  pgm.dropColumn('todos', 'completed');
};

export const down = (pgm) => {
  // Reverse the process
  pgm.addColumn('todos', {
    completed: { type: 'boolean' }
  });

  pgm.sql(`
    UPDATE todos
    SET completed = CASE
      WHEN status = 'done' THEN true
      ELSE false
    END
  `);

  pgm.alterColumn('todos', 'completed', {
    notNull: true,
    default: false
  });

  pgm.dropColumn('todos', 'status');
};
```

### Triggers and Functions

```javascript
export const up = (pgm) => {
  // 1. Add the column
  pgm.addColumn('todos', {
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  // 2. Create the trigger function
  pgm.createFunction(
    'update_updated_at_column',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
      replace: true
    },
    `
    BEGIN
      NEW.updated_at = current_timestamp;
      RETURN NEW;
    END;
    `
  );

  // 3. Create the trigger
  pgm.createTrigger('todos', 'update_todos_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_updated_at_column',
    level: 'ROW'
  });
};

export const down = (pgm) => {
  pgm.dropTrigger('todos', 'update_todos_updated_at');
  pgm.dropFunction('update_updated_at_column', []);
  pgm.dropColumn('todos', 'updated_at');
};
```

---

## Advanced Techniques

### Using Raw SQL

When pgm methods aren't sufficient:

```javascript
export const up = (pgm) => {
  pgm.sql(`
    CREATE INDEX CONCURRENTLY idx_todos_search
    ON todos USING gin(to_tsvector('english', task));
  `);
};

export const down = (pgm) => {
  pgm.sql('DROP INDEX IF EXISTS idx_todos_search');
};
```

### Conditional Migrations

```javascript
export const up = (pgm) => {
  // Check if column exists before adding
  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='todos' AND column_name='deleted_at'
      ) THEN
        ALTER TABLE todos ADD COLUMN deleted_at TIMESTAMP;
      END IF;
    END $$;
  `);
};
```

### Adding Constraints

```javascript
export const up = (pgm) => {
  // Check constraint
  pgm.addConstraint('todos', 'priority_check', {
    check: "priority IN ('low', 'medium', 'high', 'urgent')"
  });

  // Unique constraint
  pgm.addConstraint('todos', 'unique_task_per_user', {
    unique: ['user_id', 'task']
  });
};

export const down = (pgm) => {
  pgm.dropConstraint('todos', 'priority_check');
  pgm.dropConstraint('todos', 'unique_task_per_user');
};
```

---

## Best Practices

### 1. Always Implement Down Functions

Even if you think you'll never rollback, implement the `down()` function. Future you will thank you.

```javascript
// ✅ Good
export const down = (pgm) => {
  pgm.dropTable('todos');
};

// ❌ Bad
export const down = (pgm) => {
  // TODO: implement rollback
};
```

### 2. Keep Migrations Small

One logical change per migration file. Don't mix multiple features.

```javascript
// ✅ Good: One migration for adding tags
// 1766829999999_add-tags-to-todos.js

// ❌ Bad: One migration for tags, priority, and status
// 1766829999999_add-multiple-features.js
```

### 3. Test Rollbacks in Development

Always test that your migration can be rolled back:

```bash
npm run migrate:up
npm run migrate:down
npm run migrate:up
```

### 4. Never Modify Applied Migrations

Once a migration is applied (especially in production), never modify it. Create a new migration instead.

```javascript
// ❌ Don't do this if migration is already applied
// Edit 001_create-users.js to add a new column

// ✅ Do this instead
// Create 002_add-email-to-users.js
```

### 5. Handle Existing Data

When adding NOT NULL columns to tables with existing data:

```javascript
export const up = (pgm) => {
  // 1. Add as nullable
  pgm.addColumn('todos', {
    priority: { type: 'varchar(20)' }
  });

  // 2. Set default values for existing rows
  pgm.sql("UPDATE todos SET priority = 'medium' WHERE priority IS NULL");

  // 3. Make it not null
  pgm.alterColumn('todos', 'priority', {
    notNull: true,
    default: 'medium'
  });
};
```

### 6. Use Descriptive Names

```javascript
// ✅ Good names
create-todos-table
add-priority-to-todos
create-users-and-add-relationships

// ❌ Bad names
update-db
fix-schema
changes
```

### 7. Add Comments for Complex Logic

```javascript
export const up = (pgm) => {
  // We're using a partial index here because 99% of queries
  // filter on pending tasks. This saves disk space and improves
  // query performance for the common case.
  pgm.createIndex('todos', 'created_at', {
    where: "status = 'pending'",
    name: 'idx_pending_todos_created_at'
  });
};
```

### 8. Use Transactions (Automatic)

node-pg-migrate automatically wraps each migration in a transaction. If any part fails, the entire migration is rolled back.

---

## Troubleshooting

### Migration Fails

**Check the error message:**
```bash
npm run migrate:up
```

Common issues:
- Syntax error in SQL
- Column/table already exists
- Foreign key constraint violation
- Type mismatch

**Solution:** Fix the migration file and run again.

### Need to Rollback

```bash
npm run migrate:down
```

If rollback also fails, you may need to fix the database manually:

```bash
# Connect to database
docker exec -it todo_db psql -U postgres -d todo_db

# Inspect the issue
\d todos

# Make manual fixes if necessary
ALTER TABLE todos DROP COLUMN problematic_column;
```

### Migration Already Applied

If you try to run a migration that's already applied:

```bash
npm run migrate:status  # Check what's applied
```

The `pgmigrations` table tracks this. Don't modify it manually unless absolutely necessary.

### Start Fresh (Development Only)

**⚠️ WARNING: This deletes all data!**

```bash
docker-compose down -v  # Destroy database
docker-compose up       # Recreate and run migrations
```

### Check Database Directly

```bash
# Connect to database
docker exec -it todo_db psql -U postgres -d todo_db

# List tables
\dt

# Describe table structure
\d todos

# Check migrations table
SELECT * FROM pgmigrations ORDER BY run_on DESC;

# Exit
\q
```

### Migration Hangs

If a migration seems stuck:

1. Check for locks: `SELECT * FROM pg_locks;`
2. Check running queries: `SELECT * FROM pg_stat_activity;`
3. Kill the migration process
4. Fix the issue and try again

---

## Migration History

This project includes these example migrations showing different patterns:

### 1. `create-todos-table.js` - Basic Table Creation

**What it does:** Creates the initial todos table

**Demonstrates:**
- Creating a table with primary key
- Using shorthand syntax (`id: 'id'`)
- Setting default values with `pgm.func()`
- NOT NULL constraints

### 2. `add-priority-to-todos.js` - Adding Columns

**What it does:** Adds a priority column to todos

**Demonstrates:**
- Adding a column to existing table
- Setting default values
- Simple reversible migrations

### 3. `add-indexes-to-todos.js` - Performance Optimization

**What it does:** Creates various indexes for query optimization

**Demonstrates:**
- Single column index
- Multi-column index
- Unique index
- Partial index (conditional)

**When to use:**
- Columns frequently used in WHERE clauses
- Foreign key columns
- Unique constraints
- Large tables with specific query patterns

### 4. `create-users-and-add-relationships.js` - Foreign Keys

**What it does:** Creates users table and adds relationship to todos

**Demonstrates:**
- Creating related tables
- Foreign key constraints
- CASCADE delete behavior
- Indexing foreign keys
- Handling existing data (nullable initially)

### 5. `migrate-todo-data.js` - Data Migration

**What it does:** Changes 'completed' boolean to 'status' varchar

**Demonstrates:**
- Safe data migration pattern
- Using raw SQL for data transformation
- Bidirectional data conversion
- Altering column constraints after populating

**Critical pattern for:**
- Changing column types
- Renaming columns with data transformation
- Splitting/merging columns

### 6. `create-priority-enum.js` - Custom Types

**What it does:** Creates PostgreSQL ENUM type for priority

**Demonstrates:**
- Creating custom types
- Type-safe columns
- Database-level validation

**Benefits:**
- Database enforces valid values
- Better than VARCHAR with check constraints
- Self-documenting schema

### 7. `add-updated-at-trigger.js` - Database Automation

**What it does:** Auto-updates updated_at timestamp on row changes

**Demonstrates:**
- Creating PostgreSQL functions (PL/pgSQL)
- Creating triggers
- Automatic column updates
- Database-level business logic

**When to use:**
- Auto-updating timestamps
- Audit trails
- Enforcing business rules at DB level

---

## Additional Resources

- [node-pg-migrate Documentation](https://salsita.github.io/node-pg-migrate/)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/triggers.html)

---

## Quick Reference

### Common pgm Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `createTable()` | Create a new table | `pgm.createTable('users', {...})` |
| `dropTable()` | Delete a table | `pgm.dropTable('users')` |
| `addColumn()` | Add column(s) | `pgm.addColumn('users', {...})` |
| `dropColumn()` | Remove column | `pgm.dropColumn('users', 'email')` |
| `alterColumn()` | Modify column | `pgm.alterColumn('users', 'email', {...})` |
| `createIndex()` | Create index | `pgm.createIndex('users', 'email')` |
| `dropIndex()` | Remove index | `pgm.dropIndex('users', 'email')` |
| `createType()` | Create ENUM | `pgm.createType('status', ['active', 'inactive'])` |
| `dropType()` | Remove ENUM | `pgm.dropType('status')` |
| `addConstraint()` | Add constraint | `pgm.addConstraint('users', 'check_age', {...})` |
| `dropConstraint()` | Remove constraint | `pgm.dropConstraint('users', 'check_age')` |
| `createFunction()` | Create PL/pgSQL function | `pgm.createFunction('fn_name', ...)` |
| `dropFunction()` | Remove function | `pgm.dropFunction('fn_name')` |
| `createTrigger()` | Create trigger | `pgm.createTrigger('users', 'trigger_name', {...})` |
| `dropTrigger()` | Remove trigger | `pgm.dropTrigger('users', 'trigger_name')` |
| `sql()` | Run raw SQL | `pgm.sql('SELECT * FROM users')` |

### Column Types

```javascript
{
  type: 'integer',           // Whole numbers
  type: 'varchar(255)',      // Variable-length string
  type: 'text',              // Unlimited text
  type: 'boolean',           // true/false
  type: 'timestamp',         // Date and time
  type: 'date',              // Date only
  type: 'json',              // JSON data
  type: 'jsonb',             // Binary JSON (faster)
  type: 'uuid',              // UUID
  type: 'text[]',            // Array of text
  type: 'custom_enum_type',  // Your ENUM type
}
```

### Column Options

```javascript
{
  notNull: true,                    // NOT NULL constraint
  unique: true,                     // UNIQUE constraint
  default: 'value',                 // Default value
  default: pgm.func('now()'),       // Default function
  references: 'users(id)',          // Foreign key
  onDelete: 'CASCADE',              // FK delete behavior
  check: "column > 0",              // Check constraint
}
```

---

**Happy Migrating! 🚀**
