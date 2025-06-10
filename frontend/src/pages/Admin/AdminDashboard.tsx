import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Calendar, UserCheck, FileText, DollarSign, Settings, BarChart3, PieChart } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalClients: number;
  totalEvents: number;
  totalVendors: number;
  totalRequests: number;
  totalTransactions: number;
  totalRevenue: number;
}

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalClients: 0,
        totalEvents: 0,
        totalVendors: 0,
        totalRequests: 0,
        totalTransactions: 0,
        totalRevenue: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        const fetchDashboardStats = async () => {
            try {
                const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=dashboard', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to load data');
                
                // Calculate stats from the data
                const data = result.data;
                const totalRevenue = data.transactions.reduce((sum: number, transaction: any) => {
                    return sum + (parseFloat(transaction.montant) || 0);
                }, 0);

                setStats({
                    totalClients: data.clients.length,
                    totalEvents: data.events.length,
                    totalVendors: data.vendors.length,
                    totalRequests: data.requests.length,
                    totalTransactions: data.transactions.length,
                    totalRevenue: totalRevenue
                });
            } catch (error: any) {
                toast.error(error.message || 'Failed to load dashboard');
                if (error.message.includes('Unauthorized')) {
                    navigate('/admin/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardStats();
    }, [navigate]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading Dashboard...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Welcome to the VenuVibe administration panel</p>
                </div>
                <Link to="/admin/settings">
                    <Button variant="outline" leftIcon={<Settings size={20} />}>
                        Settings
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Clients</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalClients}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Events</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                <UserCheck className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalVendors}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalRequests}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalTransactions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                        <p className="text-sm text-gray-500">Manage client accounts and user data</p>
                    </CardHeader>
                    <CardContent>
                        <Link to="/admin/users">
                            <Button className="w-full" leftIcon={<Users size={20} />}>
                                Manage Users
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Event Management</h3>
                        <p className="text-sm text-gray-500">Oversee all events on the platform</p>
                    </CardHeader>
                    <CardContent>
                        <Link to="/admin/events">
                            <Button className="w-full" leftIcon={<Calendar size={20} />}>
                                Manage Events
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Vendor Management</h3>
                        <p className="text-sm text-gray-500">Manage service providers and vendors</p>
                    </CardHeader>
                    <CardContent>
                        <Link to="/admin/vendors">
                            <Button className="w-full" leftIcon={<UserCheck size={20} />}>
                                Manage Vendors
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Category Management</h3>
                        <p className="text-sm text-gray-500">Manage event types and categories</p>
                    </CardHeader>
                    <CardContent>
                        <Link to="/admin/categories">
                            <Button className="w-full" leftIcon={<PieChart size={20} />}>
                                Manage Categories
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Request Management</h3>
                        <p className="text-sm text-gray-500">Monitor and manage service requests</p>
                    </CardHeader>
                    <CardContent>
                        <Link to="/admin/requests">
                            <Button className="w-full" leftIcon={<FileText size={20} />}>
                                Manage Requests
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                        <p className="text-sm text-gray-500">View platform analytics and reports</p>
                    </CardHeader>
                    <CardContent>
                        <Link to="/admin/analytics">
                            <Button className="w-full" leftIcon={<BarChart3 size={20} />} variant="outline">
                                View Analytics
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

