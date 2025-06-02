import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  Search,
  X,
  Loader2,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

// Map event type names to id_type
const eventTypeMap: Record<string, number> = {
  wedding: 1,
  birthday: 2,
  corporate: 3,
  concert: 4,
};

// Schema aligned with database
const eventSchema = z.object({
  title: z.string().min(1, 'Event name is required'),
  type: z.string().min(1, 'Event type is required'),
  date: z.string().min(1, 'Date is required').transform(val => new Date(val).toISOString().split('T')[0]),
  lieu: z.string().min(1, 'Location is required'),
  description: z.string().optional().default(''),
  expected_guests: z.string().transform(val => parseInt(val, 10)).refine(val => val >= 0, {
    message: 'Expected guests must be a positive number',
  }),
  budget: z.string().transform(val => Number(val)).optional().default(0),
  image_banniere: z.instanceof(File).optional().nullable(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface Vendor {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  price: string;
  phone: string;
  image: string | null;
}

interface Requete {
  id: string;
  title: string;
  description: string | null;
  date_limit: string | null;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  amount: number;
  vendor_id: string | null;
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
  const [image_banniere, setImageBanniere] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [canSelectVendors, setCanSelectVendors] = useState(true);

  const [eventData, setEventData] = useState({
    basicInfo: null as EventFormValues | null,
    selectedVendors: [] as Vendor[],
    requetes: {} as Record<string, Requete[]>,
    budget: 0,
    image_banniere_url: '',
  });

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      type: '',
      date: '',
      lieu: '',
      description: '',
      expected_guests: 0,
      budget: 0,
      image_banniere: null,
    },
  });

  const eventType = watch('type');

  useEffect(() => {
    if (eventType) {
      setSelectedTypeId(eventTypeMap[eventType.toLowerCase()] || null);
    }
  }, [eventType]);

  useEffect(() => {
    if (eventData.budget <= 0) {
      setCanSelectVendors(false);
      return;
    }
    setCanSelectVendors(true);
  }, [eventData.budget]);

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
      setImageBanniere(file);
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
    setImageBanniere(null);
    setBannerImagePreview('');
    setEventData(prev => ({ ...prev, image_banniere_url: '' }));
  };

  useEffect(() => {
    const fetchVendors = async () => {
      if (!selectedTypeId) return;
      setIsLoadingVendors(true);
      try {
        const response = await fetch(`http://localhost/pfe/backend/src/api/vendor.php?type_id=${selectedTypeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch vendors');
        }
        const data = await response.json();
        const vendorData = Array.isArray(data) ? data : (data.data || data.vendors || []);
        const mappedVendors = vendorData.map((v: any) => ({
          id: v.id,
          name: v.name,
          category: v.category || 'Unknown',
          description: v.description || '',
          rating: parseFloat(v.rating || 0),
          price: `$${parseFloat(v.price || 0).toFixed(2)}`,
          phone: v.phone || '',
          image: v.image || null,
        }));
        setVendors(mappedVendors);
        setFilteredVendors(mappedVendors);
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
  }, [selectedTypeId]);

  useEffect(() => {
    let filtered = vendors;
    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredVendors(filtered);
  }, [vendors, searchTerm]);

  const handleBasicInfoSubmit: SubmitHandler<EventFormValues> = async (data) => {
    let image_banniere_url = eventData.image_banniere_url;
    if (image_banniere) {
      setIsUploadingImage(true);
      try {
        image_banniere_url = await uploadBannerImage(image_banniere);
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
      basicInfo: { ...data, image_banniere: null },
      image_banniere_url,
      budget: data.budget,
    }));
    setCurrentStep(2);
  };

  const toggleVendor = (vendor: Vendor) => {
    const vendorPrice = parseFloat(vendor.price?.replace('$', '') || '0') || 0;
    if (eventData.budget < vendorPrice) {
      alert(`Cannot select ${vendor.name}. Your budget ($${eventData.budget.toFixed(2)}) is less than the vendor's price (${vendor.price}).`);
      return;
    }

    setEventData(prev => {
      const isSelected = prev.selectedVendors.some(v => v.id === vendor.id);
      const newVendors = isSelected
        ? prev.selectedVendors.filter(v => v.id !== vendor.id)
        : [...prev.selectedVendors, vendor];

      const totalCost = newVendors.reduce((sum, v) => sum + (parseFloat(v.price?.replace('$', '') || '0') || 0), 0);
      if (totalCost > prev.budget) {
        alert(`Cannot select ${vendor.name}. Total vendor cost ($${totalCost.toFixed(2)}) exceeds your budget ($${prev.budget.toFixed(2)}).`);
        return prev;
      }

      const newRequetes = { ...prev.requetes };
      if (!isSelected) {
        newRequetes[vendor.id] = [
          {
            id: `${vendor.id}-${Date.now()}`,
            title: `Confirm details with ${vendor.name}`,
            description: null,
            date_limit: null,
            status: 'Open' as const,
            amount: vendorPrice,
            vendor_id: vendor.id,
          },
        ];
      } else {
        delete newRequetes[vendor.id];
      }

      return {
        ...prev,
        selectedVendors: newVendors,
        requetes: newRequetes,
      };
    });
  };

  const addRequete = (vendorId: string, title: string, amount: number) => {
    if (!title.trim()) {
      alert('Requete title is required.');
      return;
    }
    if (amount <= 0) {
      alert('Requete amount must be greater than zero.');
      return;
    }
    const totalRequeteAmount = Object.values(eventData.requetes)
      .flat()
      .reduce((sum, req) => sum + req.amount, 0) + amount;

    if (totalRequeteAmount > eventData.budget) {
      alert(`Cannot add requete with amount $${amount.toFixed(2)}. Total requete amount ($${totalRequeteAmount.toFixed(2)}) exceeds your event budget ($${eventData.budget.toFixed(2)}).`);
      return;
    }

    const uniqueId = `${vendorId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setEventData(prev => ({
      ...prev,
      requetes: {
        ...prev.requetes,
        [vendorId]: [
          ...(prev.requetes[vendorId] || []),
          {
            id: uniqueId,
            title,
            description: null,
            date_limit: null,
            status: 'Open' as const,
            amount,
            vendor_id: vendorId,
          },
        ],
      },
    }));
  };

  const updateRequeteAmount = (vendorId: string, requeteId: string, amount: number) => {
    if (amount <= 0) {
      alert('Requete amount must be greater than zero.');
      return;
    }
    const totalRequeteAmount = Object.values(eventData.requetes)
      .flat()
      .reduce((sum, req) => sum + (req.id === requeteId ? amount : req.amount), 0);

    if (totalRequeteAmount > eventData.budget) {
      alert(`Cannot update requete amount to $${amount.toFixed(2)}. Total requete amount ($${totalRequeteAmount.toFixed(2)}) exceeds your event budget ($${eventData.budget.toFixed(2)}).`);
      return;
    }

    setEventData(prev => ({
      ...prev,
      requetes: {
        ...prev.requetes,
        [vendorId]: prev.requetes[vendorId].map(r =>
          r.id === requeteId ? { ...r, amount } : r
        ),
      },
    }));
  };

  const removeRequete = (vendorId: string, requeteId: string) => {
    setEventData(prev => ({
      ...prev,
      requetes: {
        ...prev.requetes,
        [vendorId]: prev.requetes[vendorId].filter(r => r.id !== requeteId),
      },
    }));
  };

  const toggleRequeteStatus = (vendorId: string, requeteId: string) => {
    setEventData(prev => ({
      ...prev,
      requetes: {
        ...prev.requetes,
        [vendorId]: prev.requetes[vendorId].map(r =>
          r.id === requeteId
            ? {
                ...r,
                status: r.status === 'Open'
                  ? 'In Progress'
                  : r.status === 'In Progress'
                  ? 'Completed'
                  : r.status === 'Completed'
                  ? 'Cancelled'
                  : 'Open',
              }
            : r
        ),
      },
    }));
  };

  const handleSubmitEvent = async () => {
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
      const requetesPayload = Object.values(eventData.requetes)
        .flat()
        .map(requete => ({
          titre: requete.title,
          description: requete.description,
          date_limite: requete.date_limit,
          statut: requete.status,
          montant: requete.amount,
          vendor_id: requete.vendor_id,
        }));

      const eventPayload = {
        user_id: currentUser.id,
        title: eventData.basicInfo.title,
        type_id: eventTypeMap[eventData.basicInfo.type.toLowerCase()],
        date: eventData.basicInfo.date,
        location: eventData.basicInfo.lieu,
        image_banniere: eventData.image_banniere_url || '',
        description: eventData.basicInfo.description || '',
        expected_guests: eventData.basicInfo.expected_guests,
        budget: eventData.budget,
        requetes: requetesPayload,
      };

      console.log('Sending event payload:', eventPayload);

      const eventResponse = await fetch('http://localhost/pfe/backend/src/api/events.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      });

      const responseText = await eventResponse.text();
      console.log('Raw response:', responseText);

      let eventResult;
      try {
        eventResult = JSON.parse(responseText);
      } catch (err) {
        console.error('Failed to parse JSON:', err);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      if (!eventResponse.ok || !eventResult.success) {
        throw new Error(eventResult.message || 'Failed to create event');
      }

      alert('Event created successfully!');
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      alert(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                <h2 className="text-xl font-semibold text-gray-900">Basic Info</h2>
                <p className="text-sm font-medium text-gray-500">Let's start with the essential details</p>
              </CardHeader>
              <CardContent className="event">
                <Input
                  label="Event Name"
                  placeholder="Enter event name..."
                  leftIcon={<FileText />}
                  error={errors.title?.message}
                  {...register('title')}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md cursor-pointer"
                      {...register('type')}
                    >
                      <option value="">Select type</option>
                      {Object.keys(eventTypeMap).map((type) => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                    {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
                  </div>
                  <Input
                    type="date"
                    label="Date"
                    leftIcon={<Calendar />}
                    error={errors.date?.message}
                    {...register('date')}
                  />
                </div>
                <Input
                  label="Location"
                  placeholder="Enter location..."
                  leftIcon={<MapPin />}
                  error={errors.lieu?.message}
                  {...register('lieu')}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Expected Guests"
                    placeholder="Enter number of guests..."
                    leftIcon={<Users />}
                    error={errors.expected_guests?.message}
                    {...register('expected_guests')}
                  />
                  <Input
                    type="number"
                    label="Budget"
                    placeholder="Enter budget amount..."
                    leftIcon={<DollarSign />}
                    error={errors.budget?.message}
                    {...register('budget')}
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
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                          >
                            <span>Upload a banner image</span>
                            <input
                              id="banner-upload"
                              name="banner-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleBannerImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 4MB
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter description..."
                    rows={4}
                    {...register('description')}
                  />
                </div>
                <div className="flex justify-between">
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
                    rightIcon={isUploadingImage ? <Loader2 className="animate-spin" /> : <ChevronRight />}
                    className="cursor-pointer"
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
              <p className="text-sm text-gray-500">Choose vendors for your event</p>
            </CardHeader>
            <CardContent>
              {!canSelectVendors && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    Your budget is $0. Please set a budget to select vendors.
                  </p>
                </div>
              )}
              <div className="mb-6 space-y-4">
                <Input
                  placeholder="Search vendors..."
                  leftIcon={<Search />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!canSelectVendors}
                />
              </div>
              {isLoadingVendors ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
                  <span className="ml-2">Loading vendors...</span>
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No vendors found for this event type.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {filteredVendors.map(vendor => {
                    const vendorPrice = parseFloat(vendor.price.replace('$', '')) || 0;
                    const isAffordable = eventData.budget >= vendorPrice && eventData.budget > 0;
                    const isSelected = eventData.selectedVendors.some(v => v.id === vendor.id);
                    return (
                      <div
                        key={vendor.id}
                        className={`rounded-lg border p-4 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : isAffordable && canSelectVendors
                            ? 'border-gray-200 hover:border-blue-200 cursor-pointer'
                            : 'border-gray-200 opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => isAffordable && canSelectVendors && toggleVendor(vendor)}
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
                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800 mt-1">
                                  {vendor.category}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm font-medium">{vendor.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{vendor.description}</p>
                            <p className="mt-1 text-sm text-gray-600">Price: {vendor.price}</p>
                            {vendor.phone && (
                              <p className="mt-1 text-xs text-gray-500">{vendor.phone}</p>
                            )}
                            {!isAffordable && (
                              <p className="mt-1 text-xs text-red-600">
                                Budget too low for this vendor
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {eventData.selectedVendors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Vendors</h3>
                  <div className="space-y-2">
                    {eventData.selectedVendors.map(vendor => (
                      <div key={vendor.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{vendor.name}</span>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
                          {vendor.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  leftIcon={<ChevronLeft />}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={eventData.selectedVendors.length === 0 && canSelectVendors}
                  rightIcon={<ChevronRight />}
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
              <h2 className="text-xl font-semibold text-gray-900">Requirements (Requetes)</h2>
              <p className="text-sm text-gray-500">Manage requirements for each vendor</p>
            </CardHeader>
            <CardContent>
              {eventData.selectedVendors.map(vendor => (
                <div key={vendor.id} className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">{vendor.name}</h3>
                  <div className="space-y-2">
                    {eventData.requetes[vendor.id]?.map((requete, index) => (
                      <div
                        key={`${vendor.id}-${requete.id}-${index}`}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <select
                            value={requete.status}
                            onChange={() => toggleRequeteStatus(vendor.id, requete.id)}
                            className="rounded-md border-gray-300 text-sm"
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <span>{requete.title}</span>
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={requete.amount}
                            onChange={(e) => updateRequeteAmount(vendor.id, requete.id, parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </div>
                        <button
                          onClick={() => removeRequete(vendor.id, requete.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <div className="mt-2 flex space-x-2">
                      <Input
                        placeholder="Add new requete..."
                        id={`requete-${vendor.id}`}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        id={`requete-amount-${vendor.id}`}
                        className="w-24"
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById(`requete-${vendor.id}`) as HTMLInputElement;
                          const amountInput = document.getElementById(`requete-amount-${vendor.id}`) as HTMLInputElement;
                          if (input.value && amountInput.value) {
                            addRequete(vendor.id, input.value, parseFloat(amountInput.value) || 0);
                            input.value = '';
                            amountInput.value = '';
                          } else {
                            alert('Please provide both a title and an amount for the requete.');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  leftIcon={<ChevronLeft />}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  rightIcon={<ChevronRight />}
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
                  <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Event Name</dt>
                        <dd className="font-medium">{eventData.basicInfo?.title}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Type</dt>
                        <dd className="font-medium">{eventData.basicInfo?.type}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Date</dt>
                        <dd className="font-medium">
                          {eventData.basicInfo?.date
                            ? new Date(eventData.basicInfo.date).toLocaleDateString()
                            : 'N/A'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Location</dt>
                        <dd className="font-medium">{eventData.basicInfo?.lieu}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Expected Guests</dt>
                        <dd className="font-medium">{eventData.basicInfo?.expected_guests}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Budget</dt>
                        <dd className="font-medium">${eventData.budget.toLocaleString()}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Selected Vendors</h3>
                  <div className="space-y-2">
                    {eventData.selectedVendors.length === 0 ? (
                      <p className="text-gray-600">No vendors selected.</p>
                    ) : (
                      eventData.selectedVendors.map(vendor => (
                        <div key={vendor.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div>
                            <h4 className="font-medium">{vendor.name}</h4>
                            <p className="text-sm text-gray-500">{vendor.category}</p>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{vendor.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Requirements (Requetes)</h3>
                  <div className="space-y-2">
                    {Object.values(eventData.requetes).flat().length === 0 ? (
                      <p className="text-gray-600">No requirements added.</p>
                    ) : (
                      Object.values(eventData.requetes).flat().map(requete => (
                        <div key={requete.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <span>{requete.title}</span>
                            <p className="text-sm text-gray-500">Amount: ${requete.amount.toLocaleString()}</p>
                          </div>
                          <Badge variant={requete.status === 'Completed' ? 'success' : 'secondary'}>
                            {requete.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    leftIcon={<ChevronLeft />}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleSubmitEvent}
                    disabled={isCreating}
                    rightIcon={<Check />}
                    className="ml-auto"
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold">Create New Event</h2>
        <p className="mt-2 text-sm text-gray-500">Fill in the details to create your new event</p>
      </div>
      <div className="mb-8">
        <div className="relative flex justify-between items-center">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>Basic Info</span>
          <span>Vendors</span>
          <span>Requetes</span>
          <span>Review</span>
        </div>
      </div>
      {renderStep()}
    </div>
  );
};