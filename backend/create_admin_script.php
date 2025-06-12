<?php
// A secure, dynamic page to create a new admin.
// Place this file in your `/backend` directory.

require_once __DIR__ . '/config/auth_config.php'; // <--- THIS IS THE FIX


$message = '';
$message_type = '';

// Check if the form has been submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // 1. Validate the Secret Key
    if (!isset($_POST['secret_key']) || $_POST['secret_key'] !== JWT_SECRET) {
        $message = 'Error: Invalid Secret Key. You are not authorized to perform this action.';
        $message_type = 'error';
    } else {
        // 2. Get and validate form data
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $plainPassword = $_POST['password'] ?? '';

        if (empty($name) || empty($email) || empty($plainPassword)) {
            $message = 'Error: Name, email, and password fields cannot be empty.';
            $message_type = 'error';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $message = 'Error: The email address provided is not valid.';
            $message_type = 'error';
        } else {
            // 3. All checks passed, proceed with database operations
            try {
                // Correctly require the database configuration
                require_once __DIR__ . '/config/database.php';

                $database = new Database();
                $pdo = $database->getConnection();

                // Check if user already exists
                $stmt = $pdo->prepare("SELECT id_admin FROM admin WHERE email = ?");
                $stmt->execute([$email]);
                if ($stmt->fetch()) {
                    $message = 'Error: An admin with the email "' . htmlspecialchars($email) . '" already exists.';
                    $message_type = 'error';
                } else {
                    // Hash the password securely
                    $hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

                    // Insert the new admin
                    $stmt = $pdo->prepare("INSERT INTO admin (name, email, password) VALUES (?, ?, ?)");
                    $success = $stmt->execute([$name, $email, $hashedPassword]);

                    if ($success) {
                        $message = 'Success! Admin "' . htmlspecialchars($name) . '" was created. You can now log in with your new credentials.';
                        $message_type = 'success';
                    } else {
                        $message = 'Database Error: Failed to create the admin account.';
                        $message_type = 'error';
                    }
                }
            } catch (Exception $e) {
                $message = 'A critical error occurred: ' . $e->getMessage();
                $message_type = 'error';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create New Admin</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f9; color: #333; margin: 0; padding: 2em; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .container { background: #fff; padding: 2em; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
        h1 { color: #1a202c; text-align: center; }
        .form-group { margin-bottom: 1.5em; }
        label { display: block; margin-bottom: 0.5em; font-weight: 600; }
        input { width: 100%; padding: 0.75em; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .btn { width: 100%; padding: 0.8em; background-color: #4a5568; color: white; border: none; border-radius: 4px; font-size: 1em; cursor: pointer; transition: background-color 0.3s; }
        .btn:hover { background-color: #2d3748; }
        .message { padding: 1em; margin-bottom: 1em; border-radius: 4px; text-align: center; }
        .message.success { background-color: #c6f6d5; color: #2f855a; }
        .message.error { background-color: #fed7d7; color: #c53030; }
        .security-note { margin-top: 2em; text-align: center; font-style: italic; color: #c53030; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Create New Admin</h1>

        <?php if ($message): ?>
            <div class="message <?php echo $message_type; ?>">
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="">
            <div class="form-group">
                <label for="name">Full Name:</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="email">Email Address:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
                <label for="secret_key">Secret Key:</label>
                <input type="password" id="secret_key" name="secret_key" required>
            </div>
            <button type="submit" class="btn">Create Admin</button>
        </form>
        
        <p class="security-note">IMPORTANT: Delete this file from the server after you have created the necessary admin accounts!</p>
    </div>
</body>
</html>