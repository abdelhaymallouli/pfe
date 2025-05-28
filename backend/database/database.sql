-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 28, 2025 at 10:28 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `spent` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `theme` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `bannerImage` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('upcoming','cancelled','completed') DEFAULT 'upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expected_guests` int(11) NOT NULL DEFAULT 0,
  `budget` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `user_id`, `title`, `type`, `theme`, `date`, `location`, `bannerImage`, `description`, `status`, `created_at`, `expected_guests`, `budget`) VALUES
(1, 1, 'Summer Wedding Reception', 'wedding', NULL, '2025-07-15', 'Crystal Gardens', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg', 'An elegant evening wedding reception', 'upcoming', '2025-05-22 09:23:46', 0, 0.00),
(2, 1, 'Corporate Annual Meeting', 'corporate', NULL, '2025-03-20', 'Grand Conference Center', 'https://images.pexels.com/photos/7175435/pexels-photo-7175435.jpeg', 'Annual shareholders meeting', 'completed', '2025-05-22 09:23:46', 0, 0.00),
(3, 1, 'Sarah\'s Sweet 16', 'birthday', NULL, '2025-04-10', 'Sunset Lounge', 'https://images.pexels.com/photos/2072181/pexels-photo-2072181.jpeg', 'Sweet sixteen birthday celebration', 'upcoming', '2025-05-22 09:23:46', 0, 0.00),
(4, 1, 'Annual Charity Gala', 'social', NULL, '2025-09-05', 'Hilton Ballroom', 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg', 'Fundraising event for local charities', 'completed', '2025-05-22 09:23:46', 0, 0.00),
(5, 1, 'Marketing Workshop', 'corporate', NULL, '2025-06-12', 'Innovation Hub', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg', 'Hands-on marketing strategies training', 'upcoming', '2025-05-22 09:23:46', 0, 0.00),
(6, 1, 'Birthday Bash for Jake', 'birthday', NULL, '2025-08-20', 'Jake\'s Backyard', 'https://www.parents.com/thmb/--pZafKsgGSb8NrJVrV7lqJId9g=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/BirthdayParty-GettyImages-1600792233-c2a961509556414f9f41b92b8471a551.jpg', 'Casual birthday party with friends', 'completed', '2025-05-22 09:23:46', 0, 0.00),
(7, 1, 'Product Launch Event', 'corporate', NULL, '2025-05-15', 'Tech Center Auditorium', 'https://images.pexels.com/photos/1181355/pexels-photo-1181355.jpeg', 'Launch of new software product', 'upcoming', '2025-05-22 09:23:46', 0, 0.00),
(8, 1, 'Community Picnic', 'social', NULL, '2025-07-10', 'City Park', 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg', 'Annual community gathering and picnic', 'completed', '2025-05-22 09:23:46', 0, 0.00),
(9, 1, 'Corporate Team Building', 'corporate', NULL, '2025-10-08', 'Adventure Retreat', 'https://images.pexels.com/photos/3184352/pexels-photo-3184352.jpeg', 'Outdoor team building activities', 'completed', '2025-05-22 09:23:46', 0, 0.00),
(10, 1, 'Laura\s 30th Birthday', 'birthday', NULL, '2025-11-21', 'Downtown Rooftop', 'https://images.pexels.com/photos/1231231/pexels-photo-1231231.jpeg', 'Elegant 30th birthday celebration', 'upcoming', '2025-05-22 09:23:46', 0, 0.00),
(11, 1, 'ahmed birthday', 'birthday', '', '2025-05-27', 'Tangier, Morroco', 'https://t3.ftcdn.net/jpg/04/42/62/12/360_F_442621279_PYhie13pVGcSSYTAm1eqlC3e7Lcy0oNV.jpg', '', 'upcoming', '2025-05-27 11:51:14', 0, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `event_vendors`
--

CREATE TABLE `event_vendors` (
  `id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `vendor_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guests`
--

CREATE TABLE `guests` (
  `id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `rsvp_status` enum('Pending','Accepted','Declined') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `completed` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `event_id`, `title`, `due_date`, `completed`) VALUES
(1, 11, 'Confirm details with Bloom & Petal', NULL, 0),
(2, 11, 'Review contract from Bloom & Petal', NULL, 0),
(3, 11, 'Make initial payment to Bloom & Petal', NULL, 0),
(4, 11, 'Confirm details with SnapShot Studios', NULL, 0),
(5, 11, 'Review contract from SnapShot Studios', NULL, 0),
(6, 11, 'Make initial payment to SnapShot Studios', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'admin', 'yassir@gmail.com', '$2y$10$cKiGfHgvDF/D/uER2.t3fuHyOg1JV2isDtL.rGS6jWdTxB9LJ7kVC', '2025-05-22 09:23:26');

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `rating` float DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `name`, `category`, `description`, `phone`, `email`, `rating`, `created_at`, `image`) VALUES
(1, 'Elegant Events Venue', 'venue', 'Luxury event space with modern amenities', '(555) 123-4567', 'info@elegantevents.com', 4.8, '2025-05-22 13:21:32', 'https://prestigiousvenues.com/wp-content/uploads/bb-plugin/cache/Gala-Dinner-Venue-In-London-Gibson-Hall-Prestigious-Venues-panorama-e59dc799b93c25c0dc960e904af705e0-59099a98687f6.jpg'),
(2, 'Divine Catering Co.', 'catering', 'Gourmet catering for all occasions', '(555) 234-5678', 'events@divinecatering.com', 4.9, '2025-05-22 13:21:32', 'https://cdn-ikpened.nitrocdn.com/IASuVSfAFufVGDVSWpDAfIIJMmSefhYb/assets/images/optimized/rev-866e6ae/sadhgurucatering.com/wp-content/uploads/2023/12/dinner-catering-services-in-ghaziabad-and-noida-e1731795719614.jpg'),
(3, 'Bloom & Petal', 'florist', 'Creative floral designs and arrangements', '(555) 345-6789', 'hello@bloomandpetal.com', 4.7, '2025-05-22 13:21:32', 'https://asset.bloomnation.com/c_pad,d_vendor:global:catalog:product:image.png,f_auto,fl_preserve_transparency,q_auto/v1707205630/vendor/7726/catalog/product/2/0/20210825072528_file_6125f068edb65_6125f07d409c1._6126c9d712420._6126c9d9369da..png'),
(4, 'SnapShot Studios', 'photography', 'Professional photography services for events', '(555) 456-7890', 'contact@snapshotstudios.com', 4.6, '2025-05-22 13:21:32', 'https://www.gpdowntown.com/wp-content/uploads/2018/08/AK9W2808a-1024x1024.jpg'),
(5, 'SoundWave Entertainment', 'entertainment', 'Live bands and DJs for all occasions', '(555) 567-8901', 'bookings@soundwaveent.com', 4.5, '2025-05-22 13:21:32', 'https://cdn0.weddingwire.com/vendor/771810/3_2/960/jpg/1539283650-ad2496ce319f4f2d-1539283648-47d0919af2be09ce-1539283646989-4-DJ33330181006_2019.jpeg'),
(6, 'Gourmet Delights', 'catering', 'Exquisite gourmet dishes tailored to your event', '(555) 678-9012', 'info@gourmetdelights.com', 4.8, '2025-05-22 13:21:32', 'https://www.priestleys-gourmet.com.au/wp-content/uploads/Picture-1.png'),
(7, 'Floral Fantasies', 'florist', 'Bespoke floral arrangements for special events', '(555) 789-0123', 'orders@floralfantasies.com', 4.7, '2025-05-22 13:21:32', 'https://cdn-imgix.headout.com/media/images/c2031e9f0c644fd7f8b252cb9f14b191-Floral-Fantasy-2.jpg?auto=format&w=900&h=562.5&q=90&ar=16%3A10&crop=faces%2Ccenter&fit=crop'),
(8, 'Grand Gala Venues', 'venue', 'Spacious and elegant venues for large gatherings', '(555) 890-1234', 'reservations@grandgala.com', 4.9, '2025-05-22 13:21:32', 'https://bluevista.info/cdn/shop/products/2019-04-06EricGraceWedding-34_2000x.jpg?v=1588447368'),
(9, 'Moments Captured', 'photography', 'Capturing your special moments with precision', '(555) 901-2345', 'services@momentscaptured.com', 4.6, '2025-05-22 13:21:32', 'https://www.photojaanic.com/blog/wp-content/uploads/sites/2/2017/03/00-Lead.jpg'),
(10, 'Rhythm & Beats', 'entertainment', 'High-energy performances to liven up your event', '(555) 012-3456', 'inquiries@rhythmandbeats.com', 4.5, '2025-05-22 13:21:32', 'https://plus.pointblankmusicschool.com/wp-content/uploads/2024/06/DSC1904.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `event_vendors`
--
ALTER TABLE `event_vendors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `vendor_id` (`vendor_id`);

--
-- Indexes for table `guests`
--
ALTER TABLE `guests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `event_vendors`
--
ALTER TABLE `event_vendors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guests`
--
ALTER TABLE `guests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_vendors`
--
ALTER TABLE `event_vendors`
  ADD CONSTRAINT `event_vendors_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  ADD CONSTRAINT `event_vendors_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`);

--
-- Constraints for table `guests`
--
ALTER TABLE `guests`
  ADD CONSTRAINT `guests_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
