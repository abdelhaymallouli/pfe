import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  budget?: number | null;
  id_type: number;
}

interface Vendor {
  id: string;
  name: string;
  prices?: string;
}

const typeMap: Record<number, string> = {
  1: 'Wedding',
  2: 'Birthday',
  3: 'Corporate',
  4: 'Concert',
};

// FIX 1: Updated the schema for 'amount' to remain a string for the form,
// removing the .transform() and adjusting the validation.
const transactionSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  transactionName: z.string().min(1, 'Transaction name is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export const AddTransactionForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    // FIX 2: Corrected defaultValues for 'amount' to be a string.
    defaultValues: {
      eventId: '',
      transactionName: '',
      vendorId: '',
      amount: '',
      deadline: '',
      notes: '',
    },
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<number | null>(null);
  const [vendorPrice, setVendorPrice] = useState<number | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const eventId = watch('eventId');
  const vendorId = watch('vendorId');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!currentUser?.id) {
          throw new Error('You must be logged in to add a transaction.');
        }

        // Fetch events
        const eventsResponse = await fetch(`http://localhost/pfe/backend/src/api/events.php?id_client=${encodeURIComponent(currentUser.id)}`);
        if (!eventsResponse.ok) {
          const text = await eventsResponse.text();
          console.error('Events response:', eventsResponse.status, text);
          throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
        }
        const eventsData = await eventsResponse.json();
        if (!eventsData.success || !Array.isArray(eventsData.data)) {
          throw new Error(eventsData.message || 'Invalid events data');
        }
        setEvents(
          eventsData.data.map((event: any) => ({
            id: event.id.toString(),
            title: event.title,
            budget: event.budget ? parseFloat(event.budget) : null,
            id_type: parseInt(event.id_type) || 0,
          }))
        );

        // Fetch vendors
        const vendorsResponse = await fetch('http://localhost/pfe/backend/src/api/vendor.php');
        if (!vendorsResponse.ok) {
          const text = await vendorsResponse.text();
          console.error('Vendors response:', vendorsResponse.status, text);
          throw new Error(`Failed to fetch vendors: ${vendorsResponse.status}`);
        }
        const vendorsData = await vendorsResponse.json();
        const vendorsArray = Array.isArray(vendorsData) ? vendorsData : vendorsData.success && Array.isArray(vendorsData.data) ? vendorsData.data : [];
        if (!vendorsArray.length) {
          throw new Error('No vendors found');
        }

        // Fetch prices for each vendor
        const vendorsWithPrices = await Promise.all(
          vendorsArray.map(async (vendor: any) => {
            try {
              const vendorDetailResponse = await fetch(`http://localhost/pfe/backend/src/api/vendor.php?id=${encodeURIComponent(vendor.id)}`);
              if (!vendorDetailResponse.ok) {
                console.warn(`Failed to fetch vendor ${vendor.id}: ${vendorDetailResponse.status}`);
                return { id: vendor.id.toString(), name: vendor.name, prices: null };
              }
              const vendorDetail = await vendorDetailResponse.json();
              return {
                id: vendorDetail.id.toString(),
                name: vendorDetail.name,
                prices: vendorDetail.prices || null,
              };
            } catch (error) {
              console.error(`Error fetching vendor ${vendor.id}:`, error);
              return { id: vendor.id.toString(), name: vendor.name, prices: null };
            }
          })
        );

        setVendors(vendorsWithPrices.filter(v => v.id));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load events or vendors');
        setEvents([]);
        setVendors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (eventId) {
      const selectedEvent = events.find(e => e.id === eventId);
      if (selectedEvent && selectedEvent.id_type > 0) {
        setSelectedEventType(selectedEvent.id_type);
      } else {
        console.error('Invalid event or id_type:', selectedEvent);
        toast.error('Event type not found for this event');
        setSelectedEventType(null);
      }
    } else {
      setSelectedEventType(null);
      setVendorPrice(null);
      setSelectedVendor(null);
      // FIX 3: Set value to an empty string instead of undefined.
      setValue('amount', '');
    }
  }, [eventId, events, setValue]);

  useEffect(() => {
    if (vendorId && selectedEventType !== null && eventId) {
      const fetchVendorPrice = async () => {
        try {
          const response = await fetch(`http://localhost/pfe/backend/src/api/vendor.php?id=${encodeURIComponent(vendorId)}`);
          if (!response.ok) {
            const text = await response.text();
            console.error('Vendor response:', response.status, text);
            throw new Error(`Failed to fetch vendor: ${response.status}`);
          }
          const vendorData = await response.json();
          if (vendorData && vendorData.prices) {
            const typeName = typeMap[selectedEventType];
            if (!typeName) {
              throw new Error(`Event type ID ${selectedEventType} not mapped`);
            }

            const pricePairs = vendorData.prices.split(',').reduce((acc: { [key: string]: number }, pair: string) => {
              const [name, price] = pair.split(':');
              if (name && price) {
                acc[name.trim()] = parseFloat(price) || 0;
              }
              return acc;
            }, {});
            const price = pricePairs[typeName] || null;
            setVendorPrice(price);
            setSelectedVendor({ id: vendorData.id.toString(), name: vendorData.name, prices: vendorData.prices });
            // This is now type-correct because 'amount' is a string field.
            setValue('amount', price ? price.toString() : '');
            if (!price) {
              console.warn('No price found for type:', typeName, 'Vendor:', vendorData.name);
              toast.error(`No price found for ${typeName} with vendor ${vendorData.name}`);
            }
          } else {
            setVendorPrice(null);
            setSelectedVendor(null);
            setValue('amount', '');
            toast.error(`No price data for vendor ${vendorData?.name || vendorId}`);
          }
        } catch (error) {
          console.error('Error fetching vendor price:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to load vendor price');
          setVendorPrice(null);
          setSelectedVendor(null);
          setValue('amount', '');
        }
      };
      fetchVendorPrice();
    } else {
      setVendorPrice(null);
      setSelectedVendor(null);
      // FIX 3: Set value to an empty string instead of undefined.
      setValue('amount', '');
    }
  }, [vendorId, selectedEventType, eventId, setValue]);

  const onSubmit: SubmitHandler<TransactionFormValues> = async (data) => {
    try {
      if (!currentUser?.id) {
        throw new Error('You must be logged in to add a transaction.');
      }

      const requestData = {
        id_event: parseInt(data.eventId),
        title: data.transactionName,
        // FIX 4: Parse the amount string to a number before sending to the backend.
        amount: parseFloat(data.amount),
        description: data.notes || null,
        deadline: data.deadline || null,
        status: 'Open',
        id_vendor: parseInt(data.vendorId),
        id_client: currentUser.id,
        transaction_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      };

      const response = await fetch('http://localhost/pfe/backend/src/api/requests.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        console.error('API error:', responseData);
        throw new Error(responseData.message || `HTTP error ${response.status}`);
      }

      toast.success('Transaction added successfully');
      navigate('/transactions');
    } catch (error) {
      console.error('Submission error:', error, { data });
      toast.error(error instanceof Error ? error.message : 'Failed to add transaction');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(onSubmit)(e);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!events.length || !vendors.length) {
    return (
      <div className="text-red-600 text-center py-8">
        Error: No {events.length ? '' : 'events'} {events.length && !vendors.length ? 'or' : ''} {vendors.length ? '' : 'vendors'} available. Please check the backend or ensure you have events and vendors set up.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/transactions')}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Transactions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">Add Transaction</h1>
          <p className="text-sm text-gray-500">Add a new transaction to an event</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                <select
                  {...register('eventId')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Select an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
                {errors.eventId && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventId.message}</p>
                )}
              </div>

              <Input
                label="Transaction Name"
                placeholder="e.g., Catering Service"
                error={errors.transactionName?.message}
                {...register('transactionName')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select
                  {...register('vendorId')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Select a vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                {errors.vendorId && (
                  <p className="mt-1 text-sm text-red-600">{errors.vendorId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                {vendorPrice !== null ? (
                  <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-100">
                    <DollarSign size={18} className="text-gray-500 mr-2" />
                    <p className="text-sm text-gray-900">{vendorPrice.toFixed(2)}</p>
                  </div>
                ) : (
                  <Input
                    type="number"
                    step="0.01"
                    leftIcon={<DollarSign size={18} />}
                    placeholder="Enter amount"
                    error={errors.amount?.message}
                    {...register('amount')}
                  />
                )}
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Deadline (optional)"
                type="date"
                leftIcon={<Calendar size={18} />}
                error={errors.deadline?.message}
                {...register('deadline')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  rows={4}
                  placeholder="Add any additional notes or details"
                  {...register('notes')}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/transactions')}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                Add Transaction
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};