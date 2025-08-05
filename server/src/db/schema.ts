
import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high']);

// Tasks table
export const tasksTable = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'), // Nullable by default
  status: taskStatusEnum('status').notNull().default('pending'),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  due_date: timestamp('due_date'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Attachments table
export const attachmentsTable = pgTable('attachments', {
  id: serial('id').primaryKey(),
  task_id: integer('task_id').notNull().references(() => tasksTable.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  original_name: text('original_name').notNull(),
  file_size: integer('file_size').notNull(),
  mime_type: text('mime_type').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const tasksRelations = relations(tasksTable, ({ many }) => ({
  attachments: many(attachmentsTable),
}));

export const attachmentsRelations = relations(attachmentsTable, ({ one }) => ({
  task: one(tasksTable, {
    fields: [attachmentsTable.task_id],
    references: [tasksTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;
export type Attachment = typeof attachmentsTable.$inferSelect;
export type NewAttachment = typeof attachmentsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  tasks: tasksTable, 
  attachments: attachmentsTable 
};
