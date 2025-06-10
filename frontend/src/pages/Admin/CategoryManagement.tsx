import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, PlusCircle, Edit, Trash2, RefreshCw } from 'lucide-react';

interface Category {
  id_type: string;
  type_name: string;
  description?: string;
  // Add other category properties as needed
}

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=getCategories'); // Assuming an admin API endpoint for categories
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        toast.error(data.message || 'Failed to load categories');
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter(category =>
    category.type_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditCategory = (categoryId: string) => {
    // Implement edit functionality
    toast.info(`Edit category with ID: ${categoryId}`);
    console.log('Edit category', categoryId);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm(`Are you sure you want to delete category ${categoryId}?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=deleteCategory&id_type=${categoryId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Category deleted successfully');
        fetchCategories(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading Categories...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage event types and categories</p>
        </div>
        <div className="flex space-x-4">
          <Button leftIcon={<PlusCircle size={20} />}>Add New Category</Button>
          <Button variant="outline" onClick={fetchCategories} leftIcon={<RefreshCw size={16} />}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="relative flex-1 mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search categories by name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <p className="text-center text-gray-500">No categories found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map(category => (
                    <tr key={category.id_type}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.type_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description || 'No description'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category.id_type)} leftIcon={<Edit size={16} />}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id_type)} leftIcon={<Trash2 size={16} />} className="text-red-600 hover:text-red-900">
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

