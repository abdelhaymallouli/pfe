import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Calendar, UserCheck, FileText, DollarSign, BarChart3, PieChart, TrendingUp, RefreshCw } from 'lucide-react';
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
import { Sidebar } from './Sidebar';

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

interface DashboardStats {
  totalClients: number;
  totalEvents: number;
  totalVendors: number;
  totalRequests: number;
  totalTransactions: number;
  totalRevenue: number;
}

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

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalEvents: 0,
    totalVendors: 0,
    totalRequests: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        navigate('/admin/login');
        return;
      }

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=dashboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const statsResult = await statsResponse.json();
      if (!statsResponse.ok) throw new Error(statsResult.message || 'Failed to load dashboard data');

      const statsData = statsResult.data;
      const totalRevenue = statsData.transactions.reduce(
        (sum: number, transaction: any) => sum + (parseFloat(transaction.montant) || 0),
        0
      );

      setStats({
        totalClients: statsData.clients.length,
        totalEvents: statsData.events.length,
        totalVendors: statsData.vendors.length,
        totalRequests: statsData.requests.length,
        totalTransactions: statsData.transactions.length,
        totalRevenue,
      });

      // Fetch analytics data
      const analyticsResponse = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=getAnalytics', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!analyticsResponse.ok) throw new Error(`Failed to fetch analytics: ${analyticsResponse.statusText}`);
      const analyticsResult = await analyticsResponse.json();
      if (analyticsResult.success) {
        setAnalyticsData(analyticsResult.data);
      } else {
        toast.error(analyticsResult.message || 'Failed to load analytics data');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard');
      if (error.message.includes('Unauthorized')) navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' as const } },
    scales: { y: { beginAtZero: true } },
  };

  const pieOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const } },
  };

  const eventsByStatusData = analyticsData && {
    labels: analyticsData.events_by_status.map((item) => item.status),
    datasets: [
      {
        label: 'Events',
        data: analyticsData.events_by_status.map((item) => item.count),
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)', 'rgba(245, 158, 11, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const eventsByTypeData = analyticsData && {
    labels: analyticsData.events_by_type.map((item) => item.type_name),
    datasets: [
      {
        label: 'Events',
        data: analyticsData.events_by_type.map((item) => item.count),
        backgroundColor: ['rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(249, 115, 22, 0.8)'],
        borderColor: ['rgba(139, 92, 246, 1)', 'rgba(236, 72, 153, 1)', 'rgba(34, 197, 94, 1)', 'rgba(249, 115, 22, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const monthlyRevenueData = analyticsData && {
    labels: analyticsData.monthly_revenue.map((item) => item.month),
    datasets: [
      {
        label: 'Revenue ($)',
        data: analyticsData.monthly_revenue.map((item) => parseFloat(item.revenue.toString())),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const requestsByStatusData = analyticsData && {
    labels: analyticsData.requests_by_status.map((item) => item.status),
    datasets: [
      {
        label: 'Requests',
        data: analyticsData.requests_by_status.map((item) => item.count),
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      },
    ],
  };

  const topVendorsData = analyticsData && {
    labels: analyticsData.top_vendors.slice(0, 5).map((vendor) => vendor.name),
    datasets: [
      {
        label: 'Rating',
        data: analyticsData.top_vendors.slice(0, 5).map((vendor) => parseFloat(vendor.rating.toString())),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Overview of platform activities</p>
          </div>
          <Button variant="outline" onClick={fetchDashboardData} leftIcon={<RefreshCw size={16} />}>
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Clients</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalClients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Events</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalVendors}</p>
                </div>
                <UserCheck className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Requests</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalRequests}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {eventsByStatusData && (
            <Card>
              <CardHeader>
                <CardTitle>Events by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Pie data={eventsByStatusData} options={pieOptions} />
              </CardContent>
            </Card>
          )}
          {eventsByTypeData && (
            <Card>
              <CardHeader>
                <CardTitle>Events by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Doughnut data={eventsByTypeData} options={pieOptions} />
              </CardContent>
            </Card>
          )}
          {monthlyRevenueData && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={monthlyRevenueData} options={chartOptions} />
              </CardContent>
            </Card>
          )}
          {requestsByStatusData && (
            <Card>
              <CardHeader>
                <CardTitle>Requests by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={requestsByStatusData} options={chartOptions} />
              </CardContent>
            </Card>
          )}
          {topVendorsData && (
            <Card>
              <CardHeader>
                <CardTitle>Top Vendors by Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={topVendorsData} options={chartOptions} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};