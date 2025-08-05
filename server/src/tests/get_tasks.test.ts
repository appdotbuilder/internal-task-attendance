
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { getTasks } from '../handlers/get_tasks';

describe('getTasks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no tasks exist', async () => {
    const result = await getTasks();
    expect(result).toEqual([]);
  });

  it('should return all tasks', async () => {
    // Create test tasks
    await db.insert(tasksTable)
      .values([
        {
          title: 'Task 1',
          description: 'First task',
          status: 'pending',
          priority: 'high',
          due_date: new Date('2024-12-31')
        },
        {
          title: 'Task 2',
          description: null,
          status: 'in_progress',
          priority: 'medium',
          due_date: null
        },
        {
          title: 'Task 3',
          description: 'Third task',
          status: 'completed',
          priority: 'low',
          due_date: new Date('2024-11-15')
        }
      ])
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(3);
    
    // Verify first task
    expect(result[0].title).toEqual('Task 1');
    expect(result[0].description).toEqual('First task');
    expect(result[0].status).toEqual('pending');
    expect(result[0].priority).toEqual('high');
    expect(result[0].due_date).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Verify second task (with null values)
    expect(result[1].title).toEqual('Task 2');
    expect(result[1].description).toBeNull();
    expect(result[1].status).toEqual('in_progress');
    expect(result[1].priority).toEqual('medium');
    expect(result[1].due_date).toBeNull();

    // Verify third task
    expect(result[2].title).toEqual('Task 3');
    expect(result[2].description).toEqual('Third task');
    expect(result[2].status).toEqual('completed');
    expect(result[2].priority).toEqual('low');
    expect(result[2].due_date).toBeInstanceOf(Date);
  });

  it('should return tasks in database insertion order', async () => {
    // Create tasks in specific order
    const taskData = [
      { title: 'Alpha Task', status: 'pending' as const, priority: 'high' as const },
      { title: 'Beta Task', status: 'completed' as const, priority: 'low' as const },
      { title: 'Gamma Task', status: 'in_progress' as const, priority: 'medium' as const }
    ];

    for (const task of taskData) {
      await db.insert(tasksTable)
        .values(task)
        .execute();
    }

    const result = await getTasks();

    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('Alpha Task');
    expect(result[1].title).toEqual('Beta Task');
    expect(result[2].title).toEqual('Gamma Task');
  });
});
