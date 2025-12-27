/*
 * Migration: Add color to todos
 * Description: Add a column named "color" in todos table.
 * Created: 2025-12-27T11:27:33.320Z
 */

export const up = (pgm) => {
  // TODO: Write your migration here
  pgm.addColumn("todos", {
    color: {
      type: "varchar(20)",
      default: "blue",
    },
  });
};

export const down = (pgm) => {
  // TODO: Write rollback logic here
  pgm.dropColumn("todos", "color");
};
