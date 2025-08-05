
import { db } from '../db';
import { attachmentsTable, tasksTable } from '../db/schema';
import { type CreateAttachmentInput, type Attachment } from '../schema';
import { eq } from 'drizzle-orm';

export const createAttachment = async (input: CreateAttachmentInput): Promise<Attachment> => {
  try {
    // Verify that the task exists
    const existingTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, input.task_id))
      .execute();

    if (existingTask.length === 0) {
      throw new Error(`Task with id ${input.task_id} not found`);
    }

    // Insert attachment record
    const result = await db.insert(attachmentsTable)
      .values({
        task_id: input.task_id,
        filename: input.filename,
        original_name: input.original_name,
        file_size: input.file_size,
        mime_type: input.mime_type
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Attachment creation failed:', error);
    throw error;
  }
};
