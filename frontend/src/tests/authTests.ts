// Test script for authentication and OAuth flows
import OAuthService from './services/OAuthService';

// Configuration
const API_URL = 'http://localhost:8080/api';

// Test standard authentication
async function testStandardAuth() {
  console.log('Testing standard authentication flows...');
  
  try {
    // Test registration
    console.log('Testing user registration...');
    const registerResponse = await OAuthService.register(
      'testuser',
      'test@example.com',
      'Password123!',
      'Password123!'
    );
    console.log('Registration response:', registerResponse);
    
    // Test login
    console.log('Testing user login...');
    const loginResponse = await OAuthService.login(
      'test@example.com',
      'Password123!'
    );
    console.log('Login response:', loginResponse);
    
    // Test authentication verification
    console.log('Testing authentication verification...');
    const verifyResponse = await OAuthService.verifyAuth();
    console.log('Verification response:', verifyResponse);
    
    // Test password reset request
    console.log('Testing password reset request...');
    const resetRequestResponse = await OAuthService.requestPasswordReset(
      'test@example.com'
    );
    console.log('Reset request response:', resetRequestResponse);
    
    // Note: We can't fully test password reset without the token from email
    
    // Test logout
    console.log('Testing logout...');
    OAuthService.logout();
    console.log('User logged out');
    
    return true;
  } catch (error) {
    console.error('Standard authentication test failed:', error);
    return false;
  }
}

// Test Google OAuth
async function testGoogleOAuth() {
  console.log('Note: Google OAuth requires user interaction and cannot be fully automated');
  console.log('To test Google OAuth:');
  console.log('1. Click the Google sign-in button on the login or signup page');
  console.log('2. Complete the Google authentication flow');
  console.log('3. Verify you are redirected to the dashboard');
  
  return true;
}

// Test Facebook OAuth
async function testFacebookOAuth() {
  console.log('Note: Facebook OAuth requires user interaction and cannot be fully automated');
  console.log('To test Facebook OAuth:');
  console.log('1. Click the Facebook sign-in button on the login or signup page');
  console.log('2. Complete the Facebook authentication flow');
  console.log('3. Verify you are redirected to the dashboard');
  
  return true;
}

// Run all tests
async function runTests() {
  console.log('Starting authentication and OAuth flow tests...');
  
  const standardAuthResult = await testStandardAuth();
  console.log('Standard authentication tests:', standardAuthResult ? 'PASSED' : 'FAILED');
  
  const googleOAuthResult = await testGoogleOAuth();
  console.log('Google OAuth tests:', googleOAuthResult ? 'MANUAL TESTING REQUIRED' : 'FAILED');
  
  const facebookOAuthResult = await testFacebookOAuth();
  console.log('Facebook OAuth tests:', facebookOAuthResult ? 'MANUAL TESTING REQUIRED' : 'FAILED');
  
  console.log('All tests completed.');
}

// Export the test functions
export {
  testStandardAuth,
  testGoogleOAuth,
  testFacebookOAuth,
  runTests
};
