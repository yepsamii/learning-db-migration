export const up = (pgm) => {
  // Create users table
  pgm.createTable("users", {
    id: "id",
    username: { type: "varchar(100)", notNull: true, unique: true },
    email: { type: "varchar(255)", notNull: true, unique: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Add user_id to todos
  pgm.addColumn("todos", {
    user_id: {
      type: "integer",
      notNull: false, // Allow null initially for existing data
      references: "users(id)",
      onDelete: "CASCADE", // Delete todos when user is deleted
    },
  });

  // Create index on foreign key
  pgm.createIndex("todos", "user_id");
};

export const down = (pgm) => {
  pgm.dropColumn("todos", "user_id");
  pgm.dropTable("users");
};
