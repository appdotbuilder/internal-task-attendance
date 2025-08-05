
import { db } from '../db';
import { attachmentsTable } from '../db/schema';
import { type GetAttachmentsByTaskInput, type Attachment } from '../schema';
import { eq } from 'drizzle-orm';

export const getAttachmentsByTask = async (input: GetAttachmentsByTaskInput): Promise<Attachment[]> => {
  try {
    const results = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.task_id, input.task_id))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get attachments by task:', error);
    throw error;
  }
};
