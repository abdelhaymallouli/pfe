<?php
// backend/src/api/upload_image.php

// Prevent any output before headers
ob_start();

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

// Set content type
header('Content-Type: application/json');

try {
    // Check if a file was uploaded
    if (!isset($_FILES['banner_image']) || $_FILES['banner_image']['error'] !== UPLOAD_ERR_OK) {
        ob_clean();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No file uploaded or upload error'
        ]);
        exit;
    }

    $file = $_FILES['banner_image'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
        ob_clean();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid file type. Only JPEG, PNG, and GIF are allowed.'
        ]);
        exit;
    }

    // Validate file size (5MB limit)
    if ($file['size'] > 5 * 1024 * 1024) {
        ob_clean();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'File size exceeds 5MB limit.'
        ]);
        exit;
    }

    // Define upload directory
    $uploadDir = __DIR__ . '/../../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate unique filename
    $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid('img_') . '.' . $fileExt;
    $filePath = $uploadDir . $fileName;

    // Move the uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        ob_clean();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save uploaded file.'
        ]);
        exit;
    }

    // Generate URL for the uploaded file
    $baseUrl = 'http://localhost/pfe/backend/src/Uploads/';
    $imageUrl = $baseUrl . $fileName;

    ob_clean();
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'image_url' => $imageUrl
    ]);

} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

exit;