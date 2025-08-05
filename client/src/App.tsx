
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { TaskForm } from '@/components/TaskForm';
import { TaskCard } from '@/components/TaskCard';
import { AttachmentManager } from '@/components/AttachmentManager';
// Using type-only import for better TypeScript compliance
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../server/src/schema';

function App() {
  // Explicit typing with Task interface
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // useCallback to memoize function used in useEffect
  const loadTasks = useCallback(async () => {
    try {
      const result = await trpc.getTasks.query();
      setTasks(result);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, []); // Empty deps since trpc is stable

  // useEffect with proper dependencies
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (taskData: CreateTaskInput) => {
    setIsLoading(true);
    try {
      const newTask = await trpc.createTask.mutate(taskData);
      // Update tasks list with explicit typing in setState callback
      setTasks((prev: Task[]) => [newTask, ...prev]);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (taskData: UpdateTaskInput) => {
    try {
      const updatedTask = await trpc.updateTask.mutate(taskData);
      // Handle the case where updateTask returns null
      if (updatedTask) {
        setTasks((prev: Task[]) => 
          prev.map((task: Task) => task.id === updatedTask.id ? updatedTask : task)
        );
        setSelectedTask(updatedTask);
      } else {
        console.error('Task not found for update');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await trpc.deleteTask.mutate({ id: taskId });
      setTasks((prev: Task[]) => prev.filter((task: Task) => task.id !== taskId));
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter tasks based on status and priority
  const filteredTasks = tasks.filter((task: Task) => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Task Manager</h1>
            <p className="text-gray-600 mt-1">Organize your work efficiently</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                ✨ Create New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm onSubmit={handleCreateTask} isLoading={isLoading} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter" className="text-sm font-medium">Status:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]" id="status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="priority-filter" className="text-sm font-medium">Priority:</Label>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]" id="priority-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-gray-500 flex items-center ml-auto">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks List */}
          <div className="lg:col-span-2">
            {filteredTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600 mb-4">
                  {tasks.length === 0 
                    ? "Create your first task to get started!" 
                    : "Try adjusting your filters to see more tasks."}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task: Task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSelect={setSelectedTask}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    isSelected={selectedTask?.id === task.id}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Task Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedTask ? (
              <Card className="sticky top-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">Task Details</span>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(selectedTask.priority)}>
                        {selectedTask.priority}
                      </Badge>
                      <Badge className={getStatusColor(selectedTask.status)}>
                        {selectedTask.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedTask.title}</h3>
                    {selectedTask.description && (
                      <p className="text-gray-600 text-sm mb-4">{selectedTask.description}</p>
                    )}
                  </div>

                  {selectedTask.due_date && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedTask.due_date.toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Created</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedTask.created_at.toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedTask.updated_at.toLocaleDateString()}
                    </p>
                  </div>

                  {/* Attachments */}
                  <div className="pt-4 border-t">
                    <AttachmentManager taskId={selectedTask.id} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center sticky top-6">
                <div className="text-4xl mb-4">👆</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a task</h3>
                <p className="text-gray-600">
                  Click on any task to view its details and manage attachments.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
