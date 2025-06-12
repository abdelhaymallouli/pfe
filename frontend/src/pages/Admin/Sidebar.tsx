import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Calendar, UserCheck, FileText, Settings, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <Settings className="h-5 w-5 mr-3" /> },
    { to: '/admin/users', label: 'User Management', icon: <Users className="h-5 w-5 mr-3" /> },
    { to: '/admin/events', label: 'Event Management', icon: <Calendar className="h-5 w-5 mr-3" /> },
    { to: '/admin/vendors', label: 'Vendor Management', icon: <UserCheck className="h-5 w-5 mr-3" /> },
    { to: '/admin/requests', label: 'Request Management', icon: <FileText className="h-5 w-5 mr-3" /> },
  ];

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('No authentication token found.');
        return;
      }

      const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('adminToken');
        toast.success('Logged out successfully');
        navigate('/admin/login');
      } else {
        toast.error(data.message || 'Failed to logout');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
    }
  };

  return (
    <div className="w-64 bg-white shadow-md h-screen fixed">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">VenuVibe Admin</h2>
        <p className="mt-1 text-sm text-gray-500">Administration Panel</p>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              location.pathname === item.to ? 'bg-gray-100 text-blue-600 font-semibold' : ''
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </nav>
    </div>
  );
};