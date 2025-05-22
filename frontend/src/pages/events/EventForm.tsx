import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, FileText, Users, Palette } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';

const eventSchema = z.object({
  title: z.string().min(1, 'Event name is required'),
  type: z.string().min(1, 'Event type is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  theme: z.string().optional(),
  description: z.string().optional(),
  expectedGuests: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export const EventForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      type: '',
      date: '',
      location: '',
      theme: '',
      description: '',
      expectedGuests: '',
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    try {
      // Format date: keep only YYYY-MM-DD because DB column is DATE
      const formattedDate = data.date.split('T')[0]; 

      // Build event data with user_id (hardcoded as 1 for now), bannerImage empty string
      const eventData = {
        user_id: 1,
        title: data.title,
        type: data.type,
        date: formattedDate,
        location: data.location,
        theme: data.theme || '',
        description: data.description || '',
        expectedGuests: data.expectedGuests || 0,
        bannerImage: '',
      };

      const response = await fetch('http://localhost/pfe/backend/src/api/events.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to create event: ${errorData.message || 'Unknown error'}`);
        return;
      }

      alert('Event created successfully!');
      navigate('/events');
    } catch (error) {
      alert('An error occurred while creating the event.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="mt-2 text-sm text-gray-500">
          Fill in the details below to create your new event
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Event Name"
              leftIcon={<FileText size={18} />}
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  {...register('type')}
                >
                  <option value="">Select type</option>
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="corporate">Corporate</option>
                  <option value="social">Social</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-error-600">{errors.type.message}</p>
                )}
              </div>

              <Input
                type="datetime-local"
                label="Date and Time"
                leftIcon={<Calendar size={18} />}
                error={errors.date?.message}
                {...register('date')}
              />
            </div>

            <Input
              label="Location"
              leftIcon={<MapPin size={18} />}
              error={errors.location?.message}
              {...register('location')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Theme (Optional)"
                leftIcon={<Palette size={18} />}
                {...register('theme')}
              />

              <Input
                type="number"
                label="Expected Guests"
                leftIcon={<Users size={18} />}
                {...register('expectedGuests')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                rows={4}
                {...register('description')}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/events')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
              >
                Create Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
