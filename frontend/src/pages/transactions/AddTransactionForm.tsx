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
  type_id?: number;
}

interface Vendor {
  id: string;
  name: string;
  prices?: string;
}

interface PricePair {
  typeId: string;
  price: number;
}

const transactionSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  transactionName: z.string().min(1, 'Transaction name is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  amount: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || val >= 0, {
      message: 'Amount must be non-negative',
    }),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export const AddTransactionForm = () => {
  const { currentUser } = useAuth(); // Get currentUser
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      eventId: '',
      transactionName: '',
      vendorId: '',
      amount: undefined,
      dueDate: '',
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
    console.log('Form state:', { eventId, vendorId, errors, isSubmitting });
  }, [eventId, vendorId, errors, isSubmitting]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Check if user is logged in
        if (!currentUser?.id) {
          throw new Error('You must be logged in to add a transaction.');
        }

        // Fetch events for the current user
        const eventsResponse = await fetch(`http://localhost/pfe/backend/src/api/events.php?userId=${currentUser.id}`);
        if (!eventsResponse.ok) {
          const text = await eventsResponse.text();
          console.error('Events response status:', eventsResponse.status, 'Raw response:', text);
          throw new Error(`HTTP error while fetching events! status: ${eventsResponse.status}`);
        }
        const eventsData = await eventsResponse.json();
        console.log('Events API response:', eventsData);
        if (!eventsData.success || !Array.isArray(eventsData.data)) {
          throw new Error(eventsData.message || 'Invalid events response');
        }
        setEvents(
          eventsData.data.map((event: any) => ({
            id: event.id,
            title: event.title,
            budget: event.budget,
            type_id: event.id_type,
          }))
        );

        // Fetch vendors
        const vendorsResponse = await fetch('http://localhost/pfe/backend/src/api/vendor.php');
        if (!vendorsResponse.ok) {
          const text = await vendorsResponse.text();
          console.error('Vendors response status:', vendorsResponse.status, 'Raw response:', text);
          throw new Error(`HTTP error while fetching vendors! status: ${vendorsResponse.status}`);
        }
        const vendorsData = await vendorsResponse.json();
        console.log('Vendors API response:', vendorsData);
        if (!Array.isArray(vendorsData)) {
          throw new Error('Invalid vendors response');
        }
        setVendors(
          vendorsData.map((vendor: any) => ({
            id: vendor.id,
            name: vendor.name,
            prices: vendor.prices,
          }))
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load events or vendors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    console.log('Event ID changed:', eventId);
    if (eventId) {
      const fetchEventType = async () => {
        try {
          const response = await fetch(`http://localhost/pfe/backend/src/api/events.php?id=${eventId}`);
          if (!response.ok) {
            throw new Error(`HTTP error while fetching event! status: ${response.status}`);
          }
          const eventData = await response.json();
          console.log('Event API response:', JSON.stringify(eventData, null, 2));
          if (!eventData.success || !eventData.data) {
            throw new Error(eventData.message || `No event found for ID ${eventId}`);
          }
          const event = eventData.data;
          if (typeof event.id_type === 'number') {
            setSelectedEventType(event.id_type);
          } else {
            console.error('Event data missing or invalid id_type:', event);
            toast.error('Event type not found for this event');
            setSelectedEventType(null);
          }
        } catch (error) {
          console.error('Error fetching event type:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to load event type');
          setSelectedEventType(null);
        }
      };
      fetchEventType();
    } else {
      setSelectedEventType(null);
      setVendorPrice(null);
      setSelectedVendor(null);
      setValue('amount', undefined);
    }
  }, [eventId, setValue]);

  useEffect(() => {
    console.log('Vendor ID or event type changed:', { vendorId, selectedEventType });
    if (vendorId && selectedEventType && eventId) {
      const fetchVendorPrice = async () => {
        try {
          const response = await fetch(`http://localhost/pfe/backend/src/api/vendor.php?id=${vendorId}`);
          if (!response.ok) {
            throw new Error(`HTTP error while fetching vendor! status: ${response.status}`);
          }
          const vendorData = await response.json();
          console.log('Vendor API response:', JSON.stringify(vendorData, null, 2));
          if (vendorData && vendorData.prices) {
            const pricePairs: PricePair[] = vendorData.prices.split(',').map((pair: string) => {
              const [typeId, price] = pair.split(':');
              return { typeId, price: parseFloat(price) };
            });
            const price = pricePairs.find((pair) => pair.typeId === selectedEventType.toString())?.price || null;
            setVendorPrice(price);
            setSelectedVendor({ id: vendorData.id, name: vendorData.name, prices: vendorData.prices });
            setValue('amount', price ? price.toString() : undefined);
            if (!price) {
              console.warn('No price found for event type:', selectedEventType);
              toast.error('No price found for this vendor and event type');
            }
          } else {
            setVendorPrice(null);
            setSelectedVendor(null);
            setValue('amount', undefined);
            toast.error('Vendor price data not found');
          }
        } catch (error) {
          console.error('Error fetching vendor price:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to load vendor price');
          setVendorPrice(null);
          setSelectedVendor(null);
          setValue('amount', undefined);
        }
      };
      fetchVendorPrice();
    } else {
      setVendorPrice(null);
      setSelectedVendor(null);
      setValue('amount', undefined);
    }
  }, [vendorId, selectedEventType, eventId, setValue]);

  const onSubmit: SubmitHandler<TransactionFormValues> = async (data) => {
    console.log('onSubmit triggered with data:', data);
    console.log('Derived values:', { vendorPrice, selectedEventType, montant: vendorPrice ?? data.amount ?? 0 });
    try {
      if (!currentUser?.id) {
        throw new Error('You must be logged in to add a transaction.');
      }

      const montant = vendorPrice ?? data.amount ?? 0;
      if (montant <= 0) {
        console.error('Amount validation failed:', { vendorPrice, dataAmount: data.amount });
        toast.error('Amount must be greater than zero');
        return;
      }

      const requestData = {
        event_id: data.eventId,
        titre: data.transactionName,
        montant,
        description: data.notes || null,
        date_limite: data.dueDate || null,
        statut: 'Open',
        vendor_id: data.vendorId,
        user_id: currentUser.id, // Add user_id to the payload
      };
      console.log('Sending request to requetes.php:', requestData);

      const response = await fetch('http://localhost/pfe/backend/src/api/requetes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json().catch((err) => {
        console.error('Error parsing response JSON:', err);
        throw new Error('Failed to parse server response');
      });
      console.log('API response body:', responseData);

      if (!response.ok || !responseData.success) {
        console.error('API error:', responseData);
        throw new Error(responseData.message || 'Failed to add transaction');
      }

      toast.success('Transaction added successfully');
      console.log('Navigating to /transactions');
      navigate('/transactions');
    } catch (error) {
      console.error('Submission error:', error, { data });
      const errorMessage = error instanceof Error ? error.message : 'Failed to add transaction';
      toast.error(errorMessage);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('Form submit event triggered');
    handleSubmit(onSubmit)(e);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!events.length || !vendors.length) {
    return (
      <div className="text-red-600">
        Error: No {events.length ? '' : 'events'} {events.length && !vendors.length ? 'or' : ''} {vendors.length ? '' : 'vendors'} available. Please check the backend or ensure you have events and vendors set up.
      </div>
    );
  }

  console.log('Rendering form, errors:', errors);

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
                label="Due Date (optional)"
                type="date"
                leftIcon={<Calendar size={18} />}
                error={errors.dueDate?.message}
                {...register('dueDate')}
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