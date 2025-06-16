import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, 
  Phone, 
  Mail, 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  MessageCircle, 
  Heart,
  Share2,
  StarIcon,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface Vendor {
  id: string;
  name: string;
  category: string | null; 
  description: string;
  rating: number;
  prices: string;
  contactEmail: string;
  contactPhone: string;
  image: string;
}

export const VendorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

useEffect(() => {
  setLoading(true);
  fetch(`http://localhost/pfe/backend/src/api/vendor.php?id=${id}`)
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
        });
      }
      return response.text().then(text => {
        console.log('Raw response:', text);
        const data = JSON.parse(text);
        console.log('Parsed vendor data:', data);
        return data;
      });
    })
    .then(data => {
      if (!data || typeof data !== 'object') {
        throw new Error('No vendor data returned');
      }
      setVendor({
        ...data,
        rating: parseFloat(data.rating || 0),
        prices: data.prices || '',
        category: data.category || 'Uncategorized',
      });
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching vendor:', error);
      setError('Failed to load vendor details');
      setLoading(false);
    });
}, [id]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const LoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2 h-96 bg-gray-200 rounded-xl"></div>
              <div className="lg:w-1/2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Vendor not found'}
            </h3>
            <p className="text-gray-600 mb-6">
              The vendor you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/vendors')}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Back to Vendors
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse prices into an array for display
  const priceList = vendor.prices ? vendor.prices.split(',').map(price => {
    const [category, amount] = price.split(':');
    return { 
      category: category?.trim() || 'Service', 
      amount: `$${parseFloat(amount || '0').toFixed(2)}` 
    };
  }) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        <Link to="/vendors">
          <Button variant="outline" leftIcon={<ArrowLeft size={18} />}>
            Back to Vendors
          </Button>
        </Link>
        {/* Main Content */}
        <div className="bg-white m-px-20 rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Section */}
          <div className="relative h-64 md:h-80 lg:h-96">
            <img
              src={vendor.image}
              alt={vendor.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Vendor Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center space-x-2 mb-3">
                {renderStars(vendor.rating)}
                <span className="text-white font-medium ml-2">
                  {vendor.rating.toFixed(1)} ({Math.floor(Math.random() * 50) + 10} reviews)
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {vendor.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                  {vendor.category && typeof vendor.category === 'string' ? (
                    vendor.category.split(',').map((cat, index) => (
                      <Badge 
                        key={index}
                        className="bg-white/20 text-white backdrop-blur-sm border-white/30"
                      >
                        {cat.trim()}
                      </Badge>
                    ))
                  ) : (
                    <Badge className="bg-white/20 text-white backdrop-blur-sm border-white/30">
                      No Category
                    </Badge>
                  )}
                </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {vendor.description}
                  </p>
                </div>

                {/* Services & Pricing */}
                {priceList.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Services & Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {priceList.map((price, index) => (
                        <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                  <DollarSign className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{price.category}</h3>
                                  <p className="text-sm text-gray-500">Starting from</p>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-blue-600">
                                {price.amount}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Professional Service',
                      'Experienced Team',
                      'Competitive Pricing',
                      'Customer Satisfaction',
                      'Timely Delivery',
                      'Quality Guaranteed'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Card */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h3>
                    <div className="space-y-4">
                      <a
                        href={`mailto:${vendor.contactEmail}`}
                        className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                            {vendor.contactEmail}
                          </p>
                        </div>
                      </a>

                      <a
                        href={`tel:${vendor.contactPhone}`}
                        className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors">
                            {vendor.contactPhone}
                          </p>
                        </div>
                      </a>
                    </div>

                  </CardContent>
                </Card>

                {/* Quick Info Card */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Response Time</span>
                        <span className="font-medium">Within 24 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Experience</span>
                        <span className="font-medium">5+ years</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Availability</span>
                        <span className="font-medium text-green-600">Available</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};