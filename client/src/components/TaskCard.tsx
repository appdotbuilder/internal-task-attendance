
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TaskEditForm } from '@/components/TaskEditForm';
import type { Task, UpdateTaskInput } from '../../../server/src/schema';

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onUpdate: (data: UpdateTaskInput) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  isSelected: boolean;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

export function TaskCard({ 
  task, 
  onSelect, 
  onUpdate, 
  onDelete, 
  isSelected, 
  getPriorityColor, 
  getStatusColor 
}: TaskCardProps) {
  const isOverdue = task.due_date && task.due_date < new Date() && task.status !== 'completed';

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
      } ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}
      onClick={() => onSelect(task)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-gray-900 leading-6">
            {task.title}
            {isOverdue && <span className="text-red-500 ml-2">⚠️</span>}
          </CardTitle>
          <div className="flex gap-2 ml-4">
            <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
              {task.priority}
            </Badge>
            <Badge className={`${getStatusColor(task.status)} text-xs`}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {task.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {task.due_date && (
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                📅 {task.due_date.toLocaleDateString()}
              </span>
            )}
            <span>🕒 {task.created_at.toLocaleDateString()}</span>
          </div>
          
          <div className="flex gap-2" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <TaskEditForm task={task} onSubmit={onUpdate} />
              </DialogContent>
            </Dialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{task.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(task.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
