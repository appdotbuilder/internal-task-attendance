
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskInput, type Task } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTask = async (input: UpdateTaskInput): Promise<Task | null> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof tasksTable.$inferInsert> = {
      updated_at: new Date() // Always update the timestamp
    };

    // Only include fields that are actually provided in the input
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.priority !== undefined) {
      updateData.priority = input.priority;
    }
    if (input.due_date !== undefined) {
      updateData.due_date = input.due_date;
    }

    // Update the task and return the updated record
    const result = await db.update(tasksTable)
      .set(updateData)
      .where(eq(tasksTable.id, input.id))
      .returning()
      .execute();

    // Return null if no task was found/updated
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Task update failed:', error);
    throw error;
  }
};
