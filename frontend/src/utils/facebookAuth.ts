// Add Facebook SDK initialization
export const initFacebookSDK = () => {
  return new Promise((resolve) => {
    // Load the Facebook SDK script
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: 'YOUR_FACEBOOK_APP_ID', // Replace with your Facebook App ID
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      
      resolve(true);
    };
    
    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });
};

// Facebook login function
export const facebookLogin = () => {
  return new Promise((resolve, reject) => {
    window.FB.login(function(response) {
      if (response.authResponse) {
        resolve(response.authResponse);
      } else {
        reject(new Error('Facebook login failed or was cancelled'));
      }
    }, {scope: 'email,public_profile'});
  });
};

// Get Facebook user data
export const getFacebookUserData = () => {
  return new Promise((resolve, reject) => {
    window.FB.api('/me', {fields: 'id,name,email,first_name,last_name,picture'}, function(response) {
      if (response && !response.error) {
        resolve(response);
      } else {
        reject(new Error('Failed to get user data from Facebook'));
      }
    });
  });
};
