# To-Do App

A simple to-do application built with Node.js, Express, PostgreSQL, and Docker Compose.

## Features

- ✅ Create new tasks
- ✅ View all tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Edit existing tasks
- ✅ Delete tasks

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
├── server.js           # Express server with API routes
├── package.json        # Node.js dependencies
├── Dockerfile          # Docker configuration for Node.js app
├── docker-compose.yml   # Docker Compose configuration
├── public/             # Frontend files
│   ├── index.html     # Main HTML file
│   ├── style.css      # Styles
│   └── script.js      # JavaScript for frontend
└── README.md          # This file
```

## API Endpoints

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a single todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Database

The PostgreSQL database automatically creates a `todos` table with the following structure:
- `id` - Primary key (auto-increment)
- `task` - Task description (VARCHAR)
- `completed` - Completion status (BOOLEAN)
- `created_at` - Timestamp

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

## Notes

- The database data persists in a Docker volume named `postgres_data`
- The app runs on port 3000
- PostgreSQL runs on port 5432

