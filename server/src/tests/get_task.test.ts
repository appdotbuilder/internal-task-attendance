
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type GetTaskInput, type CreateTaskInput } from '../schema';
import { getTask } from '../handlers/get_task';

// Test input
const testTaskInput: CreateTaskInput = {
  title: 'Test Task',
  description: 'A task for testing',
  status: 'pending',
  priority: 'high',
  due_date: new Date('2024-12-31')
};

describe('getTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a task when found', async () => {
    // Create a test task first
    const createdTask = await db.insert(tasksTable)
      .values({
        title: testTaskInput.title,
        description: testTaskInput.description,
        status: testTaskInput.status,
        priority: testTaskInput.priority,
        due_date: testTaskInput.due_date
      })
      .returning()
      .execute();

    const taskId = createdTask[0].id;
    const input: GetTaskInput = { id: taskId };

    const result = await getTask(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(taskId);
    expect(result!.title).toEqual('Test Task');
    expect(result!.description).toEqual('A task for testing');
    expect(result!.status).toEqual('pending');
    expect(result!.priority).toEqual('high');
    expect(result!.due_date).toBeInstanceOf(Date);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when task not found', async () => {
    const input: GetTaskInput = { id: 999 };

    const result = await getTask(input);

    expect(result).toBeNull();
  });

  it('should handle task with null values correctly', async () => {
    // Create a task with null description and due_date
    const minimalTask = await db.insert(tasksTable)
      .values({
        title: 'Minimal Task',
        description: null,
        status: 'pending',
        priority: 'medium',
        due_date: null
      })
      .returning()
      .execute();

    const taskId = minimalTask[0].id;
    const input: GetTaskInput = { id: taskId };

    const result = await getTask(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(taskId);
    expect(result!.title).toEqual('Minimal Task');
    expect(result!.description).toBeNull();
    expect(result!.due_date).toBeNull();
    expect(result!.status).toEqual('pending');
    expect(result!.priority).toEqual('medium');
  });
});
