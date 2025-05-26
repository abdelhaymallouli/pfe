// EventForm.tsx (Fixed version with proper backend integration)

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  FileText,
  Users,
  Palette,
  Home,
  Trees as Tree,
  Building2,
  Waves,
  MapPinOff,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  DollarSign,
  Search,
  X
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const eventSchema = z.object({
  title: z.string().min(1, 'Event name is required'),
  type: z.string().min(1, 'Event type is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  theme: z.string().optional().default(''),
  description: z.string().optional().default(''),
  expectedGuests: z.string().transform(val => parseInt(val, 10))
});

type EventFormValues = z.infer<typeof eventSchema>;

const mockVendors = [
  {
    id: '1',
    name: 'Gourmet Delights',
    type: 'Catering',
    rating: 4.8,
    price: 2500,
    location: 'Downtown',
    description: 'Premium catering service for all occasions',
    image: 'https://images.pexels.com/photos/5908226/pexels-photo-5908226.jpeg'
  },
  {
    id: '2',
    name: 'Floral Fantasy',
    type: 'Decoration',
    rating: 4.7,
    price: 1500,
    location: 'Westside',
    description: 'Beautiful floral arrangements and event decoration',
    image: 'https://images.pexels.com/photos/2111171/pexels-photo-2111171.jpeg'
  },
  {
    id: '3',
    name: 'Rhythm Masters',
    type: 'Music',
    rating: 4.9,
    price: 1800,
    location: 'Citywide',
    description: 'Professional DJ and live music services',
    image: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg'
  }
];

const locationTemplates = [
  { id: 'home', name: 'Home', icon: Home, description: 'Perfect for intimate gatherings' },
  { id: 'garden', name: 'Public Garden', icon: Tree, description: 'Beautiful outdoor settings' },
  { id: 'banquet', name: 'Banquet Hall', icon: Building2, description: 'Ideal for large events' },
  { id: 'beach', name: 'Beach', icon: Waves, description: 'Scenic coastal locations' },
  { id: 'other', name: 'Other', icon: MapPinOff, description: 'Custom venue of your choice' }
];

export const EventForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [eventData, setEventData] = useState({
    basicInfo: null as EventFormValues | null,
    locationTemplate: '',
    selectedVendors: [] as typeof mockVendors,
    vendorTasks: {} as Record<string, { id: string; title: string; completed: boolean }[]>,
    budget: 10000
  });

  const { register, handleSubmit, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      type: '',
      date: '',
      location: '',
      theme: '',
      description: '',
      expectedGuests: 0,
    },
  });

  const handleBasicInfoSubmit = (data: EventFormValues) => {
    setEventData(prev => ({ ...prev, basicInfo: data }));
    setCurrentStep(2);
  };

  const selectLocationTemplate = (templateId: string) => {
    setEventData(prev => ({ ...prev, locationTemplate: templateId }));
  };

  const toggleVendor = (vendor: typeof mockVendors[0]) => {
    setEventData(prev => {
      const isSelected = prev.selectedVendors.some(v => v.id === vendor.id);
      const newVendors = isSelected
        ? prev.selectedVendors.filter(v => v.id !== vendor.id)
        : [...prev.selectedVendors, vendor];

      const newTasks = { ...prev.vendorTasks };
      if (!isSelected) {
        newTasks[vendor.id] = [
          { id: '1', title: `Confirm details with ${vendor.name}`, completed: false },
          { id: '2', title: `Review contract from ${vendor.name}`, completed: false },
          { id: '3', title: `Make initial payment to ${vendor.name}`, completed: false }
        ];
      } else {
        delete newTasks[vendor.id];
      }

      return {
        ...prev,
        selectedVendors: newVendors,
        vendorTasks: newTasks
      };
    });
  };

  const addTask = (vendorId: string, taskTitle: string) => {
    setEventData(prev => ({
      ...prev,
      vendorTasks: {
        ...prev.vendorTasks,
        [vendorId]: [
          ...prev.vendorTasks[vendorId],
          { id: Date.now().toString(), title: taskTitle, completed: false }
        ]
      }
    }));
  };

  const removeTask = (vendorId: string, taskId: string) => {
    setEventData(prev => ({
      ...prev,
      vendorTasks: {
        ...prev.vendorTasks,
        [vendorId]: prev.vendorTasks[vendorId].filter(task => task.id !== taskId)
      }
    }));
  };

  const toggleTaskComplete = (vendorId: string, taskId: string) => {
    setEventData(prev => ({
      ...prev,
      vendorTasks: {
        ...prev.vendorTasks,
        [vendorId]: prev.vendorTasks[vendorId].map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      }
    }));
  };

  const getTotalBudget = () => {
    return eventData.selectedVendors.reduce((total, vendor) => total + vendor.price, 0);
  };

  const getBudgetPercentage = () => {
    return (getTotalBudget() / eventData.budget) * 100;
  };

  const handleCreateEvent = async () => {
    if (!eventData.basicInfo) {
      alert('Basic event information is missing');
      return;
    }

    setIsCreating(true);

    try {
      // Prepare the payload to match PHP backend expectations
      const payload = {
        user_id: 1, // TODO: Replace with actual logged-in user ID
        title: eventData.basicInfo.title,
        type: eventData.basicInfo.type,
        theme: eventData.basicInfo.theme || '',
        date: eventData.basicInfo.date,
        location: eventData.basicInfo.location,
        bannerImage: '', // Empty string as default
        description: eventData.basicInfo.description || '',
        expectedGuests: eventData.basicInfo.expectedGuests,
        vendors: eventData.selectedVendors.map(v => parseInt(v.id)),
        tasks: Object.values(eventData.vendorTasks).flat().map(t => ({ title: t.title }))
      };

      console.log('Sending payload:', payload);

      const response = await fetch('http://localhost/pfe/backend/src/api/events.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (response.ok && result.success) {
        alert('Event created successfully!');
        navigate('/events');
      } else {
        console.error('Server error:', result);
        alert(`Error creating event: ${result.message || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Network or parsing error:', error);
      alert(`Failed to create event: ${error.message || 'Network error occurred'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleSubmit(handleBasicInfoSubmit)}>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-500">Let's start with the essential details</p>
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
                    rightIcon={<ChevronRight size={18} />}
                  >
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Choose a Location Template</h2>
              <p className="text-sm text-gray-500">Select a venue type for your event</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {locationTemplates.map(template => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={template.id}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        eventData.locationTemplate === template.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                      onClick={() => selectLocationTemplate(template.id)}
                    >
                      <div className="flex items-center mb-2">
                        <div className="p-2 rounded-lg bg-primary-100">
                          <Icon size={24} className="text-primary-600" />
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  leftIcon={<ChevronLeft size={18} />}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!eventData.locationTemplate}
                  rightIcon={<ChevronRight size={18} />}
                >
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Select Vendors</h2>
              <p className="text-sm text-gray-500">Choose the vendors for your event</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <Input
                  placeholder="Search vendors..."
                  leftIcon={<Search size={18} />}
                />
                <div className="flex gap-2">
                  <select className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="">All Types</option>
                    <option value="catering">Catering</option>
                    <option value="decoration">Decoration</option>
                    <option value="music">Music</option>
                  </select>
                  <select className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="">All Locations</option>
                    <option value="downtown">Downtown</option>
                    <option value="westside">Westside</option>
                    <option value="citywide">Citywide</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {mockVendors.map(vendor => (
                  <div
                    key={vendor.id}
                    className={`rounded-lg border p-4 cursor-pointer transition-all ${
                      eventData.selectedVendors.some(v => v.id === vendor.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-200'
                    }`}
                    onClick={() => toggleVendor(vendor)}
                  >
                    <div className="flex items-start">
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {vendor.type}
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium">{vendor.rating}</span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{vendor.description}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {vendor.price}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {eventData.selectedVendors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Vendors</h3>
                  <div className="space-y-2">
                    {eventData.selectedVendors.map(vendor => (
                      <div key={vendor.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{vendor.name}</span>
                        <Badge variant="primary">${vendor.price}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  leftIcon={<ChevronLeft size={18} />}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  disabled={eventData.selectedVendors.length === 0}
                  rightIcon={<ChevronRight size={18} />}
                >
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Vendor Tasks</h2>
              <p className="text-sm text-gray-500">Manage tasks for each vendor</p>
            </CardHeader>
            <CardContent>
              {eventData.selectedVendors.map(vendor => (
                <div key={vendor.id} className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">{vendor.name}</h3>
                  <div className="space-y-2">
                    {eventData.vendorTasks[vendor.id]?.map(task => (
                      <div key={task.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskComplete(vendor.id, task.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className={`ml-2 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                        <button
                          onClick={() => removeTask(vendor.id, task.id)}
                          className="text-gray-400 hover:text-error-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <div className="mt-2">
                      <Input
                        placeholder="Add new task..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addTask(vendor.id, input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  leftIcon={<ChevronLeft size={18} />}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentStep(5)}
                  rightIcon={<ChevronRight size={18} />}
                >
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Review & Budget Summary</h2>
              <p className="text-sm text-gray-500">Review your event details and budget</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Event Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Event Name</dt>
                        <dd className="font-medium">{eventData.basicInfo?.title}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Date</dt>
                        <dd className="font-medium">
                          {new Date(eventData.basicInfo?.date || '').toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Location</dt>
                        <dd className="font-medium">{eventData.basicInfo?.location}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Expected Guests</dt>
                        <dd className="font-medium">{eventData.basicInfo?.expectedGuests}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Selected Vendors</h3>
                  <div className="space-y-2">
                    {eventData.selectedVendors.map(vendor => (
                      <div key={vendor.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <h4 className="font-medium">{vendor.name}</h4>
                          <p className="text-sm text-gray-500">{vendor.type}</p>
                        </div>
                        <Badge variant="primary">${vendor.price}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Budget Overview</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Budget</span>
                        <span className="font-medium">${eventData.budget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Cost</span>
                        <span className="font-medium">${getTotalBudget()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Remaining</span>
                        <span className="font-medium text-success-600">
                          ${eventData.budget - getTotalBudget()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Budget Usage</span>
                        <span>{Math.round(getBudgetPercentage())}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getBudgetPercentage() > 100 ? 'bg-error-500' : 'bg-success-500'
                          }`}
                          style={{ width: `${Math.min(getBudgetPercentage(), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(4)}
                    leftIcon={<ChevronLeft size={18} />}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleCreateEvent}
                    disabled={isCreating}
                    rightIcon={<Check size={18} />}
                  >
                    {isCreating ? 'Creating Event...' : 'Create Event'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
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

      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 5 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= currentStep
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step}
              </div>
              {step < 5 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>Basic Info</span>
          <span>Location</span>
          <span>Vendors</span>
          <span>Tasks</span>
          <span>Review</span>
        </div>
      </div>

      {renderStep()}
    </div>
  );
};