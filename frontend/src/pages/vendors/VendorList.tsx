
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { Search, Star, Phone, Mail, Globe } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface Vendor {
  id: string;
  name: string;
  category: string;
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
  const navigate = useNavigate();


useEffect(() => {
  fetch('http://localhost/pfe/backend/src/api/vendor.php')
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          console.error('Response status:', response.status);
          console.error('Raw response 1:', text); // Log raw response
          throw new Error(`HTTP error! status: ${response.status}`);
        });
      }
      return response.text().then(text => {
        console.log('Raw response:', text); // Log raw response before parsing
        return JSON.parse(text); // Parse manually to catch errors
      });
    })
    .then(data => setVendors(data.map((vendor: any) => ({
      ...vendor,
      price: `$${Number(vendor.price).toFixed(2)}`,
      rating: parseFloat(vendor.rating || 0), 
    }))))
    .catch(error => console.error('Error fetching vendors:', error));
}, []);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           vendor.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesRating = vendor.rating >= minRating;
    return matchesSearch && matchesCategory && matchesRating;
  });

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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="wedding">Wedding</option>
          <option value="birthday">Birthday</option>
          <option value="corporate">Corporate</option>
          <option value="concert">Concert</option>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <Card 
            key={vendor.id} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" 
            onClick={() => navigate(`/vendors/${vendor.id}`)} // Navigate to details page
          >
            <div className="h-48 relative">
              <img
                src={vendor.image}
                alt={vendor.name}
                className="w-full h-full object-cover"
              />
              <Badge
                variant="primary"
                className="absolute top-4 right-4"
              >
                {vendor.price}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{vendor.name}</h3>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium">{vendor.rating}</span>
                </div>
              </div>
              <Badge variant="secondary" className="mb-3">
                {vendor.category.split(',').join(', ')}
              </Badge>
              <p className="text-gray-600 text-sm mb-4">{vendor.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <Mail className="w-4 h-4 mr-2" />
                  <a href={`mailto:${vendor.contactEmail}`} className="hover:text-primary-600">
                    {vendor.contactEmail}
                  </a>
                </div>
                <div className="flex items-center text-gray-500">
                  <Phone className="w-4 h-4 mr-2" />
                  <a href={`tel:${vendor.contactPhone}`} className="hover:text-primary-600">
                    {vendor.contactPhone}
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
