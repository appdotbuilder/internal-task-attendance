
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable, attachmentsTable } from '../db/schema';
import { type DeleteTaskInput, type CreateTaskInput, type CreateAttachmentInput } from '../schema';
import { deleteTask } from '../handlers/delete_task';
import { eq } from 'drizzle-orm';

const testTaskInput: CreateTaskInput = {
  title: 'Test Task',
  description: 'A task for testing deletion',
  status: 'pending',
  priority: 'medium',
  due_date: null
};

const testAttachmentInput: CreateAttachmentInput = {
  task_id: 1, // Will be updated after task creation
  filename: 'test-file.pdf',
  original_name: 'Test File.pdf',
  file_size: 1024,
  mime_type: 'application/pdf'
};

describe('deleteTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing task', async () => {
    // Create a test task first
    const [createdTask] = await db.insert(tasksTable)
      .values({
        title: testTaskInput.title,
        description: testTaskInput.description,
        status: testTaskInput.status,
        priority: testTaskInput.priority,
        due_date: testTaskInput.due_date
      })
      .returning()
      .execute();

    const deleteInput: DeleteTaskInput = {
      id: createdTask.id
    };

    // Delete the task
    const result = await deleteTask(deleteInput);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify task is deleted from database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(tasks).toHaveLength(0);
  });

  it('should return false when deleting non-existent task', async () => {
    const deleteInput: DeleteTaskInput = {
      id: 999 // Non-existent ID
    };

    // Delete non-existent task
    const result = await deleteTask(deleteInput);

    // Should return false for non-existent task
    expect(result).toBe(false);
  });

  it('should cascade delete attachments when task is deleted', async () => {
    // Create a test task first
    const [createdTask] = await db.insert(tasksTable)
      .values({
        title: testTaskInput.title,
        description: testTaskInput.description,
        status: testTaskInput.status,
        priority: testTaskInput.priority,
        due_date: testTaskInput.due_date
      })
      .returning()
      .execute();

    // Create an attachment for the task
    const attachmentInput = {
      ...testAttachmentInput,
      task_id: createdTask.id
    };

    await db.insert(attachmentsTable)
      .values(attachmentInput)
      .execute();

    // Verify attachment exists
    const attachmentsBefore = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.task_id, createdTask.id))
      .execute();

    expect(attachmentsBefore).toHaveLength(1);

    const deleteInput: DeleteTaskInput = {
      id: createdTask.id
    };

    // Delete the task
    const result = await deleteTask(deleteInput);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify task is deleted
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(tasks).toHaveLength(0);

    // Verify attachments are cascade deleted
    const attachmentsAfter = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.task_id, createdTask.id))
      .execute();

    expect(attachmentsAfter).toHaveLength(0);
  });
});
