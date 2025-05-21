<?php
/**
 * Test script for authentication flows
 * This script tests all authentication endpoints
 */

// Set API base URL
$base_url = "http://localhost:8080";

// Test data
$test_user = [
    "username" => "testuser",
    "email" => "test@example.com",
    "password" => "Password123!",
    "confirm_password" => "Password123!"
];

// Function to make API requests
function makeRequest($url, $method = "GET", $data = null) {
    $curl = curl_init();
    
    $options = [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method
    ];
    
    if ($data) {
        $options[CURLOPT_POSTFIELDS] = json_encode($data);
        $options[CURLOPT_HTTPHEADER] = [
            "Content-Type: application/json"
        ];
    }
    
    curl_setopt_array($curl, $options);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    curl_close($curl);
    
    return [
        "code" => $httpCode,
        "body" => json_decode($response, true)
    ];
}

// Function to make authenticated requests
function makeAuthenticatedRequest($url, $token, $method = "GET", $data = null) {
    $curl = curl_init();
    
    $options = [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer " . $token
        ]
    ];
    
    if ($data) {
        $options[CURLOPT_POSTFIELDS] = json_encode($data);
        $options[CURLOPT_HTTPHEADER][] = "Content-Type: application/json";
    }
    
    curl_setopt_array($curl, $options);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    curl_close($curl);
    
    return [
        "code" => $httpCode,
        "body" => json_decode($response, true)
    ];
}

// Test API index
echo "Testing API Index...\n";
$response = makeRequest($base_url);
echo "Response Code: " . $response["code"] . "\n";
echo "Response Body: " . json_encode($response["body"], JSON_PRETTY_PRINT) . "\n\n";

// Test signup
echo "Testing Signup...\n";
$response = makeRequest($base_url . "/api/signup.php", "POST", $test_user);
echo "Response Code: " . $response["code"] . "\n";
echo "Response Body: " . json_encode($response["body"], JSON_PRETTY_PRINT) . "\n\n";

// Store verification token
$verification_token = isset($response["body"]["data"]["verification_token"]) ? $response["body"]["data"]["verification_token"] : null;

if ($verification_token) {
    // Test verification
    echo "Testing Account Verification...\n";
    $response = makeRequest($base_url . "/api/verify.php?token=" . $verification_token);
    echo "Response Code: " . $response["code"] . "\n";
    echo "Response Body: " . json_encode($response["body"], JSON_PRETTY_PRINT) . "\n\n";
    
    // Test login
    echo "Testing Login...\n";
    $response = makeRequest($base_url . "/api/login.php", "POST", [
        "email" => $test_user["email"],
        "password" => $test_user["password"]
    ]);
    echo "Response Code: " . $response["code"] . "\n";
    echo "Response Body: " . json_encode($response["body"], JSON_PRETTY_PRINT) . "\n\n";
    
    // Store token
    $token = isset($response["body"]["data"]["token"]) ? $response["body"]["data"]["token"] : null;
    
    if ($token) {
        // Test authentication verification
        echo "Testing Authentication Verification...\n";
        $response = makeAuthenticatedRequest($base_url . "/api/verify_auth.php", $token);
        echo "Response Code: " . $response["code"] . "\n";
        echo "Response Body: " . json_encode($response["body"], JSON_PRETTY_PRINT) . "\n\n";
    }
    
    // Test password reset request
    echo "Testing Password Reset Request...\n";
    $response = makeRequest($base_url . "/api/request_reset.php", "POST", [
        "email" => $test_user["email"]
    ]);
    echo "Response Code: " . $response["code"] . "\n";
    echo "Response Body: " . json_encode($response["body"], JSON_PRETTY_PRINT) . "\n\n";
    
    // Store reset token
    $reset_token = isset($response["body"]["data"]["reset_token"]) ? $response["body"]["data"]["reset_token"] : null;
    
    if ($reset_token) {
        // Test password reset
        echo "Testing Password Reset...\n";
        $response = makeRequest($base_url . "/api/reset_password.php", "POST", [
            "token" => $reset_token,
            "password" => "NewPassword123!",
            "confirm_password" => "NewPassword123!"
        ]);
        echo "Response Code: " . $response["code"] . "\n";
        echo "Response Body: " . json_encode($response["body"], JSON_PRETTY_PRINT) . "\n\n";
        
        // Test login with new password
        echo "Testing Login with New Password...\n";
        $response = makeRequest($base_url . "/api/login.php", "POST", [
            "email" => $test_user["email"],
            "password" => "NewPassword123!"
        ]);
        echo "Response Code: " . $response["code"] . "\n";
        echo "Response Body: " . json_encode($response["body"], JSON_PRETTY_PRINT) . "\n\n";
    }
}

echo "All tests completed.\n";
?>
