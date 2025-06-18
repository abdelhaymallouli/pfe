import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface Event {
  id_event: string;
  title: string;
  description: string;
  date: string;
  location: string;
  budget: number;
  status: string;
  expected_guests: number;
  client_name: string;
  type_name: string;
}

export const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=getEvents', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch events: ${response.statusText}`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        toast.error(data.message || 'Failed to load events');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Planned':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm(`Are you sure you want to delete event ${eventId}?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=deleteEvent&id_event=${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Event deleted successfully');
        fetchEvents();
      } else {
        toast.error(data.message || 'Failed to delete event');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading Events...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex items-center mb-6">
          <Link to="/admin/dashboard" className="mr-4">
            <Button variant="outline" leftIcon={<ArrowLeft size={20} />}>
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
                <p className="mt-1 text-sm text-gray-500">Manage all events on the platform</p>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" onClick={fetchEvents} leftIcon={<RefreshCw size={16} />}>
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search events by title, description, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvents.length === 0 ? (
              <p className="text-center text-gray-500">No events found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.map((event) => (
                      <tr key={event.id_event}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.budget} $</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.expected_guests}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.type_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.client_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id_event)}
                            leftIcon={<Trash2 size={16} />}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};