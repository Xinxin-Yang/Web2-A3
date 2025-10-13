-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: charityevents_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Fun Run','Charity running events suitable for all ages','2025-10-03 17:45:13','2025-10-03 17:45:13'),(2,'Gala Dinner','Formal charity dinners with speeches and auctions','2025-10-03 17:45:13','2025-10-03 17:45:13'),(3,'Silent Auction','Silent auction events with secret bidding','2025-10-03 17:45:13','2025-10-03 17:45:13'),(4,'Concert','Charity music performances','2025-10-03 17:45:13','2025-10-03 17:45:13'),(5,'Workshop','Educational workshops for skill development','2025-10-03 17:45:13','2025-10-03 17:45:13'),(6,'Sports Tournament','Sports competitions for charity','2025-10-03 17:45:13','2025-10-03 17:45:13');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_description` text COLLATE utf8mb4_unicode_ci,
  `date_time` datetime NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `category_id` int NOT NULL,
  `ticket_price` decimal(10,2) DEFAULT '0.00',
  `ticket_type` enum('free','paid') COLLATE utf8mb4_unicode_ci DEFAULT 'free',
  `goal_amount` decimal(10,2) DEFAULT '0.00',
  `current_amount` decimal(10,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `max_attendees` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_date` (`date_time`),
  KEY `idx_events_location` (`location`),
  KEY `idx_events_category` (`category_id`),
  KEY `idx_events_active` (`is_active`),
  KEY `idx_events_date_active` (`date_time`,`is_active`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Annual Charity Run 2025','Join our 5km charity run to support children education','This is our 10th annual charity run! All proceeds will directly support local school education programs. Event includes 5km run, kids fun run, and family entertainment area. Water stations, first aid, and finishing medals provided.','2025-10-15 08:00:00','City Central Park','123 Park Avenue, City Central',1,25.00,'paid',10000.00,6500.00,1,500,'2025-10-03 17:45:13','2025-10-03 17:45:13'),(2,'Gala Dinner for Children Hospital','Elegant charity dinner supporting children hospital equipment','Join us for a special evening supporting our local children hospital. Event includes three-course dinner, live music, silent auction, and inspiring speeches. Business attire required.','2025-11-20 19:00:00','Grand Hotel Ballroom','456 Luxury Street, Uptown District',2,150.00,'paid',50000.00,32500.00,1,200,'2025-10-03 17:45:13','2025-10-03 17:45:13'),(3,'Art for Heart Silent Auction','Silent auction of artworks donated by local artists','Browse and bid on wonderful artworks donated by local established and emerging artists. All proceeds support heart disease research. Drinks and snacks provided.','2025-09-30 18:00:00','Community Art Center','789 Art Lane, Cultural District',3,0.00,'free',15000.00,8200.00,1,150,'2025-10-03 17:45:13','2025-10-03 17:45:13'),(4,'Rock for Rescue Concert','Rock concert supporting animal rescue organization','Enjoy an evening of music featuring local bands performing classic rock. All ticket proceeds support medical and care costs for animal rescue organization.','2025-12-05 20:00:00','Downtown Music Hall','321 Sound Street, Entertainment District',4,35.00,'paid',20000.00,12500.00,1,300,'2025-10-03 17:45:13','2025-10-03 17:45:13'),(5,'Coding for Kids Workshop','Free programming workshop introducing kids to computer science','In this interactive workshop, children will learn programming basics. Suitable for ages 8-12. Pre-registration required. Donations optional.','2025-10-25 10:00:00','Tech Innovation Center','654 Code Avenue, Tech Park',5,0.00,'free',5000.00,3200.00,1,30,'2025-10-03 17:45:13','2025-10-03 17:45:13'),(6,'Charity Basketball Tournament','3v3 basketball competition supporting youth sports programs','Form your team for this exciting 3v3 basketball tournament! All skill levels welcome. Prizes include trophies and sports equipment.','2025-11-12 09:00:00','City Sports Complex','987 Sport Way, Athletic District',6,15.00,'paid',8000.00,4500.00,1,100,'2025-10-03 17:45:13','2025-10-03 17:45:13'),(7,'Winter Gala for Homeless Shelter','Winter charity dinner raising funds for homeless shelter','Join us this holiday season to support the homeless shelter. Event includes dinner, dancing, and raffle prizes.','2025-12-15 18:30:00','Riverside Convention Center','147 Event Boulevard, Riverside',2,75.00,'paid',25000.00,18000.00,1,250,'2025-10-03 17:45:13','2025-10-03 17:45:13'),(8,'Sunset Yoga for Mental Health','Sunset yoga class supporting mental health awareness','Join a relaxing yoga class against the beautiful backdrop of park sunset. All levels welcome. Please bring your own yoga mat.','2025-09-20 17:30:00','Sunset Park','258 Serenity Road, Westside',5,20.00,'paid',3000.00,2100.00,1,50,'2025-10-03 17:45:13','2025-10-03 17:45:13'),(9,'Cancelled: Summer Festival 2025','Summer festival cancelled due to weather conditions','This event has been cancelled. All purchased tickets will be fully refunded.','2025-08-10 12:00:00','City Park',NULL,4,0.00,'free',10000.00,0.00,0,NULL,'2025-10-03 17:45:13','2025-10-03 17:45:13');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-17 19:18:56
