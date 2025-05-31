-- Create Database
CREATE DATABASE IF NOT EXISTS venuvibe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE venuvibe;

-- Table: CLIENT
CREATE TABLE client (
  id_client INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table: TYPE
CREATE TABLE type (
  id_type INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Table: EVENT
CREATE TABLE event (
  id_event INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  lieu VARCHAR(100),
  image_banniere VARCHAR(255),
  description TEXT,
  statut ENUM('Planned', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Planned',
  expected_guests INT,
  budget DECIMAL(10,2),
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  id_client INT NOT NULL,
  id_type INT NOT NULL,
  FOREIGN KEY (id_client) REFERENCES client(id_client) ON DELETE CASCADE,
  FOREIGN KEY (id_type) REFERENCES type(id_type) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table: VENDOR
CREATE TABLE vendor (
  id_vendor INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  email VARCHAR(100) NOT NULL,
  image VARCHAR(255),
  note DECIMAL(3,2),
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table: VENDOR_TYPE (Junction table for vendor & type with price)
CREATE TABLE vendor_type (
  id_vendor INT NOT NULL,
  id_type INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_vendor, id_type),
  FOREIGN KEY (id_vendor) REFERENCES vendor(id_vendor) ON DELETE CASCADE,
  FOREIGN KEY (id_type) REFERENCES type(id_type) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: EVENEMENT_COLLABORATEUR
CREATE TABLE evenement_collaborateur (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_event INT NOT NULL,
  role VARCHAR(50),
  FOREIGN KEY (id_event) REFERENCES event(id_event) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: REQUETE
CREATE TABLE requete (
  id_requete INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(100) NOT NULL,
  description TEXT,
  date_limite DATE,
  statut ENUM('Open', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Open',
  id_event INT NOT NULL,
  FOREIGN KEY (id_event) REFERENCES event(id_event) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: TRANSACTION
CREATE TABLE transaction (
  id_transaction INT AUTO_INCREMENT PRIMARY KEY,
  montant DECIMAL(10,2) NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  id_event INT NOT NULL,
  FOREIGN KEY (id_event) REFERENCES event(id_event) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Optional: Sample data for TYPE (for testing)
INSERT INTO type (name) VALUES ('Wedding'), ('Birthday'), ('Corporate'), ('Concert');



-- Insert 20 vendors into the vendor table
INSERT INTO vendor (nom, description, phone, email, image, note) VALUES
('Elite Catering', 'Premium catering services for all events', '555-0101', 'contact@elitecatering.com', 'https://cdn.pixabay.com/photo/2016/03/27/18/53/drinks-1283608_1280.jpg', 4.8),
('Starlight Decor', 'Elegant decor solutions for memorable events', '555-0102', 'info@starlightdecor.com', 'https://cdn.pixabay.com/photo/2021/11/22/18/29/laser-show-6817130_1280.jpg', 4.6),
('Harmony Music', 'Live music and DJ services', '555-0103', 'bookings@harmonymusic.com', 'https://cdn.pixabay.com/photo/2020/11/27/07/32/choir-5781096_1280.jpg', 4.7),
('Bliss Photography', 'Professional event photography', '555-0104', 'hello@blissphoto.com', 'https://www.weddedblissphotography.com/wp-content/uploads/2014/04/27-12610-pp_gallery/Vernon-Wedding-Photographer-Wedded-Bliss-Photography-www.weddedblissphotography.com-0160(pp_w799_h533).jpg', 4.9),
('Golden Venue', 'Luxury venue rentals', '555-0105', 'reservations@goldenvenue.com', 'https://cdn0.weddingwire.com/vendor/118851/3_2/960/jpg/a-4_51_2158811-169774370863218.webp', 4.5),
('Tasty Treats', 'Custom cakes and desserts', '555-0106', 'orders@tastytreats.com', 'https://www.somewhatsimple.com/wp-content/uploads/2018/05/cake_mix_cookies_10.jpg', 4.7),
('Bright Lights', 'Event lighting specialists', '555-0107', 'info@brightlights.com', 'https://upload.wikimedia.org/wikipedia/en/6/6b/CeeLo-BrightLightsBiggerCity.jpg', 4.6),
('Pure Elegance', 'Floral arrangements and designs', '555-0108', 'contact@pureelegance.com', 'https://res.cloudinary.com/ufn/image/upload/c_pad,f_auto,q_auto,fl_progressive,dpr_1.5,w_241,h_270/1622836145948_6.jpg', 4.8),
('Vibe Entertainment', 'Interactive entertainment services', '555-0109', 'events@vibeent.com', 'https://cdn0.weddingwire.com/vendor/173800/3_2/960/jpg/1528347552-3b05eb7edc12bad2-1528347551-1383ba5375745fcd-1528347551397-1-Vibe_Entertainment.jpeg', 4.5),
('Crystal Events', 'Full-service event planning', '555-0110', 'plan@crystalevents.com', 'https://crystalfes.com/media/pages/galerie/6f2c89c5a3-1702416790/salle-fetes-fes-600x450-crop.jpg', 4.9),
('Gourmet Bites', 'Gourmet food catering', '555-0111', 'info@gourmetbites.com', 'https://static.wixstatic.com/media/d425e0_f3d99e7b721445739657d9a26abd6b4b~mv2.jpg/v1/fill/w_742,h_496,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/d425e0_f3d99e7b721445739657d9a26abd6b4b~mv2.jpg', 4.7),
('Skyline Rentals', 'Furniture and equipment rentals', '555-0112', 'rentals@skylinerentals.com', 'https://images.squarespace-cdn.com/content/v1/5f85d73f24a4090c6e56e9fd/2a1daf2f-d05b-48da-aeb0-6435d05035f6/IMG_1312.jpg', 4.6),
('Moments Captured', 'Videography and drone services', '555-0113', 'book@momentscaptured.com', 'https://2bridges.b-cdn.net/wp-content/uploads/2019/08/candidphotography-1.jpg', 4.8),
('Festive Planners', 'Creative event coordination', '555-0114', 'contact@festiveplanners.com', 'https://shop.christmasphere.com/cdn/shop/products/il_fullxfull.3488991509_a5l2.jpg?v=1668626789&width=1946', 4.7),
('Luxe Transport', 'Luxury transportation services', '555-0115', 'book@luxetransport.com', 'https://www.infinity-luxe-chauffeur.com/wp-content/uploads/2024/02/autocar-location-infinity-luxe-1024x576.png', 4.6),
('Chic Designs', 'Custom event styling', '555-0116', 'design@chicdesigns.com', 'https://www.reveriesocial.com/wp-content/uploads/2024/01/Bold-Color-Maximalist.webp', 4.8),
('Melody Bands', 'Live bands for all occasions', '555-0117', 'info@melodybands.com', 'https://cdn.alivenetwork.com/images/extrabandpics/av5.jpg', 4.7),
('Sparkle Events', 'Event decor and props', '555-0118', 'events@sparkleevents.com', 'https://projectparty.com.au/wp-content/uploads/2021/09/sparkling-events-party-hire-1st-1024x767.jpeg', 4.6),
('Tasteful Menus', 'Customized catering services', '555-0119', 'orders@tastefulmenus.com', 'https://blog.lisi.menu/wp-content/uploads/2023/05/17.-Menu-17-1-1024x683.jpg', 4.8),
('Dream Stages', 'Stage and sound system rentals', '555-0120', 'rentals@dreamstages.com', 'https://theoneupgroup.com/wp-content/uploads/2023/06/Stage-Platform.jpg', 4.7);

-- Insert prices for each vendor for each type (id_type: 1=Wedding, 2=Birthday, 3=Corporate, 4=Concert)
INSERT INTO vendor_type (id_vendor, id_type, price) VALUES
(1, 1, 1500.00), (1, 2, 800.00), (1, 3, 2000.00), (1, 4, 1200.00),
(2, 1, 1000.00), (2, 2, 500.00), (2, 3, 1500.00), (2, 4, 800.00),
(3, 1, 1200.00), (3, 2, 600.00), (3, 3, 1800.00), (3, 4, 2000.00),
(4, 1, 800.00), (4, 2, 400.00), (4, 3, 1000.00), (4, 4, 600.00),
(5, 1, 2500.00), (5, 2, 1000.00), (5, 3, 3000.00), (5, 4, 1500.00),
(6, 1, 600.00), (6, 2, 300.00), (6, 3, 800.00), (6, 4, 500.00),
(7, 1, 900.00), (7, 2, 450.00), (7, 3, 1200.00), (7, 4, 700.00),
(8, 1, 1100.00), (8, 2, 550.00), (8, 3, 1400.00), (8, 4, 900.00),
(9, 1, 1300.00), (9, 2, 650.00), (9, 3, 1600.00), (9, 4, 1100.00),
(10, 1, 2000.00), (10, 2, 900.00), (10, 3, 2500.00), (10, 4, 1300.00),
(11, 1, 1400.00), (11, 2, 700.00), (11, 3, 1800.00), (11, 4, 1000.00),
(12, 1, 850.00), (12, 2, 400.00), (12, 3, 1100.00), (12, 4, 600.00),
(13, 1, 950.00), (13, 2, 450.00), (13, 3, 1200.00), (13, 4, 700.00),
(14, 1, 1700.00), (14, 2, 800.00), (14, 3, 2200.00), (14, 4, 1200.00),
(15, 1, 2000.00), (15, 2, 900.00), (15, 3, 2500.00), (15, 4, 1300.00),
(16, 1, 1100.00), (16, 2, 550.00), (16, 3, 1400.00), (16, 4, 800.00),
(17, 1, 1300.00), (17, 2, 650.00), (17, 3, 1600.00), (17, 4, 1000.00),
(18, 1, 1000.00), (18, 2, 500.00), (18, 3, 1300.00), (18, 4, 700.00),
(19, 1, 1600.00), (19, 2, 800.00), (19, 3, 2000.00), (19, 4, 1100.00),
(20, 1, 1800.00), (20, 2, 900.00), (20, 3, 2300.00), (20, 4, 1200.00);