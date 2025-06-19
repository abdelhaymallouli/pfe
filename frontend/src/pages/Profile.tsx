import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  CheckCircle,
  AlertCircle,
  Shield,
  UserCircle,
  Link
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/pfe/backend/src/api/';

interface ProfileForm {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Profile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileForm>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'connected'>('profile');
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser?.id) {
      setFormData({
        ...formData,
        name: currentUser.username,
        email: currentUser.email,
      });
      fetchOAuthProviders();
    } else {
      setError('Please log in again.');
      navigate('/login');
    }
  }, [currentUser?.id, navigate]);

  const fetchOAuthProviders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setError('No authentication token found. Please log in again.');
        navigate('/login');
        return;
      }
      console.log('Sending token:', token);

      const response = await axios.get(`${API_URL}providers.php`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Providers raw response:', JSON.stringify(response.data));
      const fetchedProviders = response.data.data?.providers?.map((p: { provider: string }) => p.provider) || [];
      console.log('Fetched providers:', fetchedProviders);
      setProviders(fetchedProviders);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch OAuth providers:', err);
      console.error('Error response:', err.response?.data);
      if (err.response?.status === 401) {
        setError('Invalid or expired token. Connected accounts could not be loaded.');
      } else {
        setError('Failed to load connected accounts. Please try again later.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!currentUser?.id || !token) {
      setError('Please log in again.');
      navigate('/login');
      setLoading(false);
      return;
    }

    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(`${API_URL}update_profile.php`, {
        id: currentUser.id,
        username: formData.name,
        email: formData.email,
      }, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status === 'success') {
        setSuccess('Profile updated successfully');
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          username: formData.name,
          email: formData.email,
        }));
      } else {
        setError(response.data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'An error occurred while updating profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!currentUser?.id || !token) {
      setError('Please log in again.');
      navigate('/login');
      setLoading(false);
      return;
    }

    if (providers.includes('google')) {
      setError('Password changes are not applicable for Google-connected accounts.');
      setLoading(false);
      return;
    }

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      setError('All password fields are required');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.newPassword)) {
      setError('Password must be at least 8 characters, include uppercase, lowercase, number, and special character');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(`${API_URL}update_password.php`, {
        id: currentUser.id,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status === 'success') {
        setSuccess('Password changed successfully');
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        setError(response.data.error || 'Failed to change password');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'An error occurred while changing password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Overview Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <UserCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {currentUser.username}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{currentUser.email}</p>
                {providers.includes('google') && (
                  <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-3">
                    <Link className="h-4 w-4 mr-1" />
                    Connected with Google
                  </div>
                )}
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">Member since</div>
                  <div className="text-sm font-medium text-gray-700">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card className="mt-6">
              <CardContent className="p-0">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'password'
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Security
                  </button>
                  <button
                    onClick={() => setActiveTab('connected')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'connected'
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Link className="h-4 w-4 mr-3" />
                    Connected Accounts
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <CardContent>
                  <div className="flex items-center mb-6">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'password' && (
              <Card>
                <CardContent>
                  <div className="flex items-center mb-6">
                    <Shield className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                  </div>
                  {providers.includes('google') ? (
                    <p className="text-sm text-gray-600 mb-6">
                      Your account is connected via Google. Password changes are not applicable. Manage your password through your Google account.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-6">
                        Ensure your account is using a long, random password to stay secure.
                      </p>
                      <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="password"
                              id="currentPassword"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Enter your current password"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter new password"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="password"
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                value={formData.confirmNewPassword}
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Confirm new password"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <h3 className="text-sm font-medium text-amber-800">Password Requirements</h3>
                              <ul className="text-sm text-amber-700 mt-1 list-disc list-inside space-y-1">
                                <li>At least 8 characters long</li>
                                <li>Include both uppercase and lowercase letters</li>
                                <li>Include at least one number</li>
                                <li>Include at least one special character</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200">
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4 mr-2" />
                                Update Password
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'connected' && (
              <Card>
                <CardContent>
                  <div className="flex items-center mb-6">
                    <Link className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Connected Accounts</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Manage your connected accounts for easier sign-in.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <img src="https://www.google.com/favicon.ico" alt="Google" className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Google</h3>
                          {providers.includes('google') ? (
                            <p className="text-xs text-green-600">Connected</p>
                          ) : (
                            <p className="text-xs text-gray-500">Not connected</p>
                          )}
                        </div>
                      </div>
                      {providers.includes('google') ? (
                        <button
                          className="text-xs text-red-600 hover:text-red-700"
                          onClick={() => alert('Unlink Google account (implement unlink logic here)')}
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          className="text-xs text-blue-600 hover:text-blue-700"
                          onClick={() => navigate('/login')}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;