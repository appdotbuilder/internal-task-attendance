
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable, attachmentsTable } from '../db/schema';
import { type CreateTaskInput, type CreateAttachmentInput, type GetAttachmentsByTaskInput } from '../schema';
import { getAttachmentsByTask } from '../handlers/get_attachments_by_task';

// Test data
const testTaskInput: CreateTaskInput = {
  title: 'Test Task',
  description: 'A task for testing attachments',
  status: 'pending',
  priority: 'medium',
  due_date: null
};

const testAttachmentInput: CreateAttachmentInput = {
  task_id: 0, // Will be set after task creation
  filename: 'test-file.pdf',
  original_name: 'Test Document.pdf',
  file_size: 1024,
  mime_type: 'application/pdf'
};

describe('getAttachmentsByTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when task has no attachments', async () => {
    // Create a task first
    const taskResult = await db.insert(tasksTable)
      .values({
        title: testTaskInput.title,
        description: testTaskInput.description,
        status: testTaskInput.status,
        priority: testTaskInput.priority,
        due_date: testTaskInput.due_date
      })
      .returning()
      .execute();

    const task = taskResult[0];
    const input: GetAttachmentsByTaskInput = { task_id: task.id };

    const result = await getAttachmentsByTask(input);

    expect(result).toEqual([]);
  });

  it('should return all attachments for a task', async () => {
    // Create a task first
    const taskResult = await db.insert(tasksTable)
      .values({
        title: testTaskInput.title,
        description: testTaskInput.description,
        status: testTaskInput.status,
        priority: testTaskInput.priority,
        due_date: testTaskInput.due_date
      })
      .returning()
      .execute();

    const task = taskResult[0];

    // Create multiple attachments for the task
    const attachment1 = { ...testAttachmentInput, task_id: task.id };
    const attachment2 = {
      ...testAttachmentInput,
      task_id: task.id,
      filename: 'test-image.jpg',
      original_name: 'Test Image.jpg',
      file_size: 2048,
      mime_type: 'image/jpeg'
    };

    await db.insert(attachmentsTable)
      .values([attachment1, attachment2])
      .execute();

    const input: GetAttachmentsByTaskInput = { task_id: task.id };
    const result = await getAttachmentsByTask(input);

    expect(result).toHaveLength(2);
    expect(result[0].task_id).toEqual(task.id);
    expect(result[1].task_id).toEqual(task.id);
    expect(result[0].filename).toEqual('test-file.pdf');
    expect(result[1].filename).toEqual('test-image.jpg');
    expect(result[0].original_name).toEqual('Test Document.pdf');
    expect(result[1].original_name).toEqual('Test Image.jpg');
    expect(result[0].file_size).toEqual(1024);
    expect(result[1].file_size).toEqual(2048);
    expect(result[0].mime_type).toEqual('application/pdf');
    expect(result[1].mime_type).toEqual('image/jpeg');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should only return attachments for the specified task', async () => {
    // Create two tasks
    const task1Result = await db.insert(tasksTable)
      .values({
        title: 'Task 1',
        description: 'First task',
        status: 'pending',
        priority: 'medium',
        due_date: null
      })
      .returning()
      .execute();

    const task2Result = await db.insert(tasksTable)
      .values({
        title: 'Task 2',
        description: 'Second task', 
        status: 'pending',
        priority: 'medium',
        due_date: null
      })
      .returning()
      .execute();

    const task1 = task1Result[0];
    const task2 = task2Result[0];

    // Create attachments for both tasks
    const attachment1 = { ...testAttachmentInput, task_id: task1.id };
    const attachment2 = { ...testAttachmentInput, task_id: task2.id, filename: 'task2-file.pdf' };

    await db.insert(attachmentsTable)
      .values([attachment1, attachment2])
      .execute();

    // Query attachments for task1 only
    const input: GetAttachmentsByTaskInput = { task_id: task1.id };
    const result = await getAttachmentsByTask(input);

    expect(result).toHaveLength(1);
    expect(result[0].task_id).toEqual(task1.id);
    expect(result[0].filename).toEqual('test-file.pdf');
  });

  it('should return empty array for non-existent task', async () => {
    const input: GetAttachmentsByTaskInput = { task_id: 999 };
    const result = await getAttachmentsByTask(input);

    expect(result).toEqual([]);
  });
});
