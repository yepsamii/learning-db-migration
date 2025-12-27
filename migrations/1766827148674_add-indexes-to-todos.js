export const up = (pgm) => {
  // Single column index
  pgm.createIndex("todos", "completed");

  // Multi-column index
  pgm.createIndex("todos", ["completed", "created_at"]);

  // Unique index
  pgm.createIndex("todos", "task", { unique: true });

  // Partial index (conditional)
  pgm.createIndex("todos", "created_at", {
    where: "completed = false",
    name: "idx_incomplete_todos_created_at",
  });
};

export const down = (pgm) => {
  pgm.dropIndex("todos", "completed");
  pgm.dropIndex("todos", ["completed", "created_at"]);
  pgm.dropIndex("todos", "task", { unique: true });
  pgm.dropIndex("todos", "idx_incomplete_todos_created_at");
};
