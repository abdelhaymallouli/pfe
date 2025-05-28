import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, Clock, CheckCircle2, XCircle, Search, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  category: string;
  assignedTo?: string;
}

export const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost/pfe/backend/src/api/tasks.php');
        const text = await response.text();
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = JSON.parse(text);
        if (data.success && Array.isArray(data.data)) {
          setTasks(data.data);
        } else {
          throw new Error('Invalid response');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`http://localhost/pfe/backend/src/api/tasks.php?id=${taskId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete task');
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const response = await fetch('http://localhost/pfe/backend/src/api/tasks.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update task');
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      );
      toast.success(`Task marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      return matchesSearch && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return sortDirection === 'asc'
          ? new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime()
          : new Date(b.dueDate || '9999-12-31').getTime() - new Date(a.dueDate || '9999-12-31').getTime();
      } else {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sortDirection === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      }
    });

  const toggleSort = (field: 'dueDate' | 'priority') => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'overdue': return 'error';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-success-500" />;
      case 'overdue': return <XCircle className="h-5 w-5 text-error-500" />;
      default: return <Clock className="h-5 w-5 text-warning-500" />;
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto p-4">Loading tasks...</div>;
  if (error) return <div className="max-w-7xl mx-auto p-4 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task List</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your event planning tasks</p>
        </div>
        <Link to="/tasks/new">
          <Button leftIcon={<PlusCircle size={20} />}>Add Task</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-lg bg-primary-50">
            <p className="text-sm text-primary-600 font-medium">Total Tasks</p>
            <p className="mt-2 text-3xl font-bold text-primary-700">{tasks.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-success-50">
            <p className="text-sm text-success-600 font-medium">Completed</p>
            <p className="mt-2 text-3xl font-bold text-success-700">
              {tasks.filter(t => t.status === 'completed').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-warning-50">
            <p className="text-sm text-warning-600 font-medium">Pending</p>
            <p className="mt-2 text-3xl font-bold text-warning-700">
              {tasks.filter(t => t.status === 'pending').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-error-50">
            <p className="text-sm text-error-600 font-medium">Overdue</p>
            <p className="mt-2 text-3xl font-bold text-error-700">
              {tasks.filter(t => t.status === 'overdue').length}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search tasks..."
            leftIcon={<Search size={20} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
        <div className="w-full sm:w-48">
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAndSortedTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <button className="mt-1" onClick={() => toggleTaskStatus(task.id)}>
                    {getStatusIcon(task.status)}
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="mt-1 text-gray-500">{task.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </Badge>
                      <Badge variant={getStatusColor(task.status)}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                      {task.category && (
                        <Badge variant="secondary">{task.category}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </div>
                  {task.assignedTo && (
                    <div className="mt-2 flex items-center">
                      <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-700">
                          {task.assignedTo[0]}
                        </span>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">{task.assignedTo}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <Button size="sm" variant="ghost" onClick={() => deleteTask(task.id)}>
                      <Trash2 className="h-4 w-4 text-error-500" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleTaskStatus(task.id)}>
                      <CheckCircle2 className="h-4 w-4 text-success-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};