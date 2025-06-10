import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Search, RefreshCw, Eye, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface Request {
  id_request: string;
  title: string;
  description: string;
  status: 'Open' | 'Under Consideration' | 'Completed' | 'Cancelled';
  amount: number;
  transaction_date: string;
  event_title: string;
  client_name: string;
  vendor_name?: string;
}

export const RequestManagement = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem('adminToken');
          if (!token) {
            toast.error('Authentication token not found. Please log in again.');
            setIsLoading(false);
            return;
          }
      const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=getRequests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }); // Assuming an admin API endpoint for requests
      if (!response.ok) {
        throw new Error(`Failed to fetch requests: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        toast.error(data.message || 'Failed to load requests');
      }
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast.error(error.message || 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewRequest = (requestId: string) => {
    // Implement view functionality
    toast.info(`View request with ID: ${requestId}`);
    console.log('View request', requestId);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
        const token = localStorage.getItem('adminToken');
          if (!token) {
            toast.error('Authentication token not found. Please log in again.');
            setIsLoading(false);
            return;
          }
      const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=updateRequestStatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id_request: requestId, status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Request status updated successfully');
        fetchRequests(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to update request status');
      }
    } catch (error: any) {
      console.error('Error updating request status:', error);
      toast.error(error.message || 'Failed to update request status');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'Under Consideration':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalAmount = () => {
    return filteredRequests.reduce((total, request) => total + (request.amount || 0), 0);
  };

  const getStatusCounts = () => {
    const counts = { Open: 0, 'Under Consideration': 0, Completed: 0, Cancelled: 0 };
    filteredRequests.forEach(request => {
      counts[request.status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return <div className="text-center py-8">Loading Requests...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-6">
        <Link to="/admin/dashboard" className="mr-4">
          <Button variant="outline" leftIcon={<ArrowLeft size={20} />}>
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Request & Transaction Management</h1>
              <p className="mt-1 text-sm text-gray-500">Monitor and manage all service requests and transactions</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={fetchRequests} leftIcon={<RefreshCw size={16} />}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredRequests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-blue-500">Open</p>
              <p className="text-2xl font-semibold text-blue-900">{statusCounts.Open}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-yellow-500">Under Consideration</p>
              <p className="text-2xl font-semibold text-yellow-900">{statusCounts['Under Consideration']}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-green-500">Completed</p>
              <p className="text-2xl font-semibold text-green-900">{statusCounts.Completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(getTotalAmount())}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search requests by title, event, or client..."
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
          <option value="Under Consideration">Under Consideration</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <p className="text-center text-gray-500">No requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map(request => (
                    <tr key={request.id_request}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.event_title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.client_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(request.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadgeColor(request.status)}>
                          {request.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleViewRequest(request.id_request)} leftIcon={<Eye size={16} />}>
                          View
                        </Button>
                        {request.status === 'Open' && (
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(request.id_request, 'Under Consideration')} leftIcon={<CheckCircle size={16} />} className="text-yellow-600 hover:text-yellow-900">
                            Consider
                          </Button>
                        )}
                        {request.status === 'Under Consideration' && (
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(request.id_request, 'Completed')} leftIcon={<CheckCircle size={16} />} className="text-green-600 hover:text-green-900">
                            Complete
                          </Button>
                        )}
                        {(request.status === 'Open' || request.status === 'Under Consideration') && (
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(request.id_request, 'Cancelled')} leftIcon={<XCircle size={16} />} className="text-red-600 hover:text-red-900">
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

