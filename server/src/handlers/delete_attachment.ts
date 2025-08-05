
import { db } from '../db';
import { attachmentsTable } from '../db/schema';
import { type DeleteAttachmentInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteAttachment = async (input: DeleteAttachmentInput): Promise<boolean> => {
  try {
    // Delete the attachment record
    const result = await db.delete(attachmentsTable)
      .where(eq(attachmentsTable.id, input.id))
      .returning()
      .execute();

    // Return true if a record was deleted, false if not found
    return result.length > 0;
  } catch (error) {
    console.error('Attachment deletion failed:', error);
    throw error;
  }
};
