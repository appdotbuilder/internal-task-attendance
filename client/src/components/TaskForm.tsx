
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
// Note the extra ../ because we're in components subfolder
import type { CreateTaskInput } from '../../../server/src/schema';

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  isLoading?: boolean;
}

export function TaskForm({ onSubmit, isLoading = false }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: null,
    status: 'pending',
    priority: 'medium',
    due_date: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    // Reset form after successful submission
    setFormData({
      title: '',
      description: null,
      status: 'pending',
      priority: 'medium',
      due_date: null
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev: CreateTaskInput) => ({
      ...prev,
      due_date: value ? new Date(value) : null
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateTaskInput) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Enter task title..."
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreateTaskInput) => ({
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
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status || 'pending'}
            onValueChange={(value: 'pending' | 'in_progress' | 'completed') =>
              setFormData((prev: CreateTaskInput) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger id="status">
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
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority || 'medium'}
            onValueChange={(value: 'low' | 'medium' | 'high') =>
              setFormData((prev: CreateTaskInput) => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger id="priority">
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
        <Label htmlFor="due_date">Due Date</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date ? formData.due_date.toISOString().split('T')[0] : ''}
          onChange={handleDateChange}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Task'}
      </Button>
    </form>
  );
}
