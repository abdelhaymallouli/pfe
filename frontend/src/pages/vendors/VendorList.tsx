import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Phone, Mail } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { debounce } from 'lodash'; 

interface Vendor {
  id: string;
  name: string;
  category: string; // Comma-separated string, e.g., "wedding,corporate"
  description: string;
  rating: number;
  price: string;
  contactEmail: string;
  contactPhone: string;
  image: string;
}

export const VendorList = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch vendors and extract unique categories
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost/pfe/backend/src/api/vendor.php');
        if (!response.ok) {
          const text = await response.text();
          console.error('Response status:', response.status, 'Raw response:', text);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        console.log('Raw response:', text);
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          throw new Error('Invalid JSON response');
        }
        if (!Array.isArray(data)) {
          throw new Error('Expected an array of vendors');
        }
        const formattedVendors = data.map((vendor: any) => ({
          id: vendor.id || '',
          name: vendor.name || 'Unknown Vendor',
          category: vendor.category || '', // Expect comma-separated string
          description: vendor.description || 'No description available',
          rating: parseFloat(vendor.rating) || 0,
          price: vendor.price ? `$${Number(vendor.price).toFixed(2)}` : '$0.00',
          contactEmail: vendor.contactEmail || '',
          contactPhone: vendor.contactPhone || '',
          image: vendor.image || 'https://via.placeholder.com/300x200?text=No+Image',
        }));
        setVendors(formattedVendors);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(
            formattedVendors
              .flatMap(vendor => vendor.category.split(',').map(cat => cat.trim().toLowerCase()))
              .filter(cat => cat)
          )
        ).sort();
        setCategories(['all', ...uniqueCategories]);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch vendors');
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      vendor.category.toLowerCase().split(',').some(cat => cat.trim() === selectedCategory.toLowerCase());
    const matchesRating = vendor.rating >= minRating;
    return matchesSearch && matchesCategory && matchesRating;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Loading vendors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Directory</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find the perfect vendors for your event
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="text"
          placeholder="Search vendors..."
          leftIcon={<Search size={20} />}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <select
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
        >
          <option value="0">All Ratings</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
        </select>
      </div>

      {filteredVendors.length === 0 && (
        <p className="text-center text-gray-600">No vendors match your criteria.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <Card
            key={vendor.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/vendors/${vendor.id}`)}
          >
            <div className="h-48 relative">
              <img
                src={vendor.image}
                alt={vendor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
              <Badge variant="primary" className="absolute top-4 right-4">
                {vendor.price}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{vendor.name}</h3>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium">{vendor.rating.toFixed(1)}</span>
                </div>
              </div>
              <Badge variant="secondary" className="mb-3">
                {vendor.category ? vendor.category.split(',').map(cat => cat.trim().charAt(0).toUpperCase() + cat.trim().slice(1)).join(', ') : 'No Category'}
              </Badge>
              <p className="text-gray-600 text-sm mb-4">{vendor.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <Mail className="w-4 h-4 mr-2" />
                  <a href={`mailto:${vendor.contactEmail}`} className="hover:text-primary-600">
                    {vendor.contactEmail || 'No email'}
                  </a>
                </div>
                <div className="flex items-center text-gray-500">
                  <Phone className="w-4 h-4 mr-2" />
                  <a href={`tel:${vendor.contactPhone}`} className="hover:text-primary-600">
                    {vendor.contactPhone || 'No phone'}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};