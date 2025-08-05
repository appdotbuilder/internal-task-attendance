
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { attachmentsTable, tasksTable } from '../db/schema';
import { type CreateAttachmentInput, type CreateTaskInput } from '../schema';
import { createAttachment } from '../handlers/create_attachment';
import { eq } from 'drizzle-orm';

// Test input for creating an attachment
const testAttachmentInput: CreateAttachmentInput = {
  task_id: 1, // Will be set to actual task id in tests
  filename: 'test-file.pdf',
  original_name: 'Test Document.pdf',
  file_size: 1024,
  mime_type: 'application/pdf'
};

// Test input for creating a task (prerequisite)
const testTaskInput: CreateTaskInput = {
  title: 'Test Task',
  description: 'A task for testing attachments',
  status: 'pending',
  priority: 'medium',
  due_date: null
};

describe('createAttachment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an attachment for existing task', async () => {
    // Create prerequisite task
    const taskResult = await db.insert(tasksTable)
      .values(testTaskInput)
      .returning()
      .execute();
    const task = taskResult[0];

    // Create attachment
    const attachmentInput = { ...testAttachmentInput, task_id: task.id };
    const result = await createAttachment(attachmentInput);

    // Basic field validation
    expect(result.task_id).toEqual(task.id);
    expect(result.filename).toEqual('test-file.pdf');
    expect(result.original_name).toEqual('Test Document.pdf');
    expect(result.file_size).toEqual(1024);
    expect(result.mime_type).toEqual('application/pdf');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save attachment to database', async () => {
    // Create prerequisite task
    const taskResult = await db.insert(tasksTable)
      .values(testTaskInput)
      .returning()
      .execute();
    const task = taskResult[0];

    // Create attachment
    const attachmentInput = { ...testAttachmentInput, task_id: task.id };
    const result = await createAttachment(attachmentInput);

    // Query database to verify attachment was saved
    const attachments = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.id, result.id))
      .execute();

    expect(attachments).toHaveLength(1);
    expect(attachments[0].task_id).toEqual(task.id);
    expect(attachments[0].filename).toEqual('test-file.pdf');
    expect(attachments[0].original_name).toEqual('Test Document.pdf');
    expect(attachments[0].file_size).toEqual(1024);
    expect(attachments[0].mime_type).toEqual('application/pdf');
    expect(attachments[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when task does not exist', async () => {
    const attachmentInput = { ...testAttachmentInput, task_id: 999 };

    await expect(createAttachment(attachmentInput))
      .rejects.toThrow(/task with id 999 not found/i);
  });

  it('should create multiple attachments for same task', async () => {
    // Create prerequisite task
    const taskResult = await db.insert(tasksTable)
      .values(testTaskInput)
      .returning()
      .execute();
    const task = taskResult[0];

    // Create first attachment
    const attachment1Input = { 
      ...testAttachmentInput, 
      task_id: task.id,
      filename: 'file1.pdf',
      original_name: 'Document 1.pdf'
    };
    const result1 = await createAttachment(attachment1Input);

    // Create second attachment
    const attachment2Input = { 
      ...testAttachmentInput, 
      task_id: task.id,
      filename: 'file2.jpg',
      original_name: 'Image 2.jpg',
      mime_type: 'image/jpeg'
    };
    const result2 = await createAttachment(attachment2Input);

    // Verify both attachments exist
    const attachments = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.task_id, task.id))
      .execute();

    expect(attachments).toHaveLength(2);
    expect(attachments.find(a => a.id === result1.id)).toBeDefined();
    expect(attachments.find(a => a.id === result2.id)).toBeDefined();
  });
});
