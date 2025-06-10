import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, PlusCircle, Edit, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';

interface Event {
  id_event: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  budget: number;
  // Add other event properties as needed
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        toast.error(data.message || 'Failed to load events');
      }
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error(error.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditEvent = (eventId: string) => {
    // Implement edit functionality
    toast.info(`Edit event with ID: ${eventId}`);
    console.log('Edit event', eventId);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm(`Are you sure you want to delete event ${eventId}?`)) {
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=deleteEvent&id_event=${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Event deleted successfully');
        fetchEvents(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to delete event');
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error(error.message || 'Failed to delete event');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading Events...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Button leftIcon={<PlusCircle size={20} />}>Add New Event</Button>
              <Button variant="outline" onClick={fetchEvents} leftIcon={<RefreshCw size={16} />}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search events by title or description..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map(event => (
                    <tr key={event.id_event}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.event_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleEditEvent(event.id_event)} leftIcon={<Edit size={16} />}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id_event)} leftIcon={<Trash2 size={16} />} className="text-red-600 hover:text-red-900">
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
  );
};

