import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Save } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface Vendor {
  id_vendor?: string;
  nom: string;
  email: string;
  phone: string;
  note: number;
  category: string;
  description: string;
  image: string | null;
}

interface EventType {
  id_type: string;
  type_name: string;
}

interface TypePrice {
  id_type: string;
  price: number;
}

export const AddEditVendor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [vendor, setVendor] = useState<Vendor>({
    nom: '',
    email: '',
    phone: '',
    note: 0,
    category: '',
    description: '',
    image: null,
  });
  const [typePrices, setTypePrices] = useState<TypePrice[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEventTypes = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=getTypes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch event types: ${response.statusText}`);
      const data = await response.json();
      if (data.success) {
        setEventTypes(data.data);
        setTypePrices(data.data.map((type: EventType) => ({ id_type: type.id_type, price: 0 })));
      } else {
        toast.error(data.message || 'Failed to load event types');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load event types');
    }
  }, []);

  const fetchVendor = useCallback(async () => {
    if (!isEditMode) return;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=getVendor&id_vendor=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch vendor: ${response.statusText}`);
      const data = await response.json();
      if (data.success) {
        setVendor(data.data);
        setTypePrices(data.data.type_prices.map((tp: any) => ({
          id_type: tp.id_type,
          price: parseFloat(tp.price) || 0,
        })));
      } else {
        toast.error(data.message || 'Failed to load vendor');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load vendor');
    }
  }, [id, isEditMode]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchEventTypes(), fetchVendor()]).finally(() => setIsLoading(false));
  }, [fetchEventTypes, fetchVendor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVendor((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (id_type: string, price: number) => {
    setTypePrices((prev) =>
      prev.map((tp) => (tp.id_type === id_type ? { ...tp, price } : tp))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const payload = {
        ...vendor,
        type_prices: typePrices,
      };

      const action = isEditMode ? 'updateVendor' : 'addVendor';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=${action}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(isEditMode ? 'Vendor updated successfully' : 'Vendor added successfully');
        navigate('/admin/vendors');
      } else {
        toast.error(data.message || `Failed to ${isEditMode ? 'update' : 'add'} vendor`);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} vendor`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Link to="/admin/vendors" className="mr-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 px-4 py-2 border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft size={20} />
                Back to Vendors
              </Button>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Vendor' : 'Add New Vendor'}
            </h1>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Vendor Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <Input
                      type="text"
                      name="nom"
                      value={vendor.nom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-300"
                      placeholder="Enter vendor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={vendor.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-300"
                      placeholder="Enter vendor email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <Input
                      type="text"
                      name="phone"
                      value={vendor.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-300"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <Input
                      type="text"
                      name="category"
                      value={vendor.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-300"
                      placeholder="Enter vendor category"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Rating (0-5)</label>
                    <Input
                      type="number"
                      name="note"
                      value={vendor.note}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-300"
                      placeholder="Enter rating"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Image URL</label>
                    <Input
                      type="text"
                      name="image"
                      value={vendor.image || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-300"
                      placeholder="Enter image URL"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <textarea
                    name="description"
                    value={vendor.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-gray-300 min-h-[120px]"
                    placeholder="Enter vendor description"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-500">Prices by Event Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventTypes.map((type) => (
                      <div key={type.id_type} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                        <span className="flex-1 text-sm font-medium text-gray-700">{type.type_name}</span>
                        <Input
                          type="number"
                          value={typePrices.find((tp) => tp.id_type === type.id_type)?.price || 0}
                          onChange={(e) =>
                            handlePriceChange(type.id_type, parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          step="0.01"
                          className="w-32 px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-300"
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <Link to="/admin/vendors">
                    <Button 
                      variant="outline" 
                      className="px-4 py-2 border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2"
                    leftIcon={<Save size={16} />}
                  >
                    Save Vendor
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};