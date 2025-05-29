-- Create Database
CREATE DATABASE Venuvibe;
USE Venuvibe;

-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Data into Users
INSERT INTO users (id, name, email, password, created_at) VALUES
(1, 'admin', 'yassir@gmail.com', '$2y$10$cKiGfHgvDF/D/uER2.t3fuHyOg1JV2isDtL.rGS6jWdTxB9LJ7kVC', '2025-05-22 09:23:26');

-- Type Table
CREATE TABLE type (
  id_type INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL
);

-- Insert Data into Type (based on event types in provided data)
INSERT INTO type (type_name) VALUES
('wedding'),
('corporate'),
('birthday'),
('social');

-- Events Table
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  theme VARCHAR(100),
  date DATE,
  location VARCHAR(255),
  bannerImage VARCHAR(255),
  description TEXT,
  status ENUM('upcoming', 'cancelled', 'completed') DEFAULT 'upcoming',
  expected_guests INT DEFAULT 0,
  budget DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_type INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (id_type) REFERENCES type(id_type)
);

-- Insert Data into Events (corrected to use id_type instead of type)
INSERT INTO events (id, user_id, title, theme, date, location, bannerImage, description, status, expected_guests, budget, created_at, id_type) VALUES
(1, 1, 'Summer Wedding Reception', NULL, '2025-07-15', 'Crystal Gardens', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg', 'An elegant evening wedding reception', 'upcoming', 250, 10000.00, '2025-05-22 09:23:46', 1),
(2, 1, 'Corporate Annual Meeting', NULL, '2025-03-20', 'Grand Conference Center', 'https://images.pexels.com/photos/7175435/pexels-photo-7175435.jpeg', 'Annual shareholders meeting', 'completed', 120, 2300.00, '2025-05-22 09:23:46', 2),
(3, 1, 'Sarah''s Sweet 16', NULL, '2025-04-10', 'Sunset Lounge', 'https://images.pexels.com/photos/2072181/pexels-photo-2072181.jpeg', 'Sweet sixteen birthday celebration', 'upcoming', 340, 120.00, '2025-05-22 09:23:46', 3),
(4, 1, 'Annual Charity Gala', NULL, '2025-09-05', 'Hilton Ballroom', 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg', 'Fundraising event for local charities', 'completed', 0, 0.00, '2025-05-22 09:23:46', 4),
(5, 1, 'Marketing Workshop', NULL, '2025-06-12', 'Innovation Hub', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg', 'Hands-on marketing strategies training', 'upcoming', 0, 0.00, '2025-05-22 09:23:46', 2),
(6, 1, 'Birthday Bash for Jake', NULL, '2025-08-20', 'Jake''s Backyard', 'https://www.parents.com/thmb/--pZafKsgGSb8NrJVrV7lqJId9g=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/BirthdayParty-GettyImages-1600792233-c2a961509556414f9f41b92b8471a551.jpg', 'Casual birthday party with friends', 'completed', 0, 0.00, '2025-05-22 09:23:46', 3),
(7, 1, 'Product Launch Event', NULL, '2025-05-15', 'Tech Center Auditorium', 'https://images.pexels.com/photos/1181355/pexels-photo-1181355.jpeg', 'Launch of new software product', 'upcoming', 0, 0.00, '2025-05-22 09:23:46', 2),
(8, 1, 'Community Picnic', NULL, '2025-07-10', 'City Park', 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg', 'Annual community gathering and picnic', 'completed', 0, 0.00, '2025-05-22 09:23:46', 4),
(9, 1, 'Corporate Team Building', NULL, '2025-10-08', 'Adventure Retreat', 'https://images.pexels.com/photos/3184352/pexels-photo-3184352.jpeg', 'Outdoor team building activities', 'completed', 0, 0.00, '2025-05-22 09:23:46', 2),
(10, 1, 'Laura''s 30th Birthday', NULL, '2025-11-21', 'Downtown Rooftop', 'https://images.pexels.com/photos/1231231/pexels-photo-1231231.jpeg', 'Elegant 30th birthday celebration', 'upcoming', 0, 0.00, '2025-05-22 09:23:46', 3),
(11, 1, 'Ahmed''s Birthday', NULL, '2025-05-27', 'Tangier, Morocco', 'https://t3.ftcdn.net/jpg/04/42/62/12/360_F_442621279_PYhie13pVGcSSYTAm1eqlC3e7Lcy0oNV.jpg', '', 'upcoming', 0, 0.00, '2025-05-27 11:51:14', 3),
(19, 1, 'Birthday', NULL, '2025-05-28', 'Tangier, Morocco', 'http://localhost/pfe/backend/src/uploads/img_6836c9b81dc28.jpg', '', 'upcoming', 24, 1000.00, '2025-05-28 08:33:08', 3);

-- Event Collaborator Table
CREATE TABLE event_collaborator (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(50),
  event_id INT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Vendors Table
CREATE TABLE vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  price VARCHAR(50),
  rating DECIMAL(3,1),
  image VARCHAR(250),
  date_creation DATE DEFAULT CURRENT_DATE,
  id_type INT,
  FOREIGN KEY (id_type) REFERENCES type(id_type)
);

-- Updated Insert Data into Vendors (with realistic prices)
INSERT INTO vendors (id, name, category, description, phone, email, price, rating, date_creation, image, id_type) VALUES
(1, 'Elegant Events Venue', 'venue', 'Luxury event space with modern amenities', '(555) 123-4567', 'info@elegantevents.com', '2000-5000 USD', 4.8, '2025-05-22', 'https://prestigiousvenues.com/wp-content/uploads/bb-plugin/cache/Gala-Dinner-Venue-In-London-Gibson-Hall-Prestigious-Venues-panorama-e59dc799b93c25c0dc960e904af705e0-59099a98687f6.jpg', 1),
(2, 'Divine Catering Co.', 'catering', 'Gourmet catering for all occasions', '(555) 234-5678', 'events@divinecatering.com', '30-100 USD per person', 4.9, '2025-05-22', 'https://cdn-ikpened.nitrocdn.com/IASuVSfAFufVGDVSWpDAfIIJMmSefhYb/assets/images/optimized/rev-866e6ae/sadhgurucatering.com/wp-content/uploads/2023/12/dinner-catering-services-in-ghaziabad-and-noida-e1731795719614.jpg', 2),
(3, 'Bloom & Petal', 'florist', 'Creative floral designs and arrangements', '(555) 345-6789', 'hello@bloomandpetal.com', '150-500 USD per arrangement', 4.7, '2025-05-22', 'https://asset.bloomnation.com/c_pad,d_vendor:global:catalog:product:image.png,f_auto,fl_preserve_transparency,q_auto/v1707205630/vendor/7726/catalog/product/2/0/20210825072528_file_6125f068edb65_6125f07d409c1._6126c9d712420._6126c9d9369da..png', 3),
(4, 'SnapShot Studios', 'photography', 'Professional photography services for events', '(555) 456-7890', 'contact@snapshotstudios.com', '1000-3000 USD per event', 4.6, '2025-05-22', 'https://www.gpdowntown.com/wp-content/uploads/2018/08/AK9W2808a-1024x1024.jpg', 4),
(5, 'SoundWave Entertainment', 'entertainment', 'Live bands and DJs for all occasions', '(555) 567-8901', 'bookings@soundwaveent.com', '1500-4000 USD per event', 4.5, '2025-05-22', 'https://cdn0.weddingwire.com/vendor/771810/3_2/960/jpg/1539283650-ad2496ce319f4f2d-1539283648-47d0919af2be09ce-1539283646989-4-DJ33330181006_2019.jpeg', 5),
(6, 'Gourmet Delights', 'catering', 'Exquisite gourmet dishes tailored to your event', '(555) 678-9012', 'info@gourmetdelights.com', '50-120 USD per person', 4.8, '2025-05-22', 'https://www.priestleys-gourmet.com.au/wp-content/uploads/Picture-1.png', 2),
(7, 'Floral Fantasies', 'florist', 'Bespoke floral arrangements for special events', '(555) 789-0123', 'orders@floralfantasies.com', '200-600 USD per arrangement', 4.7, '2025-05-22', 'https://cdn-imgix.headout.com/media/images/c2031e9f0c644fd7f8b252cb9f14b191-Floral-Fantasy-2.jpg?auto=format&w=900&h=562.5&q=90&ar=16%3A10&crop=faces%2Ccenter&fit=crop', 3),
(8, 'Grand Gala Venues', 'venue', 'Spacious and elegant venues for large gatherings', '(555) 890-1234', 'reservations@grandgala.com', '2500-7000 USD per event', 4.9, '2025-05-22', 'https://bluevista.info/cdn/shop/products/2019-04-06EricGraceWedding-34_2000x.jpg?v=1588447368', 1),
(9, 'Moments Captured', 'photography', 'Capturing your special moments with precision', '(555) 901-2345', 'services@momentscaptured.com', '1200-3500 USD per event', 4.6, '2025-05-22', 'https://www.photojaanic.com/blog/wp-content/uploads/sites/2/2017/03/00-Lead.jpg', 4),
(10, 'Rhythm & Beats', 'entertainment', 'High-energy performances to liven up your event', '(555) 012-3456', 'inquiries@rhythmandbeats.com', '1800-5000 USD per event', 4.5, '2025-05-22', 'https://plus.pointblankmusicschool.com/wp-content/uploads/2024/06/DSC1904.jpg', 5);

-- Request Table
CREATE TABLE request (
  id_request INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  vendor_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Transaction Table
CREATE TABLE transaction (
  id_transaction INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);