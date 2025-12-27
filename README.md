# To-Do App

A simple to-do application built with Node.js, Express, PostgreSQL, and Docker Compose.

## Features

- ✅ Create new tasks
- ✅ View all tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Edit existing tasks
- ✅ Delete tasks
- ✅ Priority levels (low, medium, high, urgent)
- ✅ User management and task ownership
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Database migrations for schema version control

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: HTML, CSS, JavaScript
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker
- Docker Compose

## How to Run

1. **Clone or navigate to the project directory**

2. **Start the application with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

4. **To stop the application:**
   ```bash
   docker-compose down
   ```

5. **To stop and remove all data (including database):**
   ```bash
   docker-compose down -v
   ```

## Project Structure

```
.
├── server.js              # Express server with API routes
├── package.json           # Node.js dependencies and scripts
├── Dockerfile             # Docker configuration for Node.js app
├── docker-compose.yml     # Docker Compose configuration
├── .env                   # Environment variables (DB config)
├── migrations/            # Database migration files
│   ├── 1766822566208_create-todos-table.js
│   ├── 1766823568598_add-priority-to-todos.js
│   ├── 1766827148674_add-indexes-to-todos.js
│   ├── 1766827441304_create-users-and-add-relationships.js
│   ├── 1766827781585_migrate-todo-data.js
│   ├── 1766828865950_create-priority-enum.js
│   └── 1766829353984_add-updated-at-trigger.js
├── scripts/               # Migration helper scripts
│   ├── create-migration.js   # Create new migration files
│   ├── migration-status.js   # Check migration status
│   └── migration-history.js  # View applied migrations
├── public/                # Frontend files
│   ├── index.html        # Main HTML file
│   ├── style.css         # Styles
│   └── script.js         # JavaScript for frontend
└── README.md             # This file (documentation)
```

## API Endpoints

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a single todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Database

### Current Schema

The PostgreSQL database has the following tables:

**users** table:
- `id` - Primary key (serial)
- `username` - Unique username (VARCHAR 100)
- `email` - Unique email (VARCHAR 255)
- `created_at` - Timestamp

**todos** table:
- `id` - Primary key (serial)
- `task` - Task description (VARCHAR 255) - has unique index
- `status` - Status (VARCHAR 20: 'pending' or 'done')
- `priority` - Priority level (ENUM: 'low', 'medium', 'high', 'urgent')
- `user_id` - Foreign key to users (CASCADE on delete)
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp via trigger

**Indexes:**
- Single column: `completed` (if status migration reverted)
- Multi-column: `(completed, created_at)` (if status migration reverted)
- Unique: `task`
- Partial: `created_at` where `completed = false` (conditional index)
- Foreign key: `user_id`

### Database Migrations

This project uses [node-pg-migrate](https://github.com/salsita/node-pg-migrate) to manage database schema changes through version-controlled migration files.

#### Why Migrations?

Database migrations provide:
- **Version Control**: Track all database schema changes over time
- **Reproducibility**: Apply the same changes consistently across environments
- **Collaboration**: Multiple developers can work on schema changes without conflicts
- **Rollback**: Undo changes safely if something goes wrong
- **Documentation**: Each migration file documents what changed and when

#### Migration Commands

```bash
# Check migration status (which are applied/pending)
npm run migrate:status

# View migration history (what's been applied)
npm run migrate:history

# Create a new migration file
npm run migrate:create

# Apply all pending migrations
npm run migrate:up

# Rollback the last migration
npm run migrate:down

# Redo the last migration (down then up)
npm run migrate:redo
```

#### Creating a New Migration

1. Run the creation script:
   ```bash
   npm run migrate:create
   ```

2. Enter a descriptive name (e.g., "add-tags-to-todos")

3. Edit the generated file in `migrations/` folder

4. Implement the `up` function (apply changes) and `down` function (rollback changes)

#### Migration File Structure

Each migration file has two main functions:

```javascript
// Apply the migration
export const up = (pgm) => {
  // Add your schema changes here
  pgm.createTable('table_name', {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true }
  });
};

// Rollback the migration
export const down = (pgm) => {
  // Reverse the changes made in up()
  pgm.dropTable('table_name');
};
```

**Important**: Always implement both `up` and `down` functions so migrations can be rolled back if needed.

#### Migration History & What We Built

This project demonstrates various migration patterns through these examples:

1. **Creating Tables** (`1766822566208_create-todos-table.js`)
   - Shows basic table creation with different column types
   - Demonstrates shorthand syntax (`id: 'id'` for serial primary key)
   - Uses `pgm.func()` for database functions like `current_timestamp`

2. **Adding Columns** (`1766823568598_add-priority-to-todos.js`)
   - Adds a new column to an existing table
   - Shows how to set default values
   - Example of a simple, reversible migration

3. **Creating Indexes** (`1766827148674_add-indexes-to-todos.js`)
   - **Single column index**: Speeds up queries filtering by one column
     ```javascript
     pgm.createIndex('todos', 'completed');
     ```
   - **Multi-column index**: Optimizes queries using multiple columns
     ```javascript
     pgm.createIndex('todos', ['completed', 'created_at']);
     ```
   - **Unique index**: Enforces uniqueness constraint
     ```javascript
     pgm.createIndex('todos', 'task', { unique: true });
     ```
   - **Partial index**: Indexes only rows matching a condition (saves space & improves performance)
     ```javascript
     pgm.createIndex('todos', 'created_at', {
       where: 'completed = false',
       name: 'idx_incomplete_todos_created_at'
     });
     ```

4. **Foreign Keys & Relations** (`1766827441304_create-users-and-add-relationships.js`)
   - Creates a new `users` table
   - Adds foreign key relationship with CASCADE delete
   - Creates index on foreign key for query performance
   - Shows `notNull: false` for existing data compatibility

5. **Data Migration** (`1766827781585_migrate-todo-data.js`)
   - Demonstrates the pattern for changing column types with data preservation:
     1. Add new column (nullable)
     2. Migrate data using SQL
     3. Make new column non-null
     4. Drop old column
   - Uses `pgm.sql()` to execute raw SQL for complex operations
   - Shows both forward and backward data migration

6. **Custom Types (ENUM)** (`1766828865950_create-priority-enum.js`)
   - Creates PostgreSQL ENUM type for controlled values
   - More type-safe than VARCHAR with check constraints
   - Database enforces valid values automatically

7. **Triggers & Functions** (`1766829353984_add-updated-at-trigger.js`)
   - Creates a PostgreSQL function using PL/pgSQL
   - Sets up a BEFORE UPDATE trigger
   - Automatically updates `updated_at` timestamp on row changes
   - Shows advanced database features for business logic

#### Advanced Migration Concepts

**Using Raw SQL:**
When pgm methods aren't sufficient, use `pgm.sql()`:
```javascript
pgm.sql(`
  UPDATE todos
  SET status = CASE
    WHEN completed = true THEN 'done'
    ELSE 'pending'
  END
`);
```

**Functions and Triggers:**
```javascript
// Create a function
pgm.createFunction('function_name', [], {
  returns: 'trigger',
  language: 'plpgsql',
  replace: true
}, `function body here`);

// Create a trigger
pgm.createTrigger('table_name', 'trigger_name', {
  when: 'BEFORE',
  operation: 'UPDATE',
  function: 'function_name',
  level: 'ROW'
});
```

**Handling Existing Data:**
When adding NOT NULL columns to tables with existing data:
1. Add column as nullable
2. Populate it with data
3. Alter column to add NOT NULL constraint
4. Optionally add default value

#### Migration Best Practices

1. **Always test rollbacks**: Run `migrate:down` after `migrate:up` in development
2. **Keep migrations small**: One logical change per migration file
3. **Never modify existing migrations**: Once applied in production, create a new migration instead
4. **Use transactions implicitly**: node-pg-migrate wraps each migration in a transaction
5. **Name descriptively**: Use clear names like `add-email-to-users` not `update-table`
6. **Write comments**: Explain complex migrations or business logic
7. **Test with data**: Ensure migrations work with existing data, not just empty tables

#### Troubleshooting Migrations

**Migration fails:**
- Check the error message in console
- Verify database connection settings in `.env`
- Ensure previous migrations are applied (`npm run migrate:status`)
- Test SQL in a database client first

**Need to rollback:**
```bash
npm run migrate:down  # Rollback last migration
```

**Migration already applied:**
The `pgmigrations` table tracks which migrations have been applied. node-pg-migrate won't re-run them.

**Start fresh (development only):**
```bash
docker-compose down -v  # Destroys all data
docker-compose up       # Migrations run automatically on startup
```

## Development

If you want to run the app without Docker:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure PostgreSQL is running and update the `.env` file with your database credentials

3. Start the server:
   ```bash
   npm start
   ```

## Learning Outcomes

This project demonstrates practical knowledge of:

### Database Migrations
- **Version control for database schemas** using node-pg-migrate
- **Sequential schema evolution** through timestamped migration files
- **Bidirectional migrations** with both `up` and `down` functions
- **Data preservation** during schema changes

### PostgreSQL Features
- **Table creation and relationships** (foreign keys, CASCADE deletes)
- **Indexes for performance** (single, multi-column, unique, partial)
- **Custom data types** (ENUM types for controlled values)
- **Triggers and functions** (auto-updating timestamps with PL/pgSQL)
- **Constraints and defaults** (NOT NULL, unique, default values)

### Migration Patterns
1. **Creating tables** - Basic DDL operations
2. **Adding columns** - Extending existing schemas
3. **Creating indexes** - Query optimization techniques
4. **Foreign keys** - Establishing table relationships
5. **Data migration** - Safely transforming existing data
6. **Custom types** - Using PostgreSQL ENUM
7. **Triggers** - Automating database operations

### Development Workflow
- **Automated migration tracking** via `pgmigrations` table
- **Helper scripts** for status checking and history viewing
- **Testing rollbacks** to ensure safe schema changes
- **Docker integration** for consistent development environments

### Best Practices Learned
- Always write reversible migrations (implement both up/down)
- Keep migrations small and focused on one change
- Test with existing data, not just empty tables
- Use raw SQL when ORM methods are insufficient
- Version control all schema changes
- Document complex migrations with comments

## Notes

- The database data persists in a Docker volume named `postgres_data`
- The app runs on port 3000
- PostgreSQL runs on port 5432
- Migrations are automatically run when the Docker container starts
- The `pgmigrations` table tracks which migrations have been applied
- Helper scripts in `scripts/` folder make migration management easier

