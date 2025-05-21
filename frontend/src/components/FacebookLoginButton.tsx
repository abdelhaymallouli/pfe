import React, { useEffect } from 'react';
import { initFacebookSDK, facebookLogin } from '../utils/facebookAuth';
import { useAuth } from '../contexts/AuthContext';

// Update Login.tsx to use the Facebook SDK
const FacebookLoginButton = () => {
  const { facebookLogin: authFacebookLogin } = useAuth();
  
  useEffect(() => {
    // Initialize Facebook SDK when component mounts
    initFacebookSDK();
  }, []);
  
  const handleFacebookLogin = async () => {
    try {
      // Get Facebook auth response
      const authResponse = await facebookLogin();
      
      // Send to backend for verification and login
      await authFacebookLogin({
        accessToken: authResponse.accessToken,
        userID: authResponse.userID
      });
      
      // Navigation is handled in the Login component
    } catch (error) {
      console.error('Facebook login error:', error);
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleFacebookLogin}
      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
    >
      <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
      </svg>
      <span className="ml-2">Facebook</span>
    </button>
  );
};

export default FacebookLoginButton;
