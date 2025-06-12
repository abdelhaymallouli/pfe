<?php
/**
 * Config file for authentication settings
 */

// Authentication settings
define('JWT_SECRET', '4b48ff8c31ba999fb73fd12310cfc2c1'); // md5 hash value of "abdelhay_pfe_venuvibe"
define('JWT_EXPIRATION', 3600); // Token expiration time in seconds (1 hour)
define('PASSWORD_RESET_EXPIRATION', 1800); // Password reset token expiration (30 minutes)

// Email settings for password reset (placeholder - would be configured with real SMTP in production)
define('EMAIL_FROM', 'noreply@example.com');
define('EMAIL_NAME', 'Authentication System');

// Security settings
define('PASSWORD_MIN_LENGTH', 8);
define('BCRYPT_COST', 12); // Higher is more secure but slower
?>
