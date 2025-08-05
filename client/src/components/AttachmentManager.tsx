
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Attachment, CreateAttachmentInput } from '../../../server/src/schema';

interface AttachmentManagerProps {
  taskId: number;
}

export function AttachmentManager({ taskId }: AttachmentManagerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // useCallback to memoize function used in useEffect
  const loadAttachments = useCallback(async () => {
    try {
      const result = await trpc.getAttachmentsByTask.query({ task_id: taskId });
      setAttachments(result);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    }
  }, [taskId]);

  // useEffect with proper dependencies
  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      // STUB: In a real implementation, you would upload the file to a storage service
      // and get back the filename and other metadata. For now, we'll simulate this.
      const attachmentData: CreateAttachmentInput = {
        task_id: taskId,
        filename: `${Date.now()}_${selectedFile.name}`, // Simulated server filename
        original_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type || 'application/octet-stream'
      };

      const newAttachment = await trpc.createAttachment.mutate(attachmentData);
      setAttachments((prev: Attachment[]) => [newAttachment, ...prev]);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Failed to upload attachment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    try {
      await trpc.deleteAttachment.mutate({ id: attachmentId });
      setAttachments((prev: Attachment[]) => 
        prev.filter((attachment: Attachment) => attachment.id !== attachmentId)
      );
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
    return '📎';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">
          Attachments ({attachments.length})
        </Label>
      </div>

      {/* File Upload Section */}
      <div className="space-y-3 p-3 bg-gray-50 rounded-md border">
        <div>
          <Label htmlFor="file-input" className="text-xs font-medium text-gray-600">
            Add Attachment
          </Label>
          <Input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            className="mt-1 text-xs"
          />
        </div>
        
        {selectedFile && (
          <div className="flex items-center justify-between p-2 bg-white rounde-md border text-xs">
            <div className="flex items-center gap-2">
              <span>{getFileIcon(selectedFile.type)}</span>
              <span className="font-medium">{selectedFile.name}</span>
              <Badge variant="outline" className="text-xs">
                {formatFileSize(selectedFile.size)}
              </Badge>
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={isLoading}
              size="sm"
              className="h-7 px-2 text-xs"
            >
              {isLoading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length === 0 ? (
        <div className="text-center py-4 text-sm text-gray-500">
          <div className="text-2xl mb-2">📎</div>
          No attachments yet
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment: Attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-2 bg-white rounded-md border text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span>{getFileIcon(attachment.mime_type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{attachment.original_name}</div>
                  <div className="text-gray-500 flex items-center gap-2">
                    <span>{formatFileSize(attachment.file_size)}</span>
                    <span>•</span>
                    <span>{attachment.created_at.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{attachment.original_name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDelete(attachment.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
