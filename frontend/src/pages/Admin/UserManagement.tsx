import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface User {
  id_client: string;
  name: string;
  email: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=getUsers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error(data.message || 'Failed to load users');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${userId}?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=deleteUser&id_client=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading Users...</div>;
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
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="mt-1 text-sm text-gray-500">Manage client accounts and user data</p>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" onClick={fetchUsers} leftIcon={<RefreshCw size={16} />}>
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id_client}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id_client)}
                            leftIcon={<Trash2 size={16} />}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </Button>
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
    </div>
  );
};