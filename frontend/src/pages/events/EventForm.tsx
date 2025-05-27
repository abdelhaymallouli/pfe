import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  Search,
  X,
  Loader,
  Image as ImageIcon,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

const eventSchema = z.object({
  title: z.string().min(1, 'Event name is required'),
  type: z.string().min(1, 'Event type is required'),
  date: z.string().min(1, 'Date is required').transform(val => new Date(val).toISOString().split('T')[0]), // Format to YYYY-MM-DD
  location: z.string().min(1, 'Location is required'),
  theme: z.string().optional().default(''),
  description: z.string().optional().default(''),
  expectedGuests: z.string().transform(val => parseInt(val, 10)).refine(val => val >= 0, {
    message: 'Expected guests must be a positive number',
  }),
  bannerImage: z.instanceof(File).optional().nullable(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface Vendor {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  price?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  image: string;
  phone?: string;
  email?: string;
}

export const EventForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); 
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [eventData, setEventData] = useState({
    basicInfo: null as EventFormValues | null,
    selectedVendors: [] as Vendor[],
    vendorTasks: {} as Record<string, { id: string; title: string; completed: boolean }[]>,
    budget: 10000,
    bannerImageUrl: '',
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
      bannerImage: null,
    },
  });

  const handleBannerImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, or GIF)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setBannerImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadBannerImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('banner_image', file);
    try {
      const response = await fetch('http://localhost/pfe/backend/src/api/upload_image.php', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to upload image');
      }
      return result.image_url;
    } catch (error) {
      throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const removeBannerImage = () => {
    setBannerImage(null);
    setBannerImagePreview('');
    setEventData(prev => ({ ...prev, bannerImageUrl: '' }));
  };

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoadingVendors(true);
      try {
        const response = await fetch('http://localhost/pfe/backend/src/api/vendor.php');
        if (!response.ok) {
          throw new Error('Failed to fetch vendors');
        }
        const data = await response.json();
        const vendorData = Array.isArray(data) ? data : (data.data || data.vendors || []);
        setVendors(vendorData);
        setFilteredVendors(vendorData);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        alert('Failed to load vendors. Please try again later.');
        setVendors([]);
        setFilteredVendors([]);
      } finally {
        setIsLoadingVendors(false);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    let filtered = vendors;
    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(vendor =>
        vendor.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    setFilteredVendors(filtered);
  }, [vendors, searchTerm, selectedCategory]);

  const handleBasicInfoSubmit = async (data: EventFormValues) => {
    let bannerImageUrl = '';
    if (bannerImage) {
      setIsUploadingImage(true);
      try {
        bannerImageUrl = await uploadBannerImage(bannerImage);
      } catch (error) {
        console.error('Error uploading banner image:', error);
        alert(error instanceof Error ? error.message : 'Failed to upload banner image. Please try again.');
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }
    setEventData(prev => ({
      ...prev,
      basicInfo: { ...data, bannerImage: null },
      bannerImageUrl,
    }));
    setCurrentStep(2);
  };

  const toggleVendor = (vendor: Vendor) => {
    setEventData(prev => {
      const isSelected = prev.selectedVendors.some(v => v.id === vendor.id);
      const newVendors = isSelected
        ? prev.selectedVendors.filter(v => v.id !== vendor.id)
        : [...prev.selectedVendors, vendor];
      const newTasks = { ...prev.vendorTasks };
      if (!isSelected) {
        const timestamp = Date.now();
        newTasks[vendor.id] = [
          { id: `${vendor.id}-${timestamp}-1`, title: `Confirm details with ${vendor.name}`, completed: false },
          { id: `${vendor.id}-${timestamp}-2`, title: `Review contract from ${vendor.name}`, completed: false },
          { id: `${vendor.id}-${timestamp}-3`, title: `Make initial payment to ${vendor.name}`, completed: false },
        ];
      } else {
        delete newTasks[vendor.id];
      }
      return {
        ...prev,
        selectedVendors: newVendors,
        vendorTasks: newTasks,
      };
    });
  };

  const addTask = (vendorId: string, taskTitle: string) => {
    setEventData(prev => ({
      ...prev,
      vendorTasks: {
        ...prev.vendorTasks,
        [vendorId]: [
          ...(prev.vendorTasks[vendorId] || []),
          { id: `${vendorId}-${Date.now()}`, title: taskTitle, completed: false },
        ],
      },
    }));
  };

  const removeTask = (vendorId: string, taskId: string) => {
    setEventData(prev => ({
      ...prev,
      vendorTasks: {
        ...prev.vendorTasks,
        [vendorId]: prev.vendorTasks[vendorId].filter(task => task.id !== taskId),
      },
    }));
  };

  const toggleTaskComplete = (vendorId: string, taskId: string) => {
    setEventData(prev => ({
      ...prev,
      vendorTasks: {
        ...prev.vendorTasks,
        [vendorId]: prev.vendorTasks[vendorId].map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      },
    }));
  };

  const getUniqueCategories = () => {
    return Array.from(new Set(vendors.map(vendor => vendor.category)));
  };

  const handleCreateEvent = async () => {
    if (!eventData.basicInfo) {
      alert('Please complete the basic event information');
      return;
    }

    if (!currentUser?.id) {
      alert('User not authenticated. Please log in.');
      navigate('/login');
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        user_id: currentUser.id,
        title: eventData.basicInfo.title,
        type: eventData.basicInfo.type,
        theme: eventData.basicInfo.theme || '',
        date: eventData.basicInfo.date,
        location: eventData.basicInfo.location,
        bannerImage: eventData.bannerImageUrl || '',
        description: eventData.basicInfo.description || '',
        expectedGuests: eventData.basicInfo.expectedGuests,
        budget: eventData.budget,
        vendors: eventData.selectedVendors.map(v => v.id),
        tasks: Object.values(eventData.vendorTasks).flat().map(t => ({
          title: t.title,
          completed: t.completed,
        })),
      };

      console.log('Sending payload:', payload);

      const response = await fetch('http://localhost/pfe/backend/src/api/events.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid response from server: ${responseText}`);
      }

      if (response.ok && result.success) {
        alert('Event created successfully!');
        navigate('/events');
      } else {
        throw new Error(result.message || 'Unknown server error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      console.error('Error creating event:', error);
      alert(`Failed to create event: ${errorMessage}`);
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
                    error={errors.expectedGuests?.message}
                    {...register('expectedGuests')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Banner Image (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {bannerImagePreview ? (
                      <div className="relative">
                        <img
                          src={bannerImagePreview}
                          alt="Banner preview"
                          className="max-h-48 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeBannerImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="banner-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload a banner image</span>
                            <input
                              id="banner-upload"
                              name="banner-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleBannerImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
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
                    disabled={isUploadingImage}
                    rightIcon={isUploadingImage ? <Loader className="animate-spin" size={18} /> : <ChevronRight size={18} />}
                  >
                    {isUploadingImage ? 'Uploading...' : 'Next Step'}
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
              <h2 className="text-xl font-semibold text-gray-900">Select Vendors</h2>
              <p className="text-sm text-gray-500">Choose the vendors for your event</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <Input
                  placeholder="Search vendors..."
                  leftIcon={<Search size={18} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex gap-2">
                  <select
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {isLoadingVendors ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="animate-spin h-8 w-8 text-primary-600" />
                  <span className="ml-2">Loading vendors...</span>
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No vendors found. Please check your connection or try again.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {filteredVendors.map(vendor => (
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
                          src={vendor.image || 'https://via.placeholder.com/80x80'}
                          alt={vendor.name}
                          className="w-20 h-20 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/80x80';
                          }}
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                              <Badge variant="secondary" className="mt-1">
                                {vendor.category}
                              </Badge>
                            </div>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm font-medium">{vendor.rating}</span>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{vendor.description}</p>
                          {(vendor.phone || vendor.contactPhone) && (
                            <p className="mt-1 text-xs text-gray-400">
                              {vendor.phone || vendor.contactPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {eventData.selectedVendors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Vendors</h3>
                  <div className="space-y-2">
                    {eventData.selectedVendors.map(vendor => (
                      <div key={vendor.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{vendor.name}</span>
                        <Badge variant="primary">{vendor.category}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  disabled={eventData.selectedVendors.length === 0}
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
                  onClick={() => setCurrentStep(2)}
                  leftIcon={<ChevronLeft size={18} />}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
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
              <h2 className="text-xl font-semibold text-gray-900">Review & Summary</h2>
              <p className="text-sm text-gray-500">Review your event details</p>
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
                        <dt className="text-gray-500">Type</dt>
                        <dd className="font-medium">{eventData.basicInfo?.type}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Date</dt>
                        <dd className="font-medium">
                          {eventData.basicInfo?.date
                            ? new Date(eventData.basicInfo.date).toLocaleDateString()
                            : 'N/A'}
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
                      {eventData.basicInfo?.theme && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Theme</dt>
                          <dd className="font-medium">{eventData.basicInfo.theme}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Budget</dt>
                        <dd className="font-medium">${eventData.budget.toLocaleString()}</dd>
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
                          <p className="text-sm text-gray-500">{vendor.category}</p>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm">{vendor.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Tasks</h3>
                  <div className="space-y-2">
                    {Object.values(eventData.vendorTasks)
                      .flat()
                      .map(task => (
                        <div key={task.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className={task.completed ? 'line-through text-gray-400' : ''}>
                            {task.title}
                          </span>
                          <Badge variant={task.completed ? 'success' : 'secondary'}>
                            {task.completed ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
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
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
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
              {step < 4 && (
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
          <span>Vendors</span>
          <span>Tasks</span>
          <span>Review</span>
        </div>
      </div>
      {renderStep()}
    </div>
  );
};