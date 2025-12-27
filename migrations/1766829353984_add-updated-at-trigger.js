export const up = (pgm) => {
  // Add updated_at column
  pgm.addColumn("todos", {
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create function to update timestamp
  pgm.createFunction(
    "update_updated_at_column",
    [],
    {
      returns: "trigger",
      language: "plpgsql",
      replace: true,
    },
    `
    BEGIN
      NEW.updated_at = current_timestamp;
      RETURN NEW;
    END;
    `
  );

  // Create trigger
  pgm.createTrigger("todos", "update_todos_updated_at", {
    when: "BEFORE",
    operation: "UPDATE",
    function: "update_updated_at_column",
    level: "ROW",
  });
};

export const down = (pgm) => {
  pgm.dropTrigger("todos", "update_todos_updated_at");
  pgm.dropFunction("update_updated_at_column", []);
  pgm.dropColumn("todos", "updated_at");
};
