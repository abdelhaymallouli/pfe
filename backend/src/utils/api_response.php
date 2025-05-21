<?php
/**
 * API response utility class
 * Handles standardized API responses
 */

class ApiResponse {
    // Success response
    public static function success($data = null, $message = "Success", $code = 200) {
        http_response_code($code);
        
        $response = [
            "status" => "success",
            "message" => $message
        ];
        
        if ($data !== null) {
            $response["data"] = $data;
        }
        
        echo json_encode($response);
        exit;
    }
    
    // Error response
    public static function error($message = "Error", $code = 400) {
        http_response_code($code);
        
        $response = [
            "status" => "error",
            "message" => $message
        ];
        
        echo json_encode($response);
        exit;
    }
}
?>
