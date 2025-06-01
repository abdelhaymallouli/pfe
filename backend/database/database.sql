-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 01, 2025 at 11:34 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `venuvibe`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id_admin` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `date_creation` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id_admin`, `nom`, `email`, `mot_de_passe`, `date_creation`) VALUES
(1, 'Admin User', 'admin@venuvibe.com', '$2y$10$3tV8Qz6kXz9y7n1m2o3p4u5v6w7x8y9z0a1b2c3d4e5f6g7h8i9j0', '2025-06-01 10:47:33');

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `id_client` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `date_creation` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`id_client`, `nom`, `email`, `mot_de_passe`, `date_creation`) VALUES
(1, 'admin', 'yassir@gmail.com', '$2y$10$lF5yn2bDbRlZD8WoIRatReealO6Eu7u1WQU0PDNGZ1CNuFrlqYV56', '2025-05-30 18:57:21'),
(2, 'abdelhay mallouli', 'abdelhay.mallouli.solicode@gmail.com', '$2y$10$iRnaRixiZj8JlrPvDsIYnuOeZ/eOLYJuIwYMZK4Ifp3ReduwsaQjm', '2025-06-01 21:11:34');

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE `event` (
  `id_event` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `lieu` varchar(100) DEFAULT NULL,
  `image_banniere` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `statut` enum('Planned','Ongoing','Completed','Cancelled') DEFAULT 'Planned',
  `expected_guests` int(11) DEFAULT NULL,
  `budget` decimal(10,2) DEFAULT NULL,
  `date_creation` datetime DEFAULT current_timestamp(),
  `id_client` int(11) NOT NULL,
  `id_type` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event`
--

INSERT INTO `event` (`id_event`, `title`, `date`, `lieu`, `image_banniere`, `description`, `statut`, `expected_guests`, `budget`, `date_creation`, `id_client`, `id_type`) VALUES
(11, 'Summer Garden Wedding', '2025-07-15', 'Rosewood Manor, CA', 'https://images.unsplash.com/photo-1566933292668-7f9b4d4038ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', 'A romantic outdoor wedding with floral decorations and live music.', 'Planned', 150, 25001.00, '2025-05-30 19:08:39', 1, 2),
(12, '30th Birthday Bash', '2025-08-22', 'Downtown Loft, NY', 'https://images.unsplash.com/photo-1517457373958-b4bdd8b50cac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', 'A vibrant birthday party with DJ and rooftop views.', 'Planned', 50, 5000.00, '2025-05-30 19:08:39', 1, 2),
(13, 'TechCorp Annual Summit', '2025-09-10', 'Convention Center, SF', 'https://images.unsplash.com/photo-1516321318427-4b1c11f8e668?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', 'A corporate summit featuring keynote speakers and networking.', 'Planned', 300, 75000.00, '2025-05-30 19:08:39', 1, 3),
(14, 'Rock Legends Concert', '2025-10-05', 'City Arena, TX', 'https://images.unsplash.com/photo-1493225457124-fd3f7a3c2a88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', 'A high-energy concert with top rock bands.', 'Planned', 5000, 150000.00, '2025-05-30 19:08:39', 1, 4),
(15, 'Winter Vows Ceremony', '2025-12-20', 'Snowy Pines Lodge, CO', 'https://images.unsplash.com/photo-1519741497674-4113f4c0a2c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', 'A cozy winter wedding in a mountain lodge.', 'Planned', 80, 19000.00, '2025-05-30 19:08:39', 1, 1),
(16, 'Kids Birthday Extravaganza', '2025-11-12', 'FunZone Park, FL', 'https://images.unsplash.com/photo-1530103862298-25c821d723ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', 'A fun-filled birthday with games and entertainment for kids.', 'Planned', 30, 3000.00, '2025-05-30 19:08:39', 1, 2),
(17, 'Startup Networking Event', '2025-10-25', 'Tech Hub, Boston', 'https://images.unsplash.com/photo-1516321318427-4b1c11f8e668?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', 'A networking event for startups and investors.', 'Planned', 100, 10000.00, '2025-05-30 19:08:39', 1, 3),
(18, 'Jazz Night Concert', '2025-11-30', 'Blue Note Club, NY', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', 'An intimate jazz concert with renowned artists.', 'Planned', 200, 12000.00, '2025-05-30 19:08:39', 1, 4),
(19, 'Beachside Wedding', '2025-06-30', 'Ocean Breeze Resort, FL', 'https://images.unsplash.com/photo-1515934751633-2054f0c73f42?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', 'A beachfront wedding with sunset views.', 'Planned', 120, 22034.00, '2025-05-30 19:08:39', 1, 1),
(20, 'Corporate Charity Gala', '2025-12-05', 'Grand Ballroom, Chicago', 'https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', 'A formal gala to raise funds for local charities.', 'Planned', 250, 50000.00, '2025-05-30 19:08:39', 1, 3),
(24, 'birthday', '2025-05-24', 'tangier', NULL, '', 'Planned', 450, 4000.00, '2025-05-30 22:37:43', 1, 3),
(28, 'ahmed birthday ', '2025-06-07', 'tangier', NULL, '', 'Planned', 4304, 10000.00, '2025-05-31 12:37:00', 1, 1),
(29, 'weeding', '2025-05-27', 'tangier', NULL, '', 'Planned', 240, 1000.00, '2025-05-31 13:27:20', 1, 2),
(30, 'ahmed birghday', '2025-05-14', 'tangier', NULL, '', 'Planned', 450, 5000.00, '2025-05-31 17:15:31', 1, 1),
(31, 'birthday ', '2025-06-04', 'tangier', NULL, '', 'Planned', 450, 4000.00, '2025-05-31 17:22:06', 1, 2),
(32, 'happy birthday ', '2025-06-11', 'tangier', NULL, '', 'Planned', 454, 9999.00, '2025-06-01 14:30:31', 1, 2),
(33, 'birthday ', '2025-06-12', 'tangier', NULL, '', 'Planned', 33, 4500.00, '2025-06-01 19:34:40', 1, 2),
(34, 'adelhay', '2025-06-01', 'Snowy Pines Lodge, CO', NULL, '', 'Planned', 250, 5000.00, '2025-06-01 21:10:00', 1, 3),
(35, 'ahmed birthday ', '2025-06-13', 'Snowy Pines Lodge, CO', NULL, '', 'Planned', 45, 1000.00, '2025-06-01 21:42:23', 2, 2),
(36, 'abdelhay', '2025-06-29', 'tangier', NULL, '', 'Planned', 50, 4999.00, '2025-06-01 22:30:54', 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `requete`
--

CREATE TABLE `requete` (
  `id_requete` int(11) NOT NULL,
  `titre` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `date_limite` date DEFAULT NULL,
  `statut` enum('Open','In Progress','Completed','Cancelled') DEFAULT 'Open',
  `id_event` int(11) NOT NULL,
  `id_transaction` int(11) DEFAULT NULL,
  `vendor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `requete`
--

INSERT INTO `requete` (`id_requete`, `titre`, `description`, `date_limite`, `statut`, `id_event`, `id_transaction`, `vendor_id`) VALUES
(10, 'Confirm details with Elite Catering', NULL, NULL, 'In Progress', 24, 33, 1),
(11, 'Confirm details with Starlight Decor', NULL, NULL, 'Open', 24, 34, 2),
(12, 'Confirm details with Bliss Photography', NULL, NULL, 'Open', 24, 35, 4),
(13, 'Confirm details with Tasty Treats', NULL, NULL, 'In Progress', 28, 4, 6),
(14, 'Confirm details with Bright Lights', NULL, NULL, 'Completed', 28, 5, 7),
(15, 'Confirm details with Pure Elegance', NULL, NULL, 'Completed', 28, 6, 8),
(16, 'Confirm details with Golden Venue', NULL, NULL, 'Completed', 29, 7, 5),
(17, 'Confirm details with Tasty Treats', NULL, NULL, 'Open', 29, 8, 6),
(18, 'Confirm details with Elite Catering', NULL, NULL, 'Open', 30, 9, 1),
(19, 'Confirm details with Starlight Decor', NULL, NULL, 'Open', 30, 10, 2),
(20, 'Confirm details with Harmony Music', NULL, NULL, 'Open', 30, 11, 3),
(21, 'Confirm details with Bliss Photography', NULL, NULL, 'Open', 30, 12, 4),
(22, 'Confirm details with Golden Venue', NULL, NULL, 'Open', 30, 13, 5),
(23, 'Confirm details with Tasty Treats', NULL, NULL, 'Open', 30, 14, 6),
(24, 'Confirm details with Chic Designs', NULL, NULL, 'Open', 30, 15, 16),
(25, 'Confirm details with Sparkle Events', NULL, NULL, 'Open', 30, 16, 18),
(32, 'Confirm details with Elite Catering', NULL, NULL, 'Open', 11, 23, 1),
(33, 'Confirm details with Starlight Decor', NULL, NULL, 'Open', 11, 24, 2),
(34, 'Confirm details with Bliss Photography', NULL, NULL, 'Open', 11, 25, 4),
(42, 'photography', NULL, NULL, 'Open', 28, 36, 3),
(43, 'photography', NULL, NULL, 'Open', 15, 37, 4);

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `id_transaction` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date` datetime DEFAULT current_timestamp(),
  `id_event` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaction`
--

INSERT INTO `transaction` (`id_transaction`, `montant`, `date`, `id_event`) VALUES
(4, 600.00, '2025-05-31 12:37:00', 28),
(5, 900.00, '2025-05-31 12:37:00', 28),
(6, 1100.00, '2025-05-31 12:37:00', 28),
(7, 1000.00, '2025-05-31 13:27:20', 29),
(8, 300.00, '2025-05-31 13:27:20', 29),
(9, 1500.00, '2025-05-31 17:15:31', 30),
(10, 1000.00, '2025-05-31 17:15:31', 30),
(11, 1200.00, '2025-05-31 17:15:31', 30),
(12, 800.00, '2025-05-31 17:15:31', 30),
(13, 2500.00, '2025-05-31 17:15:31', 30),
(14, 600.00, '2025-05-31 17:15:31', 30),
(15, 1100.00, '2025-05-31 17:15:31', 30),
(16, 1000.00, '2025-05-31 17:15:31', 30),
(23, 800.00, '2025-06-01 11:54:24', 11),
(24, 500.00, '2025-06-01 11:54:24', 11),
(25, 400.00, '2025-06-01 11:54:24', 11),
(33, 1500.00, '2025-06-01 14:20:13', 24),
(34, 500.00, '2025-06-01 14:20:13', 24),
(35, 400.00, '2025-06-01 14:20:13', 24),
(36, 1200.00, '2025-06-01 22:09:10', 28),
(37, 800.00, '2025-06-01 22:09:24', 15);

-- --------------------------------------------------------

--
-- Table structure for table `type`
--

CREATE TABLE `type` (
  `id_type` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `type`
--

INSERT INTO `type` (`id_type`, `name`) VALUES
(1, 'Wedding'),
(2, 'Birthday'),
(3, 'Corporate'),
(4, 'Concert');

-- --------------------------------------------------------

--
-- Table structure for table `vendor`
--

CREATE TABLE `vendor` (
  `id_vendor` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `note` decimal(3,2) DEFAULT NULL,
  `date_creation` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendor`
--

INSERT INTO `vendor` (`id_vendor`, `nom`, `description`, `phone`, `email`, `image`, `note`, `date_creation`) VALUES
(1, 'Elite Catering', 'Premium catering services for all events', '555-0101', 'contact@elitecatering.com', 'https://cdn.pixabay.com/photo/2016/03/27/18/53/drinks-1283608_1280.jpg', 4.80, '2025-05-30 19:33:39'),
(2, 'Starlight Decor', 'Elegant decor solutions for memorable events', '555-0102', 'info@starlightdecor.com', 'https://cdn.pixabay.com/photo/2021/11/22/18/29/laser-show-6817130_1280.jpg', 4.60, '2025-05-30 19:33:39'),
(3, 'Harmony Music', 'Live music and DJ services', '555-0103', 'bookings@harmonymusic.com', 'https://cdn.pixabay.com/photo/2020/11/27/07/32/choir-5781096_1280.jpg', 4.70, '2025-05-30 19:33:39'),
(4, 'Bliss Photography', 'Professional event photography', '555-0104', 'hello@blissphoto.com', 'https://www.weddedblissphotography.com/wp-content/uploads/2014/04/27-12610-pp_gallery/Vernon-Wedding-Photographer-Wedded-Bliss-Photography-www.weddedblissphotography.com-0160(pp_w799_h533).jpg', 4.90, '2025-05-30 19:33:39'),
(5, 'Golden Venue', 'Luxury venue rentals', '555-0105', 'reservations@goldenvenue.com', 'https://cdn0.weddingwire.com/vendor/118851/3_2/960/jpg/a-4_51_2158811-169774370863218.webp', 4.50, '2025-05-30 19:33:39'),
(6, 'Tasty Treats', 'Custom cakes and desserts', '555-0106', 'orders@tastytreats.com', 'https://www.somewhatsimple.com/wp-content/uploads/2018/05/cake_mix_cookies_10.jpg', 4.70, '2025-05-30 19:33:39'),
(7, 'Bright Lights', 'Event lighting specialists', '555-0107', 'info@brightlights.com', 'https://upload.wikimedia.org/wikipedia/en/6/6b/CeeLo-BrightLightsBiggerCity.jpg', 4.60, '2025-05-30 19:33:39'),
(8, 'Pure Elegance', 'Floral arrangements and designs', '555-0108', 'contact@pureelegance.com', 'https://res.cloudinary.com/ufn/image/upload/c_pad,f_auto,q_auto,fl_progressive,dpr_1.5,w_241,h_270/1622836145948_6.jpg', 4.80, '2025-05-30 19:33:39'),
(9, 'Vibe Entertainment', 'Interactive entertainment services', '555-0109', 'events@vibeent.com', 'https://cdn0.weddingwire.com/vendor/173800/3_2/960/jpg/1528347552-3b05eb7edc12bad2-1528347551-1383ba5375745fcd-1528347551397-1-Vibe_Entertainment.jpeg', 4.50, '2025-05-30 19:33:39'),
(10, 'Crystal Events', 'Full-service event planning', '555-0110', 'plan@crystalevents.com', 'https://crystalfes.com/media/pages/galerie/6f2c89c5a3-1702416790/salle-fetes-fes-600x450-crop.jpg', 4.90, '2025-05-30 19:33:39'),
(11, 'Gourmet Bites', 'Gourmet food catering', '555-0111', 'info@gourmetbites.com', 'https://static.wixstatic.com/media/d425e0_f3d99e7b721445739657d9a26abd6b4b~mv2.jpg/v1/fill/w_742,h_496,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/d425e0_f3d99e7b721445739657d9a26abd6b4b~mv2.jpg', 4.70, '2025-05-30 19:33:39'),
(12, 'Skyline Rentals', 'Furniture and equipment rentals', '555-0112', 'rentals@skylinerentals.com', 'https://images.squarespace-cdn.com/content/v1/5f85d73f24a4090c6e56e9fd/2a1daf2f-d05b-48da-aeb0-6435d05035f6/IMG_1312.jpg', 4.60, '2025-05-30 19:33:39'),
(13, 'Moments Captured', 'Videography and drone services', '555-0113', 'book@momentscaptured.com', 'https://2bridges.b-cdn.net/wp-content/uploads/2019/08/candidphotography-1.jpg', 4.80, '2025-05-30 19:33:39'),
(14, 'Festive Planners', 'Creative event coordination', '555-0114', 'contact@festiveplanners.com', 'https://shop.christmasphere.com/cdn/shop/products/il_fullxfull.3488991509_a5l2.jpg?v=1668626789&width=1946', 4.70, '2025-05-30 19:33:39'),
(15, 'Luxe Transport', 'Luxury transportation services', '555-0115', 'book@luxetransport.com', 'https://www.infinity-luxe-chauffeur.com/wp-content/uploads/2024/02/autocar-location-infinity-luxe-1024x576.png', 4.60, '2025-05-30 19:33:39'),
(16, 'Chic Designs', 'Custom event styling', '555-0116', 'design@chicdesigns.com', 'https://www.reveriesocial.com/wp-content/uploads/2024/01/Bold-Color-Maximalist.webp', 4.80, '2025-05-30 19:33:39'),
(17, 'Melody Bands', 'Live bands for all occasions', '555-0117', 'info@melodybands.com', 'https://cdn.alivenetwork.com/images/extrabandpics/av5.jpg', 4.70, '2025-05-30 19:33:39'),
(18, 'Sparkle Events', 'Event decor and props', '555-0118', 'events@sparkleevents.com', 'https://projectparty.com.au/wp-content/uploads/2021/09/sparkling-events-party-hire-1st-1024x767.jpeg', 4.60, '2025-05-30 19:33:39'),
(19, 'Tasteful Menus', 'Customized catering services', '555-0119', 'orders@tastefulmenus.com', 'https://blog.lisi.menu/wp-content/uploads/2023/05/17.-Menu-17-1-1024x683.jpg', 4.80, '2025-05-30 19:33:39'),
(20, 'Dream Stages', 'Stage and sound system rentals', '555-0120', 'rentals@dreamstages.com', 'https://theoneupgroup.com/wp-content/uploads/2023/06/Stage-Platform.jpg', 4.70, '2025-05-30 19:33:39'),
(21, '', NULL, NULL, '', NULL, NULL, '2025-06-01 11:18:48');

-- --------------------------------------------------------

--
-- Table structure for table `vendor_type`
--

CREATE TABLE `vendor_type` (
  `id_vendor` int(11) NOT NULL,
  `id_type` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendor_type`
--

INSERT INTO `vendor_type` (`id_vendor`, `id_type`, `price`) VALUES
(1, 1, 1500.00),
(1, 2, 800.00),
(1, 3, 2000.00),
(1, 4, 1200.00),
(2, 1, 1000.00),
(2, 2, 500.00),
(2, 3, 1500.00),
(2, 4, 800.00),
(3, 1, 1200.00),
(3, 2, 600.00),
(3, 3, 1800.00),
(3, 4, 2000.00),
(4, 1, 800.00),
(4, 2, 400.00),
(4, 3, 1000.00),
(4, 4, 600.00),
(5, 1, 2500.00),
(5, 2, 1000.00),
(5, 3, 3000.00),
(5, 4, 1500.00),
(6, 1, 600.00),
(6, 2, 300.00),
(6, 3, 800.00),
(6, 4, 500.00),
(7, 1, 900.00),
(7, 2, 450.00),
(7, 3, 1200.00),
(7, 4, 700.00),
(8, 1, 1100.00),
(8, 2, 550.00),
(8, 3, 1400.00),
(8, 4, 900.00),
(9, 1, 1300.00),
(9, 2, 650.00),
(9, 3, 1600.00),
(9, 4, 1100.00),
(10, 1, 2000.00),
(10, 2, 900.00),
(10, 3, 2500.00),
(10, 4, 1300.00),
(11, 1, 1400.00),
(11, 2, 700.00),
(11, 3, 1800.00),
(11, 4, 1000.00),
(12, 1, 850.00),
(12, 2, 400.00),
(12, 3, 1100.00),
(12, 4, 600.00),
(13, 1, 950.00),
(13, 2, 450.00),
(13, 3, 1200.00),
(13, 4, 700.00),
(14, 1, 1700.00),
(14, 2, 800.00),
(14, 3, 2200.00),
(14, 4, 1200.00),
(15, 1, 2000.00),
(15, 2, 900.00),
(15, 3, 2500.00),
(15, 4, 1300.00),
(16, 1, 1100.00),
(16, 2, 550.00),
(16, 3, 1400.00),
(16, 4, 800.00),
(17, 1, 1300.00),
(17, 2, 650.00),
(17, 3, 1600.00),
(17, 4, 1000.00),
(18, 1, 1000.00),
(18, 2, 500.00),
(18, 3, 1300.00),
(18, 4, 700.00),
(19, 1, 1600.00),
(19, 2, 800.00),
(19, 3, 2000.00),
(19, 4, 1100.00),
(20, 1, 1800.00),
(20, 2, 900.00),
(20, 3, 2300.00),
(20, 4, 1200.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`id_client`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`id_event`),
  ADD KEY `id_client` (`id_client`),
  ADD KEY `id_type` (`id_type`);

--
-- Indexes for table `requete`
--
ALTER TABLE `requete`
  ADD PRIMARY KEY (`id_requete`),
  ADD KEY `id_event` (`id_event`),
  ADD KEY `requete_ibfk_2` (`id_transaction`),
  ADD KEY `requete_ibfk_3` (`vendor_id`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id_transaction`),
  ADD KEY `id_event` (`id_event`);

--
-- Indexes for table `type`
--
ALTER TABLE `type`
  ADD PRIMARY KEY (`id_type`);

--
-- Indexes for table `vendor`
--
ALTER TABLE `vendor`
  ADD PRIMARY KEY (`id_vendor`);

--
-- Indexes for table `vendor_type`
--
ALTER TABLE `vendor_type`
  ADD PRIMARY KEY (`id_vendor`,`id_type`),
  ADD KEY `id_type` (`id_type`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `id_client` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `event`
--
ALTER TABLE `event`
  MODIFY `id_event` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `requete`
--
ALTER TABLE `requete`
  MODIFY `id_requete` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `id_transaction` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `type`
--
ALTER TABLE `type`
  MODIFY `id_type` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `vendor`
--
ALTER TABLE `vendor`
  MODIFY `id_vendor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `event`
--
ALTER TABLE `event`
  ADD CONSTRAINT `event_ibfk_1` FOREIGN KEY (`id_client`) REFERENCES `client` (`id_client`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_ibfk_2` FOREIGN KEY (`id_type`) REFERENCES `type` (`id_type`);

--
-- Constraints for table `requete`
--
ALTER TABLE `requete`
  ADD CONSTRAINT `requete_ibfk_1` FOREIGN KEY (`id_event`) REFERENCES `event` (`id_event`) ON DELETE CASCADE,
  ADD CONSTRAINT `requete_ibfk_2` FOREIGN KEY (`id_transaction`) REFERENCES `transaction` (`id_transaction`) ON DELETE SET NULL,
  ADD CONSTRAINT `requete_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `vendor` (`id_vendor`) ON DELETE SET NULL;

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`id_event`) REFERENCES `event` (`id_event`) ON DELETE CASCADE;

--
-- Constraints for table `vendor_type`
--
ALTER TABLE `vendor_type`
  ADD CONSTRAINT `vendor_type_ibfk_1` FOREIGN KEY (`id_vendor`) REFERENCES `vendor` (`id_vendor`) ON DELETE CASCADE,
  ADD CONSTRAINT `vendor_type_ibfk_2` FOREIGN KEY (`id_type`) REFERENCES `type` (`id_type`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
