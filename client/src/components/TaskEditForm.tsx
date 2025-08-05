
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import type { Task, UpdateTaskInput } from '../../../server/src/schema';

interface TaskEditFormProps {
  task: Task;
  onSubmit: (data: UpdateTaskInput) => Promise<void>;
  isLoading?: boolean;
}

export function TaskEditForm({ task, onSubmit, isLoading = false }: TaskEditFormProps) {
  const [formData, setFormData] = useState<UpdateTaskInput>({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev: UpdateTaskInput) => ({
      ...prev,
      due_date: value ? new Date(value) : null
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-title">Task Title *</Label>
        <Input
          id="edit-title"
          value={formData.title || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: UpdateTaskInput) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Enter task title..."
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: UpdateTaskInput) => ({
              ...prev,
              description: e.target.value || null
            }))
          }
          placeholder="Enter task description..."
          className="min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-status">Status</Label>
          <Select
            value={formData.status || 'pending'}
            onValueChange={(value: 'pending' | 'in_progress' | 'completed') =>
              setFormData((prev: UpdateTaskInput) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger id="edit-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-priority">Priority</Label>
          <Select
            value={formData.priority || 'medium'}
            onValueChange={(value: 'low' | 'medium' | 'high') =>
              setFormData((prev: UpdateTaskInput) => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger id="edit-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="edit-due-date">Due Date</Label>
        <Input
          id="edit-due-date"
          type="date"
          value={formData.due_date ? formData.due_date.toISOString().split('T')[0] : ''}
          onChange={handleDateChange}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Updating...' : 'Update Task'}
      </Button>
    </form>
  );
}
