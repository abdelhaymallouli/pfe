#!/bin/bash

# This script runs the test_auth.php script after starting the Docker Compose services

# Start Docker Compose services
echo "Starting Docker Compose services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Install PHP curl extension if not already installed
echo "Checking for PHP curl extension..."
if ! php -m | grep -q curl; then
    echo "Installing PHP curl extension..."
    apt-get update && apt-get install -y php-curl
fi

# Run the test script
echo "Running authentication tests..."
php test_auth.php

# Output Docker logs for debugging
echo "Docker logs for PHP service:"
docker-compose logs php

echo "Docker logs for MySQL service:"
docker-compose logs mysql

echo "Test completed. You can stop the services with 'docker-compose down'"
