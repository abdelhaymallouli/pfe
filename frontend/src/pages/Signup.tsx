import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';


const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    return setError('Passwords do not match');
  }

  try {
    setError('');
    setLoading(true);

    const response = await register(username, email, password, confirmPassword);

    if (response.status === 'success') {
      setSuccess('Registration successful! You can now log in.');
      // Redirect immediately, no need to wait for email verification
      navigate('/login');
    } else {
      setError(response.message || 'Registration failed.');
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to create an account');
  } finally {
    setLoading(false);
  }
};

  // Google OAuth handler
const handleGoogleSuccess = async (credentialResponse: any) => {
  try {
    setError('');
    setLoading(true);
    const response = await googleLogin(credentialResponse);

    if (response.status === success) {
      navigate('/dashboard');
    } else {
      setError(response.message || 'Google signup failed');
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to sign up with Google');
  } finally {
    setLoading(false);
  }
};

  // Facebook OAuth handler - will be implemented with Facebook SDK
  const handleFacebookSignup = () => {
    window.FB?.login(function(response) {
      if (response.authResponse) {
        console.log('Facebook login successful', response);
        // Call the backend API with the token
        // This will be implemented in the next step
      } else {
        setError('Facebook signup failed or was cancelled');
      }
    }, {scope: 'email,public_profile'});
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-md bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
            <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                            <div>
                              <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                  setError('Google signup failed');
                                }}
                                useOneTap
                              />
                            </div>

              <div>
              <button
                  type="button"
                  onClick={handleFacebookSignup}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FaFacebook className="h-5 w-5 text-blue-600" />
                  <span className="ml-2">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-gray-500">
        By signing up, you agree to our{' '}
        <Link to="/terms-of-service" className="underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy-policy" className="underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
};
export default Signup;
