import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, PieChart, BarChart, ChevronDown, Search, ArrowLeft, RefreshCw, Circle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  budget: number | null;
}

interface Requete {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  amount: number | null;
  transaction_date: string | null;
}

interface EventWithRequetes {
  event: Event;
  requetes: Requete[];
  error?: string;
}

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return 'text-blue-500';
    case 'in progress':
      return 'text-yellow-500';
    case 'completed':
      return 'text-green-500';
    case 'cancelled':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const TransactionTracker = () => {
  const { currentUser } = useAuth();
  const [eventsWithRequetes, setEventsWithRequetes] = useState<EventWithRequetes[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const fetchEventsAndRequetes = useCallback(async () => {
    if (!currentUser?.id) {
      toast.error('You must be logged in to view transactions.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const eventsResponse = await fetch(`http://localhost/pfe/backend/src/api/events.php?id_client=${currentUser.id}`);
      if (!eventsResponse.ok) {
        throw new Error(`Failed to fetch events: ${eventsResponse.status} ${eventsResponse.statusText}`);
      }
      const eventsResponseClone = eventsResponse.clone();
      let eventsData;
      try {
        eventsData = await eventsResponse.json();
      } catch (e) {
        const text = await eventsResponseClone.text();
        console.error('Invalid JSON from events:', text, e);
        throw new Error('Invalid JSON response from events');
      }
      const events = Array.isArray(eventsData.data) ? eventsData.data : [];

      const eventsWithRequetesPromises = events.map(async (event: Event) => {
        try {
          const requetesResponse = await fetch(
            `http://localhost/pfe/backend/src/api/requests.php?id_event=${event.id}&id_client=${currentUser.id}`
          );
          if (!requetesResponse.ok) {
            throw new Error(`Failed to fetch requetes: ${requetesResponse.statusText}`);
          }
          const requetesResponseClone = requetesResponse.clone();
          let requetesData;
          try {
            requetesData = await requetesResponse.json();
          } catch (e) {
            const text = await requetesResponseClone.text();
            console.error(`Invalid JSON from requetes for event ${event.id}:`, text, e);
            return { event, requetes: [], error: 'Failed to load requests due to invalid server response' };
          }
          if (!requetesData.success) {
            return { event, requetes: [], error: requetesData.message || 'Failed to load requests' };
          }
          const requetes = Array.isArray(requetesData.data)
            ? requetesData.data.map((req: any) => ({
                id: String(req.id_request || req.id || ''),
                title: req.title || 'Untitled',
                description: req.description || null,
                deadline: req.deadline || null,
                status: ['Open', 'In Progress', 'Completed', 'Cancelled'].includes(req.status)
                  ? req.status
                  : 'Open',
                amount: req.amount != null ? parseFloat(req.amount) : null,
                transaction_date: req.transaction_date || null,
              }))
            : [];
          return { event, requetes };
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : 'Unknown error';
          console.error(`Error fetching requetes for event ${event.id}:`, e);
          return { event, requetes: [], error: errorMessage };
        }
      });

      const results = await Promise.all(eventsWithRequetesPromises);
      setEventsWithRequetes(results);
      const failedEvents = results.filter(r => r.error).map(r => r.event.title);
      if (failedEvents.length > 0) {
        toast.error(`Failed to load requests for: ${failedEvents.join(', ')}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching events:', error);
      toast.error(errorMessage || 'Failed to load events and requests');
      setEventsWithRequetes([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchEventsAndRequetes();
  }, [fetchEventsAndRequetes]);

  const retryFetchEvent = async (eventId: string) => {
    if (!currentUser?.id) {
      toast.error('You must be logged in to retry loading requests.');
      return;
    }
    try {
      const requetesResponse = await fetch(
        `http://localhost/pfe/backend/src/api/requests.php?id_event=${eventId}&id_client=${currentUser.id}`
      );
      if (!requetesResponse.ok) {
        throw new Error(`Failed to fetch requetes: ${requetesResponse.statusText}`);
      }
      const requetesData = await requetesResponse.json();
      if (!requetesData.success) {
        throw new Error(requetesData.message || 'Failed to load requests');
      }
      const requetes = Array.isArray(requetesData.data)
        ? requetesData.data.map((req: any) => ({
            id: String(req.id_request || req.id || ''),
            title: req.title || 'Untitled',
            description: req.description || null,
            deadline: req.deadline || null,
            status: ['Open', 'In Progress', 'Completed', 'Cancelled'].includes(req.status)
              ? req.status
              : 'Open',
            amount: req.amount != null ? parseFloat(req.amount) : null,
            transaction_date: req.transaction_date || null,
          }))
        : [];
      setEventsWithRequetes(prev =>
        prev.map(item =>
          item.event.id === eventId ? { ...item, requetes, error: undefined } : item
        )
      );
      toast.success(`Requests for event reloaded successfully`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Retry failed for event ${eventId}:`, error);
      toast.error(`Failed to reload requests: ${errorMessage}`);
    }
  };

  const toggleEvent = (eventId: string) => {
    setExpandedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const getTotalBudget = () => {
    return eventsWithRequetes.reduce((total, eventWithReq) => {
      const budget = Number(eventWithReq.event.budget) || 0;
      return total + budget;
    }, 0);
  };

  const getTotalSpent = () => {
    return eventsWithRequetes.reduce((total, eventWithReq) => {
      return (
        total +
        eventWithReq.requetes.reduce((sum, req) => {
          const montant = Number(req.amount) || 0;
          return sum + montant;
        }, 0)
      );
    }, 0);
  };

  const getTotalRemaining = () => {
    return getTotalBudget() - getTotalSpent();
  };

  const getProgressPercentage = () => {
    const totalBudget = getTotalBudget();
    return totalBudget ? Math.round((getTotalSpent() / totalBudget) * 100) : 0;
  };

  const getEventSpent = (requetes: Requete[]) => {
    return requetes.reduce((sum, req) => {
      const montant = Number(req.amount) || 0;
      return sum + montant;
    }, 0);
  };

  const filteredEvents = eventsWithRequetes.filter(({ event }) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilteredRequetes = (requetes: Requete[]) => {
    if (statusFilter === 'All') return requetes;
    return requetes.filter(req => req.status === statusFilter);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">No Events Found</h2>
          <p className="mt-2 text-gray-600">
            {searchQuery ? 'No events match your search.' : 'No events or requests found.'}
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Tracker</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage your event transactions</p>
        </div>
        <div className="flex space-x-4">
          <Link to="/transactions/new">
            <Button leftIcon={<DollarSign size={20} />}>Add Transaction</Button>
          </Link>
          <Button variant="outline" onClick={fetchEventsAndRequetes} leftIcon={<RefreshCw size={16} />}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search events by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-10 px-3"
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Budget</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(getTotalBudget())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-secondary-100 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(getTotalSpent())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-success-100 flex items-center justify-center">
                <BarChart className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Remaining</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(getTotalRemaining())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-warning-100 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overall Progress</p>
                <p className="text-xl font-semibold text-gray-900">
                  {getProgressPercentage()}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {filteredEvents.map(({ event, requetes, error }) => {
          const filteredRequetes = getFilteredRequetes(requetes);
          return (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleEvent(event.id)}
                >
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <Badge variant={error ? 'error' : 'secondary'} className="ml-4">
                      {error ? 'Error' : `${filteredRequetes.length} requests`}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-medium">{formatCurrency(Number(event.budget) || 0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Spent</p>
                      <p className="font-medium">{formatCurrency(getEventSpent(filteredRequetes))}</p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transform transition-transform ${
                        expandedEvents.includes(event.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {expandedEvents.includes(event.id) && (
                  <div className="mt-6">
                    {error ? (
                      <div className="text-center">
                        <p className="text-red-600">{error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => retryFetchEvent(event.id)}
                          leftIcon={<RefreshCw size={16} />}
                        >
                          Retry Loading Requests
                        </Button>
                      </div>
                    ) : filteredRequetes.length === 0 ? (
                      <p className="text-gray-500 text-center">
                        {statusFilter === 'All'
                          ? 'No requests for this event.'
                          : `No ${statusFilter.toLowerCase()} requests for this event.`}{' '}
                        <Link to={`/events/${event.id}/requests/new`} className="text-blue-600 hover:underline">
                          Add a new request
                        </Link>
                      </p>
                    ) : (
                      <div className="border-t border-gray-200 -mx-6 px-6 pt-4">
                        <table className="min-w-full">
                          <thead>
                            <tr>
                              <th className="text-left text-sm font-medium text-gray-500">Request</th>
                              <th className="text-sm font-medium text-gray-500">Spent</th>
                              <th className="text-sm font-medium text-gray-500">Transaction Date</th>
                              <th className="text-sm font-medium text-gray-500">ID</th>
                              <th className="text-right text-sm font-medium text-gray-500">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredRequetes.map((requete) => (
                              <tr key={requete.id}>
                                <td className="py-4">
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">{requete.title}</p>
                                    {requete.deadline && (
                                      <p className="text-sm text-gray-500">
                                        Due: {new Date(requete.deadline).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 text-center">
                                  <p className="text-gray-900 text-sm">
                                    {formatCurrency(requete.amount ?? 0)}
                                  </p>
                                </td>
                                <td className="py-4 text-center">
                                  <p className="text-gray-900 text-sm">
                                    {requete.transaction_date
                                      ? new Date(requete.transaction_date).toLocaleDateString()
                                      : 'N/A'}
                                  </p>
                                </td>
                                <td className="py-4 text-center">
                                  <p className="text-gray-900 text-sm">{requete.id}</p>
                                </td>
                                <td className="py-4 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    {requete.status === 'Open' && <Circle className={`h-4 w-4 ${getStatusColor(requete.status)}`} />}
                                    {requete.status === 'In Progress' && <Clock className={`h-4 w-4 ${getStatusColor(requete.status)}`} />}
                                    {requete.status === 'Completed' && <CheckCircle className={`h-4 w-4 ${getStatusColor(requete.status)}`} />}
                                    {requete.status === 'Cancelled' && <XCircle className={`h-4 w-4 ${getStatusColor(requete.status)}`} />}
                                    <p className={`text-sm ${getStatusColor(requete.status)}`}>{requete.status}</p>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};