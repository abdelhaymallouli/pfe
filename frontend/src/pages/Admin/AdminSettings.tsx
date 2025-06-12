import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft,Database, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminSettings: React.FC = () => {
  const [autoBackup, setAutoBackup] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);


  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=createBackup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // The response should be a file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `venuvibe_backup_${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Database backup created and downloaded successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background min-h-screen">
      <div className="flex items-center mb-8">
        <Link to="/admin/dashboard" className="mr-4">
          <Button variant="outline" leftIcon={<ArrowLeft size={20} />}>
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Database Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Database className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-card-foreground">Database</h3>
            </div>
            <p className="text-sm text-muted-foreground">Database backup and maintenance settings</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-card-foreground">Auto Backup</p>
                  <p className="text-sm text-muted-foreground">Automatically backup database daily</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="border-t border-border pt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleCreateBackup}
                  isLoading={isCreatingBackup}
                  leftIcon={<Download size={16} />}
                >
                  {isCreatingBackup ? 'Creating Backup...' : 'Create Manual Backup'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;

