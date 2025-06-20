import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface Event {
  id: number;
  id_client: number;
  title: string;
  type: string;
  id_type: number;
  event_date: string;
  location: string;
  description: string;
  status: 'Planned' | 'Ongoing' | 'Completed' | 'Cancelled';
  expected_guests: number;
  budget: number;
  banner_image?: string;
}

interface EventType {
  id_type: number;
  type_name: string;
}

export const EventList = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      setError('You must be logged in to view events.');
      setLoading(false);
      return;
    }

    const fetchEventTypes = async () => {
      try {
        const response = await fetch('http://localhost/pfe/backend/src/api/types.php');
        const text = await response.text();
        if (!response.ok) throw new Error('Failed to fetch event types');
        const data = JSON.parse(text);
        if (data.success && Array.isArray(data.data)) {
          setEventTypes(data.data);
        } else {
          throw new Error('Invalid event types response structure');
        }
      } catch (err) {
        console.error('Error fetching event types:', err);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost/pfe/backend/src/api/events.php?id_client=${currentUser.id}`);
        const text = await response.text();
        console.log('Raw response:', text);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = JSON.parse(text);
        console.log('Parsed data:', data);
        if (data.success && Array.isArray(data.data)) {
          setEvents(data.data);
        } else {
          throw new Error('Invalid response structure');
        }
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
        setLoading(false);
      }

    };

    fetchEventTypes();
    fetchEvents();
  }, [currentUser]);

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || event.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planned':
        return 'primary';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center py-10 text-red-600">Error: {error}</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your upcoming events in one place
          </p>
        </div>
        <Link to="/events/new">
          <Button leftIcon={<PlusCircle size={20} />}>Create Event</Button>
        </Link>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search events..."
            leftIcon={<Search size={20} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {eventTypes.map((type) => (
              <option key={type.id_type} value={type.type_name}>
                {type.type_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <Card isPressable isHoverable className="h-full">
                <div className="h-48 relative">
                  <img
                    src={event.banner_image || '/default-image.jpg'}
                    alt={event.title}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                  <Badge
                    variant={getStatusColor(event.status)}
                    className="absolute top-4 right-4"
                  >
                    {event.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      {formatDate(event.event_date, 'PPP')}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-2" />
                      {event.expected_guests} guests
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                    View details
                    <ChevronRight size={16} className="ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};