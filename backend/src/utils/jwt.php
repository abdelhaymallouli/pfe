<?php
class JWT {
    public static function generate($userId, $username, $payload = []) {
        if (!defined('JWT_SECRET')) {
            error_log("JWT::generate: JWT_SECRET is not defined");
            return false;
        }
        $defaultPayload = [
            'user_id' => $userId,
            'username' => $username,
            'iat' => time(),
            'exp' => time() + (defined('JWT_EXPIRATION') ? JWT_EXPIRATION : 86400)
        ];
        $payload = array_merge($defaultPayload, $payload);
        
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $header = self::base64UrlEncode($header);
        $payload = self::base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET, true);
        $signature = self::base64UrlEncode($signature);
        
        $jwt = "$header.$payload.$signature";
        error_log("JWT generated: " . substr($jwt, 0, 20) . "...");
        return $jwt;
    }

    public static function validate($jwt) {
        if (!defined('JWT_SECRET')) {
            error_log("JWT::validate: JWT_SECRET is not defined");
            return false;
        }
        error_log("Validating JWT: " . substr($jwt, 0, 20) . "...");
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) != 3) {
            error_log("Invalid JWT structure: " . count($tokenParts) . " parts");
            return false;
        }
        list($header, $payload, $signature_provided) = $tokenParts;
        $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET, true);
        $signature = self::base64UrlEncode($signature);
        if ($signature !== $signature_provided) {
            error_log("Invalid JWT signature: expected=$signature, provided=$signature_provided");
            return false;
        }
        $decoded_payload = self::base64UrlDecode($payload);
        $payload = json_decode($decoded_payload, true);
        if (!$payload) {
            error_log("Invalid JWT payload: decode failed");
            return false;
        }
        error_log("JWT payload: " . json_encode($payload));
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            error_log("JWT expired: exp={$payload['exp']}, current=" . time());
            return false;
        }
        if (!isset($payload['user_id'])) {
            error_log("JWT missing user_id");
            return false;
        }
        error_log("JWT validated: user_id={$payload['user_id']}");
        return $payload;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        $data = str_replace(['-', '_'], ['+', '/'], $data);
        $mod = strlen($data) % 4;
        if ($mod) {
            $data .= str_repeat('=', 4 - $mod);
        }
        return base64_decode($data);
    }
}
?>