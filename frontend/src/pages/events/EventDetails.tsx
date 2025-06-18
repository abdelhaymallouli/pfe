import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, Clock, CheckCircle, XCircle, CalendarCheck, ChevronDown, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/utils';

interface Event {
  id: number;
  id_client: number;
  title: string;
  type: string;
  id_type: number;
  event_date: string;
  location: string;
  description: string;
  status: 'Planned'| 'Ongoing'| 'Completed' | 'Cancelled'; 
  expected_guests: number;
  banner_image?: string; 
}

export const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

const statuses: ('Planned' | 'Ongoing' | 'Completed' | 'Cancelled')[] = ['Planned', 'Ongoing', 'Completed', 'Cancelled'];

  useEffect(() => {
  const fetchEvent = async () => {
    if (!id || isNaN(Number(id))) {
      setError('Invalid Event ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost/pfe/backend/src/api/events.php?id=${encodeURIComponent(id)}`);
      const text = await response.text();
      console.log('Raw response:', text);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('Response is not valid JSON');
      }

      console.log('Parsed data:', data);

      if (data.success && data.data) {
        setEvent({
          ...data.data,
          id: Number(data.data.id),
          id_client: Number(data.data.id_client),
          id_type: Number(data.data.id_type),
          expected_guests: Number(data.data.expected_guests),
          budget: Number(data.data.budget),
        });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  fetchEvent();
}, [id]);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'planned':
        return 'text-blue-500';
      case 'ongoing':
        return 'text-yellow-500';
      case 'completed':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'planned':
        return <CalendarCheck className="h-5 w-5" />;
      case 'ongoing':
        return <Clock className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !event) return;

    try {
      const response = await fetch(`http://localhost/pfe/backend/src/api/events.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setEvent({ ...event, status: newStatus });
        setIsStatusDropdownOpen(false);
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDeleteEvent = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`http://localhost/pfe/backend/src/api/events.php?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        navigate('/events');
      } else {
        setError(data.message || 'Failed to delete event');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {error ? 'Error' : 'Event not found'}
          </h2>
          <p className="mt-2 text-gray-600">
            {error || "The event you're looking for doesn't exist."}
          </p>
          <Link to="/events" className="mt-4 inline-block">
            <Button variant="outline" leftIcon={<ArrowLeft size={16} />}>
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/events">
          <Button variant="outline" leftIcon={<ArrowLeft size={16} />}>
            Back to Events
          </Button>
        </Link>
        <div className="relative">
          <button
            className={`flex items-center ${getStatusColor(event.status)}`}
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
          >
            {getStatusIcon(event.status)}
            <span className="ml-2">
              {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Unknown'}
            </span>
            <ChevronDown className="h-5 w-5 ml-2" />
          </button>
          {isStatusDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
              {statuses.map((status) => (
                <button
                  key={status}
                  className={`block w-full text-left px-4 py-2 text-sm ${getStatusColor(status)} hover:bg-gray-100`}
                  onClick={() => handleStatusChange(status)}
                >
                  {getStatusIcon(status)}
                  <span className="ml-2">{status}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <div className="h-64 sm:h-96 relative">
            <img
              src={event.banner_image || 'https://via.placeholder.com/800x400?text=No+Image'}
              alt={event.title || 'Event'}
              className="w-full h-full object-cover rounded-t-xl"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x400?text=No+Image';
              }}
            />
            </div>
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title || 'Untitled Event'}</h1>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{event.event_date ? formatDate(event.event_date) : 'No date'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event.location || 'No location'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{event.expected_guests ?? 0} guests</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">About this Event</h2>
                <p className="text-gray-600">{event.description || 'No description provided.'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to={`/transactions/`}>
                  <Button variant="outline" fullWidth>
                    View Requests
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  fullWidth
                  leftIcon={<Trash2 size={16} />}
                  onClick={handleDeleteEvent}
                >
                  Delete Event
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Event Type</h3>
                  <p className="mt-1 text-gray-900">
                    {event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                  <p className="mt-1 text-gray-900">{event.event_date ? formatDate(event.event_date) : 'No date'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-gray-900">{event.location || 'No location'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Guest Count</h3>
                  <p className="mt-1 text-gray-900">{event.expected_guests ?? 0} people</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};