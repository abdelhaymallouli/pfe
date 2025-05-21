CREATE DATABASE venuvibe;
USE venuvibe;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(50), -- e.g. Wedding, Birthday
    theme VARCHAR(100),
    date DATE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Vendors table
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- e.g. Catering, Venue, Decor
    description TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    rating FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event_Vendors (Many-to-Many relationship)
CREATE TABLE event_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    vendor_id INT,
    notes TEXT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Guests table
CREATE TABLE guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    rsvp_status ENUM('Pending', 'Accepted', 'Declined') DEFAULT 'Pending',
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    title VARCHAR(100),
    due_date DATE,
    is_done BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Budget table
CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    category VARCHAR(50), -- e.g. Food, Music, Decor
    amount DECIMAL(10,2),
    spent DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);