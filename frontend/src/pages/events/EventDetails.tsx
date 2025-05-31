import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/utils';

interface Event {
  id?: string;
  title?: string;
  type?: string;
  date?: string;
  location?: string;
  description?: string;
  status?: string;
  expectedGuests?: number;
  bannerImage?: string;
}

export const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
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
          if (Array.isArray(data.data)) {
            const foundEvent = data.data.find((e: Event) => e.id === id);
            if (!foundEvent) throw new Error('Event not found');
            setEvent(foundEvent);
          } else {
            setEvent(data.data);
          }
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
    switch (status) {
      case 'upcoming':
        return 'primary';
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
        <Badge variant={getStatusColor(event.status)}>
          {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Unknown'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <div className="h-64 sm:h-96 relative">
              <img
                src={event.bannerImage || 'https://via.placeholder.com/800x400?text=No+Image'}
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
                  <span>{event.date ? formatDate(event.date) : 'No date'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event.location || 'No location'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{event.expectedGuests ?? 0} guests</span>
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
                <Button variant="outline" fullWidth>
                  Edit Event
                </Button>
                <Link to={`/transactions/`}>
                  <Button variant="outline" fullWidth>
                    View Requests
                  </Button>
                </Link>
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
                  <p className="mt-1 text-gray-900">{event.date ? formatDate(event.date) : 'No date'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-gray-900">{event.location || 'No location'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Guest Count</h3>
                  <p className="mt-1 text-gray-900">{event.expectedGuests ?? 0} people</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};