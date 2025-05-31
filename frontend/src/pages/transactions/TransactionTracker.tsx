import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, PieChart, BarChart, Download, Upload, ChevronDown, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  budget: number | null;
}

interface Requete {
  id: string;
  titre: string;
  description: string | null;
  date_limite: string | null;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  transaction_montant: number | null;
  transaction_date: string | null;
}

interface EventWithRequetes {
  event: Event;
  requetes: Requete[];
}

export const TransactionTracker = () => {
  const [eventsWithRequetes, setEventsWithRequetes] = useState<EventWithRequetes[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    const fetchEventsAndRequetes = async () => {
      setIsLoading(true);
      try {
        // Fetch all events
        const eventsResponse = await fetch('http://localhost/pfe/backend/src/api/events.php');
        const eventsText = await eventsResponse.text();

        if (!eventsResponse.ok) {
          throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
        }

        const eventsData = JSON.parse(eventsText);
        let events = eventsData.data || [];

        // Fetch requetes for each event
        const eventsWithRequetes = await Promise.all(
          events.map(async (event: Event) => {
            const requetesResponse = await fetch(
              `http://localhost/pfe/backend/src/api/requetes.php?event_id=${event.id}`
            );
            const requetesText = await requetesResponse.text();

            if (!requetesResponse.ok) {
              throw new Error(`Failed to fetch requetes for event ${event.id}: ${requetesResponse.status}`);
            }

            const requetesData = JSON.parse(requetesText);
            return {
              event,
              requetes: requetesData.data.map((req: any) => ({
                ...req,
                status: req.statut, // Map 'statut' to 'status'
              })) || [],
            };
          })
        );

        setEventsWithRequetes(eventsWithRequetes);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error.message || 'Failed to load events and requetes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventsAndRequetes();
  }, []);

  const toggleEvent = (eventId: string) => {
    setExpandedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleUpdateStatus = async (requeteId: string, newStatus: 'Open' | 'In Progress' | 'Completed' | 'Cancelled') => {
    console.log('Updating status:', { requeteId, newStatus });
    try {
      const response = await fetch('http://localhost/pfe/backend/src/api/requetes.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_requete: requeteId,
          statut: newStatus,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to update requete status: ${response.statusText}`);
      }

      setEventsWithRequetes(prev => {
        const newState = prev.map(eventWithReq => ({
          ...eventWithReq,
          requetes: eventWithReq.requetes.map(req =>
            String(req.id) === String(requeteId) ? { ...req, status: newStatus } : req
          ),
        }));
        console.log('New state:', JSON.stringify(newState, null, 2));
        return newState;
      });
      toast.success('Requete status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.message.includes('Failed to fetch')
        ? 'Failed to update status due to network or CORS issue. Please check server configuration.'
        : `Failed to update requete status: ${error.message}`;
      toast.error(errorMessage);
    }
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
          const montant = Number(req.transaction_montant) || 0;
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
      const montant = Number(req.transaction_montant) || 0;
      return sum + montant;
    }, 0);
  };

  // Filter events based on search query
  const filteredEvents = eventsWithRequetes.filter(({ event }) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply status filter to requetes
  const getFilteredRequetes = (requetes: Requete[]) => {
    if (statusFilter === 'All') return requetes;
    return requetes.filter(req => req.status === statusFilter);
  };

  if (isLoading) {
    return <div>Loading...</div>;
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
            <Button leftIcon={<DollarSign size={20} />}>
              Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search events by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
            <div className="flex items-center justify-between">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
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
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {filteredEvents.map(({ event, requetes }) => {
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
                    <Badge variant="secondary" className="ml-4">
                      {filteredRequetes.length} requests
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
                    {filteredRequetes.length === 0 ? (
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
                              <th className="text-right text-sm font-medium text-gray-500">Spent</th>
                              <th className="text-right text-sm font-medium text-gray-500">Transaction Date</th>
                              <th className="text-right text-sm font-medium text-gray-500">Status</th>
                              <th className="text-right text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredRequetes.map((requete) => (
                              <tr key={requete.id}>
                                <td className="py-4">
                                  <div>
                                    <p className="font-medium text-gray-900">{requete.titre}</p>
                                    {requete.date_limite && (
                                      <p className="text-sm text-gray-500">
                                        Due: {new Date(requete.date_limite).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 text-right">
                                  <p className="text-gray-900">
                                    {requete.transaction_montant !== null
                                      ? formatCurrency(requete.transaction_montant)
                                      : 'N/A'}
                                  </p>
                                </td>
                                <td className="py-4 text-right">
                                  <p className="text-gray-900">
                                    {requete.transaction_date
                                      ? new Date(requete.transaction_date).toLocaleDateString()
                                      : 'N/A'}
                                  </p>
                                </td>
                                <td className="py-4 text-right">
                                  <select
                                    value={requete.status}
                                    onChange={(e) => handleUpdateStatus(requete.id, e.target.value as 'Open' | 'In Progress' | 'Completed' | 'Cancelled')}
                                    className="rounded-md border-gray-300 text-sm"
                                  >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="py-4 text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUpdateStatus(requete.id, requete.status === 'Completed' ? 'Open' : 'Completed')}
                                  >
                                    {requete.status === 'Completed' ? 'Mark as Open' : 'Mark as Completed'}
                                  </Button>
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