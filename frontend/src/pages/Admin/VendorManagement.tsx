import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, UserPlus, Edit, Trash2, RefreshCw, Star } from 'lucide-react';

interface Vendor {
  id_vendor: string;
  nom: string;
  email: string;
  phone: string;
  note: number;
  // Add other vendor properties as needed
}

export const VendorManagement = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=getVendors'); // Assuming an admin API endpoint for vendors
      if (!response.ok) {
        throw new Error(`Failed to fetch vendors: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      } else {
        toast.error(data.message || 'Failed to load vendors');
      }
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast.error(error.message || 'Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const filteredVendors = vendors.filter(vendor =>
    vendor.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditVendor = (vendorId: string) => {
    // Implement edit functionality
    toast.info(`Edit vendor with ID: ${vendorId}`);
    console.log('Edit vendor', vendorId);
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!window.confirm(`Are you sure you want to delete vendor ${vendorId}?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=delete_vendor`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_vendor: vendorId }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Vendor deleted successfully');
        fetchVendors(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to delete vendor');
      }
    } catch (error: any) {
      console.error('Error deleting vendor:', error);
      toast.error(error.message || 'Failed to delete vendor');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading Vendors...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage service providers and vendors</p>
        </div>
        <div className="flex space-x-4">
          <Button leftIcon={<UserPlus size={20} />}>Add New Vendor</Button>
          <Button variant="outline" onClick={fetchVendors} leftIcon={<RefreshCw size={16} />}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="relative flex-1 mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search vendors by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVendors.length === 0 ? (
            <p className="text-center text-gray-500">No vendors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.map(vendor => (
                    <tr key={vendor.id_vendor}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {renderStars(vendor.note)}
                          <span className="ml-2 text-sm text-gray-600">({vendor.note}/5)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleEditVendor(vendor.id_vendor)} leftIcon={<Edit size={16} />}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteVendor(vendor.id_vendor)} leftIcon={<Trash2 size={16} />} className="text-red-600 hover:text-red-900">
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
  );
};

