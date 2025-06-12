import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Search, RefreshCw, Eye, CheckCircle, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import { Sidebar } from './Sidebar';

export interface Request {
  id_request: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
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
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch requests: ${response.statusText}`);
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        toast.error(data.message || 'Failed to load requests');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=updateRequestStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id_request: requestId, status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Request status updated successfully');
        fetchRequests();
        setIsModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to update request status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update request status');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm(`Are you sure you want to delete request ${requestId}?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=deleteRequest&id_request=${requestId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Request deleted successfully');
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to delete request');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete request');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
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
  return filteredRequests.reduce((total, request) => {
    const amount = parseFloat(request.amount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
};


  const getStatusCounts = () => {
    const counts = { Open: 0, 'In Progress': 0, Completed: 0, Cancelled: 0 };
    filteredRequests.forEach((request) => {
      counts[request.status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return <div className="text-center py-8">Loading Requests...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
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
              <Button variant="outline" onClick={fetchRequests} leftIcon={<RefreshCw size={16} />}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredRequests.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-blue-500">Open</p>
              <p className="text-2xl font-semibold text-blue-900">{statusCounts.Open}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-yellow-500">In Progress</p>
              <p className="text-2xl font-semibold text-yellow-900">{statusCounts['In Progress']}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-green-500">Completed</p>
              <p className="text-2xl font-semibold text-green-900">{statusCounts.Completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">{(getTotalAmount())}$</p>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm text-sm h-10 px-3"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
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
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id_request}>
                        <td className="px-3 py-4 text-sm font-medium text-gray-900">{request.title}</td>
                        <td className="px-3 py-4 text-sm text-gray-500">{request.event_title}</td>
                        <td className="px-3 py-4 text-sm text-gray-500">{request.client_name}</td>
                        <td className="px-3 py-4 text-sm text-gray-500">{request.vendor_name || 'N/A'}</td>
                        <td className="px-3 py-4 text-sm text-gray-500">{(request.amount)}</td>
                        <td className="px-3 py-4">
                          <Badge className={getStatusBadgeColor(request.status)}>{request.status}</Badge>
                        </td>
                        <td className="px-3 py-4 text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                            leftIcon={<Eye size={16} />}
                          >
                            View
                          </Button>
                          {request.status === 'Open' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(request.id_request, 'In Progress')}
                                leftIcon={<CheckCircle size={16} />}
                                className="text-yellow-600 hover:text-yellow-700"
                              >
                                Start Progress
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(request.id_request, 'Cancelled')}
                                leftIcon={<XCircle size={16} />}
                                className="text-red-600 hover:text-red-700"
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {request.status === 'In Progress' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(request.id_request, 'Completed')}
                                leftIcon={<CheckCircle size={16} />}
                                className="text-green-600 hover:text-green-700"
                              >
                                Complete
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(request.id_request, 'Cancelled')}
                                leftIcon={<XCircle size={16} />}
                                className="text-red-600 hover:text-red-700"
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {(request.status === 'Completed' || request.status === 'Cancelled') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRequest(request.id_request)}
                              leftIcon={<Trash2 size={16} />}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
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

        {/* Modal for Viewing Request Details */}
        {isModalOpen && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Request Title</label>
                  <p className="text-gray-900">{selectedRequest.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{selectedRequest.description || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Event</label>
                  <p className="text-gray-900">{selectedRequest.event_title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Client</label>
                  <p className="text-gray-900">{selectedRequest.client_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vendor</label>
                  <p className="text-gray-900">{selectedRequest.vendor_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-gray-900">{(selectedRequest.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900">
                    <Badge className={getStatusBadgeColor(selectedRequest.status)}>
                      {selectedRequest.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction Date</label>
                  <p className="text-gray-900">{selectedRequest.transaction_date || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                {selectedRequest.status === 'Completed' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedRequest.id_request, 'Open')}
                    leftIcon={<CheckCircle size={16} />}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Reopen Request
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};