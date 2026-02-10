// Load environment variables
import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  client,
  httpRequestsTotal,
  httpRequestDuration,
  activeRequests,
} from "./metrics.js";
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
} from "./controllers/todo.js";
import { pool } from "./config/db.js";

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Test database connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

// Routes

// GET all todos
app.get("/api/todos", getTodos);

// GET a single todo by id
app.get("/api/todos/:id", getTodoById);

// POST create a new todo
app.post("/api/todos", createTodo);

// PUT update a todo
app.put("/api/todos/:id", updateTodo);

// DELETE a todo
app.delete("/api/todos/:id", deleteTodo);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
