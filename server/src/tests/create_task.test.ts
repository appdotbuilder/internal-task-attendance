
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput } from '../schema';
import { createTask } from '../handlers/create_task';
import { eq } from 'drizzle-orm';

// Test inputs
const basicTaskInput: CreateTaskInput = {
  title: 'Test Task',
  description: 'A task for testing',
  status: 'pending',
  priority: 'medium',
  due_date: null
};

const taskWithDueDateInput: CreateTaskInput = {
  title: 'Task with Due Date',
  description: 'Task with a specific due date',
  status: 'in_progress',
  priority: 'high',
  due_date: new Date('2024-12-31')
};

describe('createTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a task with basic information', async () => {
    const result = await createTask(basicTaskInput);

    // Basic field validation
    expect(result.title).toEqual('Test Task');
    expect(result.description).toEqual('A task for testing');
    expect(result.status).toEqual('pending');
    expect(result.priority).toEqual('medium');
    expect(result.due_date).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a task with due date', async () => {
    const result = await createTask(taskWithDueDateInput);

    expect(result.title).toEqual('Task with Due Date');
    expect(result.status).toEqual('in_progress');
    expect(result.priority).toEqual('high');
    expect(result.due_date).toBeInstanceOf(Date);
    expect(result.due_date?.toISOString()).toEqual('2024-12-31T00:00:00.000Z');
  });

  it('should save task to database', async () => {
    const result = await createTask(basicTaskInput);

    // Query using proper drizzle syntax
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, result.id))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toEqual('Test Task');
    expect(tasks[0].description).toEqual('A task for testing');
    expect(tasks[0].status).toEqual('pending');
    expect(tasks[0].priority).toEqual('medium');
    expect(tasks[0].created_at).toBeInstanceOf(Date);
    expect(tasks[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null description', async () => {
    const inputWithNullDesc: CreateTaskInput = {
      title: 'Task without description',
      description: null,
      status: 'completed',
      priority: 'low',
      due_date: null
    };

    const result = await createTask(inputWithNullDesc);

    expect(result.description).toBeNull();
    expect(result.title).toEqual('Task without description');
    expect(result.status).toEqual('completed');
    expect(result.priority).toEqual('low');
  });

  it('should handle minimal input with defaults', async () => {
    const minimalInput: CreateTaskInput = {
      title: 'Minimal Task',
      description: null,
      status: 'pending',
      priority: 'medium',
      due_date: null
    };

    const result = await createTask(minimalInput);

    expect(result.title).toEqual('Minimal Task');
    expect(result.status).toEqual('pending');
    expect(result.priority).toEqual('medium');
    expect(result.description).toBeNull();
    expect(result.due_date).toBeNull();
  });
});
