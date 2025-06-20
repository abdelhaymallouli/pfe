import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Wallet, 
  Clock,
  PlusCircle,
  ChevronRight,
  BarChart4
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatCurrency } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  event_date: string; 
  location: string;
  status: string;
  banner_image: string | null; 
  expected_guests: number; 
  budget: number;
  id_client: string; 
}

interface Task {
  id: string;
  title: string;
  deadline: string | null; 
  status: string; 
  event_id: string;
  amount: number | null; 
  vendor_name: string | null;
}
interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalGuests: number;
  totalBudget: number;
  completedTasks: number;
  pendingTasks: number;
}

interface TransactionSummary {
  total: number;
  spent: number;
  remaining: number;
  progress: number;
}

export const Dashboard = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    totalGuests: 0,
    totalBudget: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary>({
    total: 0,
    spent: 0,
    remaining: 0,
    progress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
      toast.error('You must be logged in to view the dashboard.');
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
  setIsLoading(true);
  try {
    if (!currentUser?.id) {
      throw new Error('User ID is missing');
    }

    // Fetch events for the current user
    const eventsResponse = await fetch(`http://localhost/pfe/backend/src/api/events.php?id_client=${currentUser.id}`);
    if (!eventsResponse.ok) {
      const text = await eventsResponse.text();
      console.error('Events response status:', eventsResponse.status, 'Raw response:', text);
      throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
    }
    const eventsData = await eventsResponse.json();
    console.log('Events API response:', eventsData);
    if (!eventsData.success || !Array.isArray(eventsData.data)) {
      throw new Error('Invalid events data format');
    }

    // Format events
    const formattedEvents: Event[] = eventsData.data.map((event: any) => ({
      id: event.id.toString(), // Ensure string ID
      title: event.title,
      event_date: event.event_date,
      location: event.location || 'Not specified',
      status: event.status.toLowerCase(),
      banner_image: event.banner_image || null,
      expected_guests: parseInt(event.expected_guests) || 0,
      budget: parseFloat(event.budget) || 0,
      id_client: event.id_client.toString(),
    }));

    // Fetch tasks (requetes) for each event
    let allTasks: Task[] = [];
    for (const event of formattedEvents) {
      const tasksResponse = await fetch(
        `http://localhost/pfe/backend/src/api/requests.php?id_event=${event.id}&id_client=${currentUser.id}`
      );
      if (!tasksResponse.ok) {
        console.warn(`Failed to fetch tasks for event ${event.id}: ${tasksResponse.status}`);
        continue;
      }
      const tasksData = await tasksResponse.json();
      console.log(`Tasks API response for event ${event.id}:`, tasksData);
      if (tasksData.success && Array.isArray(tasksData.data)) {
        const formattedTasks: Task[] = tasksData.data.map((task: any) => ({
          id: (task.id_request || task.id).toString(),
          title: task.title,
          deadline: task.deadline || null,
          status: task.status,
          event_id: event.id,
          amount: task.amount ? parseFloat(task.amount) : null,
          vendor_name: task.vendor_name ? `Vendor ${task.vendor_name}` : null, // Placeholder, adjust as needed
        }));
        allTasks = [...allTasks, ...formattedTasks];
      }
    }

    // Calculate stats
    const today = new Date();
    const totalGuests = formattedEvents.reduce((sum, e) => sum + e.expected_guests, 0);
    const totalBudget = formattedEvents.reduce((sum, e) => sum + e.budget, 0);
    const upcomingEvents = formattedEvents.filter(
      (e) => new Date(e.event_date) > today
    ).length;
    const completedTasks = allTasks.filter((t) => t.status === 'Completed').length;
    const pendingTasks = allTasks.filter(
      (t) => t.status === 'Open' || t.status === 'In Progress'
    ).length;

    // Transaction calculations
    let totalSpent = 0;
    allTasks.forEach((task) => {
      if (task.amount) {
        totalSpent += task.amount;
      }
    });

    setEvents(formattedEvents);
    setTasks(allTasks);
    setStats({
      totalEvents: formattedEvents.length,
      upcomingEvents,
      totalGuests,
      totalBudget,
      completedTasks,
      pendingTasks,
    });
    setTransactionSummary({
      total: totalBudget,
      spent: totalSpent,
      remaining: totalBudget - totalSpent,
      progress: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to load dashboard data');
  } finally {
    setIsLoading(false);
  }
};

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planned':
        return 'primary';
      case 'ongoing':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getTaskStatusVariant = (statut: string) => {
    switch (statut) {
      case 'Open':
        return 'primary';
      case 'In Progress':
        return 'secondary';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'primary';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome back, {currentUser?.username?.split('@')[0] || 'User'}! Here's what's happening with your events.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-md bg-primary-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.upcomingEvents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-md bg-secondary-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Guests</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalGuests.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-md bg-success-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Budget</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalBudget)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-md bg-warning-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Requetes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {`${stats.completedTasks}/${stats.completedTasks + stats.pendingTasks}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
          <Link to="/events/new">
            <Button size="sm" leftIcon={<PlusCircle size={16} />}>
              Create Event
            </Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">No upcoming events found. Create a new event to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events
              .filter((event) => new Date(event.event_date) > new Date())
              .slice(0, 3)
              .map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="h-40 bg-gray-200 relative">
                    {event.banner_image ? (
                      <img
                        src={event.banner_image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">{event.title[0]}</span>
                      </div>
                    )}
                    <Badge
                      variant={getStatusColor(event.status)}
                      className="absolute top-3 right-3"
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-1 text-gray-900">{event.title}</h3>
                    <div className="text-sm text-gray-500 mb-2">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(event.event_date, 'PPP')}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/events/${event.id}`}
                        className="flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View details <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        <div className="mt-4 text-center">
          <Link to="/events">
            <Button variant="outline">View all events</Button>
          </Link>
        </div>
      </div>

      {/* Transaction Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Transaction Overview</h2>
          <Link to="/transactions">
            <Button variant="outline" size="sm" leftIcon={<BarChart4 size={16} />}>
              Transaction Details
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
                {tasks.filter((task) => task.amount).length === 0 ? (
                  <p className="text-gray-600">No transactions found.</p>
                ) : (
                  <div className="space-y-3">
                    {tasks
                      .filter((task) => task.amount)
                      .slice(0, 5)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{task.title}</p>
                            <p className="text-xs text-gray-500">
                              {task.vendor_name || 'Unknown Vendor'}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-700">
                            {formatCurrency(task.amount!)}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Transaction Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Total Budget</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(transactionSummary.total)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Amount Spent</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(transactionSummary.spent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Remaining</span>
                      <span className="text-sm font-medium text-success-600">
                        {formatCurrency(transactionSummary.remaining)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">Budget Progress</span>
                      <span className="text-xs font-medium text-gray-500">
                        {transactionSummary.progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${transactionSummary.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>  
    </div>
  );
};