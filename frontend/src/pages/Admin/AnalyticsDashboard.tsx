import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Building, 
  DollarSign, 
  TrendingUp, 
  Activity,
  RefreshCw
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  total_clients: number;
  total_events: number;
  total_vendors: number;
  total_requests: number;
  total_revenue: number;
  events_by_status: Array<{ status: string; count: number }>;
  events_by_type: Array<{ type_name: string; count: number }>;
  monthly_revenue: Array<{ month: string; revenue: number }>;
  requests_by_status: Array<{ status: string; count: number }>;
  top_vendors: Array<{ name: string; rating: number }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=getAnalytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetching analytics data from API...');
      console.log('API Response:', response);
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        toast.error(data.message || 'Failed to load analytics data');
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error(error.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load analytics data</p>
          <Button onClick={fetchAnalyticsData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Chart configurations
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  // Events by Status Chart
  const eventsByStatusData = {
    labels: analyticsData.events_by_status.map(item => item.status),
    datasets: [
      {
        label: 'Events',
        data: analyticsData.events_by_status.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Events by Type Chart
  const eventsByTypeData = {
    labels: analyticsData.events_by_type.map(item => item.type_name),
    datasets: [
      {
        label: 'Events',
        data: analyticsData.events_by_type.map(item => item.count),
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Monthly Revenue Chart
  const monthlyRevenueData = {
    labels: analyticsData.monthly_revenue.map(item => item.month),
    datasets: [
      {
        label: 'Revenue ($)',
        data: analyticsData.monthly_revenue.map(item => parseFloat(item.revenue.toString())),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Requests by Status Chart
  const requestsByStatusData = {
    labels: analyticsData.requests_by_status.map(item => item.status),
    datasets: [
      {
        label: 'Requests',
        data: analyticsData.requests_by_status.map(item => item.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  // Top Vendors Chart
  const topVendorsData = {
    labels: analyticsData.top_vendors.slice(0, 5).map(vendor => vendor.name),
    datasets: [
      {
        label: 'Rating',
        data: analyticsData.top_vendors.slice(0, 5).map(vendor => parseFloat(vendor.rating.toString())),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/admin/dashboard" className="mr-4">
              <Button variant="outline" leftIcon={<ArrowLeft size={20} />}>
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Comprehensive insights into your platform performance
              </p>
            </div>
          </div>
          <Button onClick={fetchAnalyticsData} leftIcon={<RefreshCw size={16} />}>
            Refresh Data
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData.total_clients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData.total_events}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData.total_vendors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData.total_requests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${parseFloat(analyticsData.total_revenue.toString()).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Events by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Events by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Doughnut data={eventsByStatusData} options={pieOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Events by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Events by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Pie data={eventsByTypeData} options={pieOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Requests by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Requests by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={requestsByStatusData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Top Vendors by Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Top Vendors by Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={topVendorsData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <Line data={monthlyRevenueData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

