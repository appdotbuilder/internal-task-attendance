
import { z } from 'zod';

// Task schema
export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Task = z.infer<typeof taskSchema>;

// Attachment schema
export const attachmentSchema = z.object({
  id: z.number(),
  task_id: z.number(),
  filename: z.string(),
  original_name: z.string(),
  file_size: z.number(),
  mime_type: z.string(),
  created_at: z.coerce.date()
});

export type Attachment = z.infer<typeof attachmentSchema>;

// Input schema for creating tasks
export const createTaskInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.coerce.date().nullable()
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

// Input schema for updating tasks
export const updateTaskInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.coerce.date().nullable().optional()
});

export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

// Input schema for creating attachments
export const createAttachmentInputSchema = z.object({
  task_id: z.number(),
  filename: z.string(),
  original_name: z.string(),
  file_size: z.number().positive(),
  mime_type: z.string()
});

export type CreateAttachmentInput = z.infer<typeof createAttachmentInputSchema>;

// Schema for deleting tasks
export const deleteTaskInputSchema = z.object({
  id: z.number()
});

export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>;

// Schema for deleting attachments
export const deleteAttachmentInputSchema = z.object({
  id: z.number()
});

export type DeleteAttachmentInput = z.infer<typeof deleteAttachmentInputSchema>;

// Schema for getting task by ID
export const getTaskInputSchema = z.object({
  id: z.number()
});

export type GetTaskInput = z.infer<typeof getTaskInputSchema>;

// Schema for getting attachments by task ID
export const getAttachmentsByTaskInputSchema = z.object({
  task_id: z.number()
});

export type GetAttachmentsByTaskInput = z.infer<typeof getAttachmentsByTaskInputSchema>;
