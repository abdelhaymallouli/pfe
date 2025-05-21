# PHP Authentication Backend with Docker Compose

This README provides an overview of the PHP authentication backend with MySQL PDO and Docker Compose setup.

## Project Structure

```
backend/
├── config/
│   ├── database.php       # Database connection configuration
│   └── auth_config.php    # Authentication settings
├── database/
│   └── init.sql           # Database initialization script
├── src/
│   ├── api/
│   │   ├── login.php      # Login endpoint
│   │   ├── signup.php     # Signup endpoint
│   │   ├── verify.php     # Account verification endpoint
│   │   ├── verify_auth.php # Authentication verification endpoint
│   │   ├── request_reset.php # Password reset request endpoint
│   │   └── reset_password.php # Password reset endpoint
│   ├── models/
│   │   └── user.php       # User model
│   ├── utils/
│   │   ├── jwt.php        # JWT utility
│   │   └── api_response.php # API response utility
│   └── index.php          # API entry point
├── Dockerfile             # PHP Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── test_auth.php          # Test script for authentication flows
└── run_tests.sh           # Shell script to run tests
```

## Features

- User registration (signup)
- User login with JWT authentication
- Email verification
- Authentication verification
- Password reset functionality
- Secure password handling with bcrypt
- MySQL database with PDO connection
- Docker Compose setup for easy deployment

## API Endpoints

- `/api/signup.php`: Register a new user
- `/api/login.php`: Authenticate user and get JWT token
- `/api/verify.php`: Verify user account with token
- `/api/verify_auth.php`: Verify authentication token
- `/api/request_reset.php`: Request password reset
- `/api/reset_password.php`: Reset password with token

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your system

### Running the Application

1. Clone or download this repository
2. Navigate to the project directory
3. Run the following command to start the services:

```bash
docker-compose up -d
```

4. The API will be available at `http://localhost:8080`

### Running Tests

To run the automated tests:

```bash
./run_tests.sh
```

## Security Features

- Password hashing with bcrypt
- JWT for secure authentication
- Input validation and sanitization
- Protection against SQL injection via PDO prepared statements
- CORS headers for API security

## Environment Variables

The following environment variables can be configured in the `docker-compose.yml` file:

- `DB_HOST`: MySQL host (default: mysql)
- `DB_NAME`: Database name (default: auth_db)
- `DB_USER`: Database user (default: auth_user)
- `DB_PASSWORD`: Database password (default: auth_password)
- `JWT_SECRET`: Secret key for JWT token generation

## Production Considerations

For production deployment, consider the following:

- Change all default passwords and secrets
- Set up HTTPS for secure communication
- Implement rate limiting
- Set up proper email sending for verification and password reset
- Implement logging and monitoring
