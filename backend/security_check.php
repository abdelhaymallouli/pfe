<?php
/**
 * Security validation script
 * This script checks for common security issues in the authentication system
 */

echo "Running security validation checks...\n\n";

// Check 1: Verify JWT secret is properly set
echo "Check 1: JWT Secret Configuration\n";
require_once __DIR__ . '/config/auth_config.php';

if (defined('JWT_SECRET') && JWT_SECRET !== 'your_jwt_secret_key') {
    echo "✓ JWT_SECRET is properly configured\n";
} else {
    echo "✗ WARNING: JWT_SECRET is using the default value. This is insecure for production.\n";
    echo "  Recommendation: Set a strong, unique JWT_SECRET in environment variables\n";
}

// Check 2: Verify password hashing settings
echo "\nCheck 2: Password Hashing Configuration\n";
if (defined('BCRYPT_COST') && BCRYPT_COST >= 10) {
    echo "✓ BCRYPT_COST is set to a secure value: " . BCRYPT_COST . "\n";
} else {
    echo "✗ WARNING: BCRYPT_COST is too low or not defined. This weakens password security.\n";
    echo "  Recommendation: Set BCRYPT_COST to at least 10 (12+ recommended for production)\n";
}

// Check 3: Verify minimum password length
echo "\nCheck 3: Password Length Requirements\n";
if (defined('PASSWORD_MIN_LENGTH') && PASSWORD_MIN_LENGTH >= 8) {
    echo "✓ PASSWORD_MIN_LENGTH is set to a secure value: " . PASSWORD_MIN_LENGTH . "\n";
} else {
    echo "✗ WARNING: PASSWORD_MIN_LENGTH is too short or not defined.\n";
    echo "  Recommendation: Set PASSWORD_MIN_LENGTH to at least 8 characters\n";
}

// Check 4: Verify database configuration
echo "\nCheck 4: Database Configuration\n";
require_once __DIR__ . '/config/database.php';
$db = new Database();

try {
    $conn = $db->getConnection();
    echo "✓ Database connection successful\n";
    
    // Check if prepared statements are used
    $files = glob(__DIR__ . '/src/models/*.php');
    $prepared_statements_used = false;
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        if (strpos($content, 'prepare(') !== false && 
            strpos($content, 'bindParam(') !== false) {
            $prepared_statements_used = true;
            break;
        }
    }
    
    if ($prepared_statements_used) {
        echo "✓ Prepared statements are used for database queries\n";
    } else {
        echo "✗ WARNING: Prepared statements may not be consistently used.\n";
        echo "  Recommendation: Use prepared statements for all database queries\n";
    }
    
} catch (Exception $e) {
    echo "✗ ERROR: Database connection failed: " . $e->getMessage() . "\n";
    echo "  Recommendation: Check database credentials and connection settings\n";
}

// Check 5: Verify input validation
echo "\nCheck 5: Input Validation\n";
$files = glob(__DIR__ . '/src/api/*.php');
$input_validation_count = 0;

foreach ($files as $file) {
    $content = file_get_contents($file);
    if (strpos($content, 'empty(') !== false || 
        strpos($content, 'filter_var') !== false ||
        strpos($content, 'htmlspecialchars') !== false) {
        $input_validation_count++;
    }
}

if ($input_validation_count == count($files)) {
    echo "✓ Input validation appears to be implemented in all API endpoints\n";
} else {
    echo "✗ WARNING: Input validation may not be consistently implemented.\n";
    echo "  Recommendation: Validate all user inputs in every API endpoint\n";
}

// Check 6: Verify CORS headers
echo "\nCheck 6: CORS Headers\n";
$cors_headers_count = 0;

foreach ($files as $file) {
    $content = file_get_contents($file);
    if (strpos($content, 'Access-Control-Allow-Origin') !== false) {
        $cors_headers_count++;
    }
}

if ($cors_headers_count == count($files)) {
    echo "✓ CORS headers are set in all API endpoints\n";
} else {
    echo "✗ WARNING: CORS headers may not be consistently set.\n";
    echo "  Recommendation: Set appropriate CORS headers in all API endpoints\n";
}

// Check 7: Verify Docker security
echo "\nCheck 7: Docker Configuration\n";
$dockerfile = file_get_contents(__DIR__ . '/Dockerfile');
$docker_compose = file_get_contents(__DIR__ . '/docker-compose.yml');

if (strpos($docker_compose, 'environment:') !== false) {
    echo "✓ Environment variables are used in Docker Compose\n";
} else {
    echo "✗ WARNING: Environment variables may not be properly configured.\n";
    echo "  Recommendation: Use environment variables for sensitive configuration\n";
}

if (strpos($dockerfile, 'WORKDIR') !== false && 
    strpos($dockerfile, 'EXPOSE') !== false) {
    echo "✓ Dockerfile includes proper working directory and port exposure\n";
} else {
    echo "✗ WARNING: Dockerfile may be missing important configurations.\n";
    echo "  Recommendation: Set proper WORKDIR and EXPOSE directives\n";
}

echo "\nSecurity validation completed.\n";
echo "Note: This is a basic security check. A comprehensive security audit is recommended for production systems.\n";
?>
