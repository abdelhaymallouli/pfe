import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/pfe/backend/src/api/';

interface ProfileForm {
  name: string;
  email: string;
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileForm>({
    name: currentUser?.username || '',
    email: currentUser?.email || '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.username,
        email: currentUser.email,
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Partial<ProfileForm> = {};
      if (formData.name !== currentUser?.username) {
        payload.name = formData.name;
      }
      if (formData.email !== currentUser?.email) {
        payload.email = formData.email;
      }

      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save');
        setIsEditing(false);
        setLoading(false);
        return;
      }

      const response = await axios.put(`${API_URL}/profile.php`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.status === 'success') {
        const updatedUser = { ...currentUser, ...response.data.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/profile.php`, {
        current_password: formData.currentPassword,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.status === 'success') {
        toast.success('Password updated successfully!');
        setIsResettingPassword(false);
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          password: '',
          confirmPassword: '',
        }));
      } else {
        toast.error(response.data.message || 'Failed to update password');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred while updating password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return <div className="text-center py-8">Please log in to view your profile</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Your Profile</h1>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
        {isEditing ? (
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <p className="mb-2"><strong>Name:</strong> {formData.name}</p>
            <p className="mb-4"><strong>Email:</strong> {formData.email}</p>
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          </div>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
        {isResettingPassword ? (
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Change Password'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResettingPassword(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setIsResettingPassword(true)}>Change Password</Button>
        )}
      </div>

      <div className="mt-6">
        <Button variant="destructive" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;