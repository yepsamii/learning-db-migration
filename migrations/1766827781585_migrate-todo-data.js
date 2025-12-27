export const up = (pgm) => {
  // Add new column
  pgm.addColumn("todos", {
    status: { type: "varchar(20)" },
  });

  // Migrate data using SQL
  pgm.sql(`
      UPDATE todos 
      SET status = CASE 
        WHEN completed = true THEN 'done'
        ELSE 'pending'
      END
    `);

  // Make it not null after populating
  pgm.alterColumn("todos", "status", {
    notNull: true,
  });

  // Remove old column
  pgm.dropColumn("todos", "completed");
};

export const down = (pgm) => {
  pgm.addColumn("todos", {
    completed: { type: "boolean" },
  });

  pgm.sql(`
      UPDATE todos 
      SET completed = CASE 
        WHEN status = 'done' THEN true
        ELSE false
      END
    `);

  pgm.alterColumn("todos", "completed", {
    notNull: true,
    default: false,
  });

  pgm.dropColumn("todos", "status");
};
