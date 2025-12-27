# To-Do App

A simple to-do application built with Node.js, Express, PostgreSQL, and Docker Compose.

## Documentation

- **[README.md](./README.md)** (this file) - Project overview, setup, and features
- **[MIGRATIONS.md](./MIGRATIONS.md)** - Complete database migrations guide

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
├── README.md              # Project documentation (this file)
├── MIGRATIONS.md          # Database migrations guide
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
└── public/                # Frontend files
    ├── index.html         # Main HTML file
    ├── style.css          # Styles
    └── script.js          # JavaScript for frontend
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
- Unique: `task`
- Partial: `created_at` where `completed = false` (conditional index)
- Foreign key: `user_id`

### Database Migrations

This project uses [node-pg-migrate](https://github.com/salsita/node-pg-migrate) for database schema version control.

**Quick Commands:**
```bash
npm run migrate:status    # Check which migrations are applied/pending
npm run migrate:up        # Apply all pending migrations
npm run migrate:down      # Rollback the last migration
npm run migrate:create    # Create a new migration file
npm run migrate:history   # View migration history
```

**📚 For detailed migration documentation, see [MIGRATIONS.md](./MIGRATIONS.md)**

The migrations guide includes:
- How migrations work
- Creating and running migrations
- Migration patterns (tables, indexes, foreign keys, ENUMs, triggers)
- Advanced techniques
- Best practices
- Troubleshooting
- Complete examples of all 7 migrations in this project

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

### Full-Stack Development
- **Backend**: Node.js, Express, RESTful API design
- **Frontend**: Vanilla JavaScript, DOM manipulation, async/await
- **Database**: PostgreSQL with advanced features
- **DevOps**: Docker, Docker Compose, containerization

### Database Migrations (See [MIGRATIONS.md](./MIGRATIONS.md) for details)
- Version-controlled schema changes using node-pg-migrate
- 7 complete migration examples covering:
  - Creating tables and columns
  - Indexes (single, multi-column, unique, partial)
  - Foreign keys and relationships
  - Data migration patterns
  - PostgreSQL ENUMs
  - Triggers and functions (PL/pgSQL)
- Automated tracking and rollback capabilities

### PostgreSQL Advanced Features
- Custom data types (ENUM for priority levels)
- Database triggers (auto-updating timestamps)
- Foreign key constraints with CASCADE delete
- Performance optimization with strategic indexes
- Partial indexes for specific query patterns

### Development Best Practices
- Schema version control
- Docker for consistent environments
- Separation of concerns (API, database, frontend)
- Environment-based configuration
- Helper scripts for common tasks

## Notes

- The database data persists in a Docker volume named `postgres_data`
- The app runs on port 3000
- PostgreSQL runs on port 5432
- Migrations are automatically run when the Docker container starts
- The `pgmigrations` table tracks which migrations have been applied
- Helper scripts in `scripts/` folder make migration management easier

