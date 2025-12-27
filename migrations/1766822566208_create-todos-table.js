
export const up = (pgm) => {
  pgm.createTable("todos", {
    id: "id", // shorthand for serial primary key
    task: { type: "varchar(255)", notNull: true },
    completed: { type: "boolean", notNull: true, default: false },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};


export const down = (pgm) => {
  pgm.dropTable("todos");
};
