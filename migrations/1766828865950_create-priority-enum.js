export const up = (pgm) => {
  // Create enum type
  pgm.createType("priority_level", ["low", "medium", "high", "urgent"]);

  // Add column using the enum
  pgm.addColumn("todos", {
    priority: {
      type: "priority_level",
      notNull: true,
      default: "medium",
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumn("todos", "priority");
  pgm.dropType("priority_level");
};
