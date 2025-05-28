import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, FileText, User, ArrowLeft } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import toast from 'react-hot-toast';

const taskSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'completed', 'overdue']),
  category: z.string().min(1, 'Category is required'),
  assignedTo: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export const TaskForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get('eventId') || '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      eventId,
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending',
      category: '',
      assignedTo: '',
    }
  });

  const onSubmit = async (data: TaskFormValues) => {
    try {
      const response = await fetch('http://localhost:8000/pfe/backend/src/api/tasks.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          dueDate: new Date(data.dueDate).toISOString().split('T')[0] // Format date to YYYY-MM-DD
        })
      });
      const text = await response.text();
      console.log('Raw API response:', text); // Debug log
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);
      const result = JSON.parse(text);
      if (!result.success) throw new Error(result.message || 'Failed to create task');
      toast.success('Task created successfully');
      navigate(`/tasks${eventId ? `?eventId=${eventId}` : ''}`);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate(`/tasks${eventId ? `?eventId=${eventId}` : ''}`)}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Tasks
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">Add Task</h1>
          <p className="text-sm text-gray-500">
            Add a new task to {eventId ? `Event #${eventId}` : 'your event'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('eventId')} />
            <input type="hidden" {...register('status')} />

            <Input
              label="Task Title"
              placeholder="e.g., Book venue for ceremony"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Due Date"
                type="datetime-local"
                leftIcon={<Calendar size={18} />}
                error={errors.dueDate?.message}
                {...register('dueDate')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  {...register('priority')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-error-600">{errors.priority.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Category"
                placeholder="e.g., Venue, Catering, Decoration"
                error={errors.category?.message}
                {...register('category')}
              />

              <Input
                label="Assigned To (optional)"
                placeholder="e.g., John Smith"
                leftIcon={<User size={18} />}
                error={errors.assignedTo?.message}
                {...register('assignedTo')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                rows={4}
                placeholder="Add any additional details about this task"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/tasks${eventId ? `?eventId=${eventId}` : ''}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
              >
                Add Task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};