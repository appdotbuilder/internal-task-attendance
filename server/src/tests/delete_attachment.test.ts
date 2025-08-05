
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable, attachmentsTable } from '../db/schema';
import { type CreateTaskInput, type CreateAttachmentInput, type DeleteAttachmentInput } from '../schema';
import { deleteAttachment } from '../handlers/delete_attachment';
import { eq } from 'drizzle-orm';

// Test task data
const testTask: CreateTaskInput = {
  title: 'Test Task',
  description: 'A task for testing',
  status: 'pending',
  priority: 'medium',
  due_date: null
};

// Test attachment data
const testAttachment: CreateAttachmentInput = {
  task_id: 1,
  filename: 'test_file.pdf',
  original_name: 'Original Test File.pdf',
  file_size: 2048,
  mime_type: 'application/pdf'
};

describe('deleteAttachment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing attachment', async () => {
    // Create task first
    const taskResult = await db.insert(tasksTable)
      .values({
        title: testTask.title,
        description: testTask.description,
        status: testTask.status,
        priority: testTask.priority,
        due_date: testTask.due_date
      })
      .returning()
      .execute();

    const taskId = taskResult[0].id;

    // Create attachment
    const attachmentResult = await db.insert(attachmentsTable)
      .values({
        task_id: taskId,
        filename: testAttachment.filename,
        original_name: testAttachment.original_name,
        file_size: testAttachment.file_size,
        mime_type: testAttachment.mime_type
      })
      .returning()
      .execute();

    const attachmentId = attachmentResult[0].id;

    // Delete the attachment
    const input: DeleteAttachmentInput = { id: attachmentId };
    const result = await deleteAttachment(input);

    expect(result).toBe(true);

    // Verify attachment is deleted from database
    const attachments = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.id, attachmentId))
      .execute();

    expect(attachments).toHaveLength(0);
  });

  it('should return false when attachment does not exist', async () => {
    const input: DeleteAttachmentInput = { id: 999 };
    const result = await deleteAttachment(input);

    expect(result).toBe(false);
  });

  it('should not affect other attachments when deleting one', async () => {
    // Create task first
    const taskResult = await db.insert(tasksTable)
      .values({
        title: testTask.title,
        description: testTask.description,
        status: testTask.status,
        priority: testTask.priority,
        due_date: testTask.due_date
      })
      .returning()
      .execute();

    const taskId = taskResult[0].id;

    // Create two attachments
    const attachment1Result = await db.insert(attachmentsTable)
      .values({
        task_id: taskId,
        filename: 'file1.pdf',
        original_name: 'File 1.pdf',
        file_size: 1024,
        mime_type: 'application/pdf'
      })
      .returning()
      .execute();

    const attachment2Result = await db.insert(attachmentsTable)
      .values({
        task_id: taskId,
        filename: 'file2.pdf',
        original_name: 'File 2.pdf',
        file_size: 2048,
        mime_type: 'application/pdf'
      })
      .returning()
      .execute();

    const attachment1Id = attachment1Result[0].id;
    const attachment2Id = attachment2Result[0].id;

    // Delete first attachment
    const input: DeleteAttachmentInput = { id: attachment1Id };
    const result = await deleteAttachment(input);

    expect(result).toBe(true);

    // Verify first attachment is deleted
    const deletedAttachment = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.id, attachment1Id))
      .execute();

    expect(deletedAttachment).toHaveLength(0);

    // Verify second attachment still exists
    const remainingAttachment = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.id, attachment2Id))
      .execute();

    expect(remainingAttachment).toHaveLength(1);
    expect(remainingAttachment[0].filename).toBe('file2.pdf');
  });
});
