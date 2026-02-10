import { pool } from "../config/db.js";

const getTodos = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

const createTodo = async (req, res) => {
  try {
    const { task, priority = "medium" } = req.body;

    if (!task || task.trim() === "") {
      return res.status(400).json({ error: "Task is required" });
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high", "urgent"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: "Invalid priority level" });
    }

    const result = await pool.query(
      "INSERT INTO todos (task, priority, status) VALUES ($1, $2, $3) RETURNING *",
      [task.trim(), priority, "pending"],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
};

const getTodoById = async (req, res) => {
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
};

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { task, status, priority } = req.body;

    let query = "UPDATE todos SET ";
    const values = [];
    const updates = [];

    if (task !== undefined) {
      updates.push(`task = $${values.length + 1}`);
      values.push(task.trim());
    }

    if (status !== undefined) {
      const validStatuses = ["pending", "done"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      updates.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (priority !== undefined) {
      const validPriorities = ["low", "medium", "high", "urgent"];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ error: "Invalid priority level" });
      }
      updates.push(`priority = $${values.length + 1}`);
      values.push(priority);
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
};

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully", todo: result.rows[0] });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
};

export { getTodos, createTodo, getTodoById, updateTodo, deleteTodo };
