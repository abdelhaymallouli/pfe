import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, UserPlus, Edit, Trash2, RefreshCw, Star, ArrowLeft, Eye, XCircle } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface Vendor {
  id_vendor: string;
  nom: string;
  email: string;
  phone: string;
  note: number;
  category: string;
  description: string;
  image: string | null;
  type_prices: Array<{ type_name: string; price: number }>;
}

export const VendorManagement = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=getVendorsWithPrices', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch vendors: ${response.statusText}`);
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      } else {
        toast.error(data.message || 'Failed to load vendors');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditVendor = (vendorId: string) => {
    navigate(`/admin/vendors/edit/${vendorId}`);
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!window.confirm(`Are you sure you want to delete vendor ${vendorId}?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=deleteVendor`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id_vendor: vendorId }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Vendor deleted successfully');
        fetchVendors();
      } else {
        toast.error(data.message || 'Failed to delete vendor');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete vendor');
    }
  };

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
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
                <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
                <p className="mt-1 text-sm text-gray-500">Manage service providers and vendors</p>
              </div>
              <div className="flex space-x-4">
                <Link to="/admin/vendors/add">
                  <Button leftIcon={<UserPlus size={20} />}>Add New Vendor</Button>
                </Link>
                <Button variant="outline" onClick={fetchVendors} leftIcon={<RefreshCw size={16} />}>
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
            placeholder="Search vendors by name, email, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <Card key={vendor.id_vendor} className="overflow-hidden">
                    <img
                      src={vendor.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={vendor.nom}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">{vendor.nom}</h3>
                      <p className="text-sm text-gray-500">{vendor.category}</p>
                      <p className="text-sm text-gray-600 mt-2">{vendor.email}</p>
                      <p className="text-sm text-gray-600">{vendor.phone || 'N/A'}</p>
                      <div className="flex items-center mt-2">
                        {renderStars(vendor.note)}
                        <span className="ml-2 text-sm text-gray-600">({vendor.note}/5)</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 truncate">{vendor.description || 'No description'}</p>
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewVendor(vendor)}
                          leftIcon={<Eye size={16} />}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVendor(vendor.id_vendor)}
                          leftIcon={<Edit size={16} />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVendor(vendor.id_vendor)}
                          leftIcon={<Trash2 size={16} />}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal for Viewing Vendor Details */}
        {isModalOpen && selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Vendor Details</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{selectedVendor.nom}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedVendor.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{selectedVendor.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-gray-900">{selectedVendor.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rating</label>
                  <div className="flex items-center">
                    {renderStars(selectedVendor.note)}
                    <span className="ml-2 text-sm text-gray-600">({selectedVendor.note}/5)</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{selectedVendor.description || 'No description'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Image</label>
                  <img
                    src={selectedVendor.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={selectedVendor.nom}
                    className="w-32 h-32 object-cover mt-2 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Prices by Event Type</label>
                  {selectedVendor.type_prices.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {selectedVendor.type_prices.map((typePrice, index) => (
                        <li key={index} className="text-gray-900">
                          {typePrice.type_name}: ${typePrice.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 mt-2">No prices set for event types.</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
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