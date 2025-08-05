
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskInput, type CreateTaskInput } from '../schema';
import { updateTask } from '../handlers/update_task';
import { eq } from 'drizzle-orm';

// Helper function to create a task for testing
const createTestTask = async (input: CreateTaskInput) => {
  const result = await db.insert(tasksTable)
    .values({
      title: input.title,
      description: input.description,
      status: input.status || 'pending',
      priority: input.priority || 'medium',
      due_date: input.due_date
    })
    .returning()
    .execute();

  return result[0];
};

describe('updateTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a task with all fields', async () => {
    // Create a task first
    const createInput: CreateTaskInput = {
      title: 'Original Task',
      description: 'Original description',
      status: 'pending',
      priority: 'low',
      due_date: new Date('2024-01-01')
    };
    const createdTask = await createTestTask(createInput);

    // Update the task
    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      title: 'Updated Task',
      description: 'Updated description',
      status: 'in_progress',
      priority: 'high',
      due_date: new Date('2024-12-31')
    };

    const result = await updateTask(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toBe(createdTask.id);
    expect(result!.title).toBe('Updated Task');
    expect(result!.description).toBe('Updated description');
    expect(result!.status).toBe('in_progress');
    expect(result!.priority).toBe('high');
    expect(result!.due_date).toEqual(new Date('2024-12-31'));
    expect(result!.created_at).toEqual(createdTask.created_at);
    expect(result!.updated_at).not.toEqual(createdTask.updated_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    // Create a task first
    const createInput: CreateTaskInput = {
      title: 'Original Task',
      description: 'Original description',
      status: 'pending',
      priority: 'low',
      due_date: new Date('2024-01-01')
    };
    const createdTask = await createTestTask(createInput);

    // Update only title and status
    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      title: 'Updated Title Only',
      status: 'completed'
    };

    const result = await updateTask(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toBe(createdTask.id);
    expect(result!.title).toBe('Updated Title Only');
    expect(result!.description).toBe('Original description'); // Unchanged
    expect(result!.status).toBe('completed');
    expect(result!.priority).toBe('low'); // Unchanged
    expect(result!.due_date).toEqual(new Date('2024-01-01')); // Unchanged
    expect(result!.updated_at).not.toEqual(createdTask.updated_at);
  });

  it('should handle nullable fields correctly', async () => {
    // Create a task with nullable fields
    const createInput: CreateTaskInput = {
      title: 'Task with nulls',
      description: 'Has description',
      status: 'pending',
      priority: 'medium',
      due_date: new Date('2024-06-01')
    };
    const createdTask = await createTestTask(createInput);

    // Update to set nullable fields to null
    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      description: null,
      due_date: null
    };

    const result = await updateTask(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toBe(createdTask.id);
    expect(result!.title).toBe('Task with nulls'); // Unchanged
    expect(result!.description).toBeNull();
    expect(result!.status).toBe('pending'); // Unchanged
    expect(result!.priority).toBe('medium'); // Unchanged
    expect(result!.due_date).toBeNull();
    expect(result!.updated_at).not.toEqual(createdTask.updated_at);
  });

  it('should return null for non-existent task', async () => {
    const updateInput: UpdateTaskInput = {
      id: 99999,
      title: 'Non-existent task'
    };

    const result = await updateTask(updateInput);

    expect(result).toBeNull();
  });

  it('should save updated task to database', async () => {
    // Create a task first
    const createInput: CreateTaskInput = {
      title: 'Database Test Task',
      description: 'For testing database update',
      status: 'pending',
      priority: 'medium',
      due_date: null
    };
    const createdTask = await createTestTask(createInput);

    // Update the task
    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      title: 'Updated Database Task',
      status: 'completed',
      priority: 'high'
    };

    await updateTask(updateInput);

    // Verify the update was saved to database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Updated Database Task');
    expect(tasks[0].description).toBe('For testing database update'); // Unchanged
    expect(tasks[0].status).toBe('completed');
    expect(tasks[0].priority).toBe('high');
    expect(tasks[0].due_date).toBeNull(); // Unchanged
    expect(tasks[0].updated_at).toBeInstanceOf(Date);
    expect(tasks[0].updated_at).not.toEqual(createdTask.updated_at);
  });

  it('should always update the updated_at timestamp', async () => {
    // Create a task first
    const createInput: CreateTaskInput = {
      title: 'Timestamp Test',
      description: null,
      status: 'pending',
      priority: 'low',
      due_date: null
    };
    const createdTask = await createTestTask(createInput);

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update with minimal change
    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      priority: 'medium'
    };

    const result = await updateTask(updateInput);

    expect(result).toBeDefined();
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(createdTask.updated_at.getTime());
  });
});
