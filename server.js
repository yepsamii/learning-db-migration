// Load environment variables
import "dotenv/config";
import express from "express";
import cors from "cors";
import { Pool } from "pg";

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "db",
  database: process.env.DB_NAME || "todo_db",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

// Routes

// GET all todos
app.get("/api/todos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// GET a single todo by id
app.get("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// POST create a new todo
app.post("/api/todos", async (req, res) => {
  try {
    const { task } = req.body;

    if (!task || task.trim() === "") {
      return res.status(400).json({ error: "Task is required" });
    }

    const result = await pool.query(
      "INSERT INTO todos (task) VALUES ($1) RETURNING *",
      [task.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// PUT update a todo
app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { task, completed } = req.body;

    let query = "UPDATE todos SET ";
    const values = [];
    const updates = [];

    if (task !== undefined) {
      updates.push(`task = $${values.length + 1}`);
      values.push(task.trim());
    }

    if (completed !== undefined) {
      updates.push(`completed = $${values.length + 1}`);
      values.push(completed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    query += updates.join(", ") + ` WHERE id = $${values.length} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// DELETE a todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully", todo: result.rows[0] });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
