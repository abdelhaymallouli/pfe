<?php
/**
 * JWT utility class
 * Handles JWT token generation and validation
 */

require_once __DIR__ . '/../../config/auth_config.php';

class JWT {
    // Generate JWT token
    public static function generate($user_id, $username) {
        $issued_at = time();
        $expiration = $issued_at + JWT_EXPIRATION;
        
        $payload = array(
            "iat" => $issued_at,
            "exp" => $expiration,
            "user_id" => $user_id,
            "username" => $username
        );
        
        // Encode Header
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $header = self::base64UrlEncode($header);
        
        // Encode Payload
        $payload = json_encode($payload);
        $payload = self::base64UrlEncode($payload);
        
        // Create Signature
        $signature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
        $signature = self::base64UrlEncode($signature);
        
        // Create JWT
        $jwt = $header . "." . $payload . "." . $signature;
        
        return $jwt;
    }
    
    // Validate JWT token
    public static function validate($jwt) {
        // Split the JWT
        $tokenParts = explode('.', $jwt);
        
        if (count($tokenParts) != 3) {
            return false;
        }
        
        $header = $tokenParts[0];
        $payload = $tokenParts[1];
        $signature_provided = $tokenParts[2];
        
        // Check the signature
        $signature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
        $signature = self::base64UrlEncode($signature);
        
        if ($signature !== $signature_provided) {
            return false;
        }
        
        // Decode payload
        $payload = json_decode(self::base64UrlDecode($payload), true);
        
        // Check if token has expired
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
    
    // Encode data to Base64URL
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    // Decode data from Base64URL
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }
}
?>
