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

// Define interfaces
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
    .transform((val) => (val ? parseFloat(val) : 0))
    .refine((val) => val >= 0, {
      message: 'Amount must be non-negative',
    })
    .optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export const AddTransactionForm = () => {
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
      amount: 0,
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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const eventsResponse = await fetch('http://localhost/pfe/backend/src/api/events.php');
        if (!eventsResponse.ok) {
          const text = await eventsResponse.text();
          console.error('Events response status:', eventsResponse.status, 'Raw response:', text);
          throw new Error(`HTTP error while fetching events! status: ${eventsResponse.status}`);
        }
        const eventsData = await eventsResponse.json();
        setEvents(
          (eventsData.data || []).map((event: any) => ({
            id: event.id,
            title: event.title,
            budget: event.budget,
            type_id: event.id_type,
          }))
        );

        const vendorsResponse = await fetch('http://localhost/pfe/backend/src/api/vendor.php');
        if (!vendorsResponse.ok) {
          const text = await vendorsResponse.text();
          console.error('Vendors response status:', vendorsResponse.status, 'Raw response:', text);
          throw new Error(`HTTP error while fetching vendors! status: ${vendorsResponse.status}`);
        }
        const vendorsData = await vendorsResponse.json();
        setVendors(
          (vendorsData || []).map((vendor: any) => ({
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
  }, []);

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
          console.log('Event API response:', eventData);
          const event = eventData.data?.[0];
          if (event && typeof event.id_type === 'number') {
            setSelectedEventType(event.id_type);
          } else {
            setSelectedEventType(null);
            toast.error('Event type not found in response');
            console.error('Event data missing id_type:', event);
          }
        } catch (error) {
          console.error('Error fetching event type:', error);
          toast.error('Failed to load event type');
          setSelectedEventType(null);
        }
      };
      fetchEventType();
    } else {
      setSelectedEventType(null);
      setVendorPrice(null);
      setSelectedVendor(null);
      setValue('amount', 0);
    }
  }, [eventId, setValue]);

  useEffect(() => {
    console.log('Vendor ID or event type changed:', { vendorId, selectedEventType });
    if (vendorId && selectedEventType) {
      const fetchVendorPrice = async () => {
        try {
          const response = await fetch(`http://localhost/pfe/backend/src/api/vendor.php?id=${vendorId}`);
          if (!response.ok) {
            throw new Error(`HTTP error while fetching vendor! status: ${response.status}`);
          }
          const vendorData = await response.json();
          console.log('Vendor API response:', vendorData);
          if (vendorData && vendorData.prices) {
            const pricePairs: PricePair[] = vendorData.prices.split(',').map((pair: string) => {
              const [typeId, price] = pair.split(':');
              return { typeId, price: parseFloat(price) };
            });
            const price = pricePairs.find((pair) => pair.typeId === selectedEventType.toString())?.price || null;
            setVendorPrice(price);
            setSelectedVendor({ id: vendorData.id, name: vendorData.name, prices: vendorData.prices });
            setValue('amount', price || 0);
            if (!price) {
              console.warn('No price found for event type:', selectedEventType);
              toast.error('No price found for this vendor and event type');
            }
          } else {
            setVendorPrice(null);
            setSelectedVendor(null);
            setValue('amount', 0);
            toast.error('Vendor price data not found');
          }
        } catch (error) {
          console.error('Error fetching vendor price:', error);
          toast.error('Failed to load vendor price');
          setVendorPrice(null);
          setSelectedVendor(null);
          setValue('amount', 0);
        }
      };
      fetchVendorPrice();
    } else {
      setVendorPrice(null);
      setSelectedVendor(null);
      setValue('amount', 0);
    }
  }, [vendorId, selectedEventType, setValue, eventId]);

  const onSubmit: SubmitHandler<TransactionFormValues> = async (data) => {
    console.log('Form data before submission:', data);
    console.log('Derived values:', { vendorPrice, selectedEventType, montant: vendorPrice ?? data.amount ?? 0 });
    try {
      const montant = vendorPrice ?? data.amount ?? 0;
      if (montant <= 0) {
        console.log('Amount validation failed:', { vendorPrice, dataAmount: data.amount });
        throw new Error('Amount must be greater than zero');
      }

      const requestData = {
        event_id: data.eventId,
        titre: data.transactionName,
        montant,
        description: data.notes || null,
        date_limite: data.dueDate || null,
        statut: 'Open',
        vendor_id: data.vendorId,
      };
      console.log('Sending request:', requestData);

      const response = await fetch('http://localhost/pfe/backend/src/api/requetes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      }).catch((error) => {
        console.error('Network error:', error);
        throw new Error('Network error: Failed to reach the server');
      });

      const responseData = await response.json();
      console.log('API response status:', response.status, 'body:', responseData);

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

  if (!events.length || !vendors.length) {
    return <div className="text-red-600">Error: No events or vendors available. Please check the backend.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:pxx-8 py-8">
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <Button type="submit" isLoading={isSubmitting}>
                Add Transaction
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};