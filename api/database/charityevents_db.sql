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
INSERT INTO `categories` VALUES (1,'Fun Run','Charity running events suitable for all ages','2025-10-19 04:14:38','2025-10-19 04:14:38'),(2,'Gala Dinner','Formal charity dinners with speeches and auctions','2025-10-19 04:14:38','2025-10-19 04:14:38'),(3,'Silent Auction','Silent auction events with secret bidding','2025-10-19 04:14:38','2025-10-19 04:14:38'),(4,'Concert','Charity music performances','2025-10-19 04:14:38','2025-10-19 04:14:38'),(5,'Workshop','Educational workshops for skill development','2025-10-19 04:14:38','2025-10-19 04:14:38'),(6,'Sports Tournament','Sports competitions for charity','2025-10-19 04:14:38','2025-10-19 04:14:38');
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
INSERT INTO `events` VALUES (1,'Annual Charity Run 2025','Join our 5km charity run to support children education','This is our 10th annual charity run! All proceeds will directly support local school education programs. Event includes 5km run, kids fun run, and family entertainment area. Water stations, first aid, and finishing medals provided.','2025-10-15 08:00:00','City Central Park','123 Park Avenue, City Central',1,25.00,'paid',10000.00,6725.00,1,500,'2025-10-19 04:14:38','2025-10-19 04:16:46'),(2,'Gala Dinner for Children Hospital','Elegant charity dinner supporting children hospital equipment','Join us for a special evening supporting our local children hospital. Event includes three-course dinner, live music, silent auction, and inspiring speeches. Business attire required.','2025-11-20 19:00:00','Grand Hotel Ballroom','456 Luxury Street, Uptown District',2,150.00,'paid',50000.00,33850.00,1,200,'2025-10-19 04:14:38','2025-10-19 04:16:46'),(3,'Art for Heart Silent Auction','Silent auction of artworks donated by local artists','Browse and bid on wonderful artworks donated by local established and emerging artists. All proceeds support heart disease research. Drinks and snacks provided.','2025-09-30 18:00:00','Community Art Center','789 Art Lane, Cultural District',3,0.00,'free',15000.00,8200.00,1,150,'2025-10-19 04:14:38','2025-10-19 04:14:38'),(4,'Rock for Rescue Concert','Rock concert supporting animal rescue organization','Enjoy an evening of music featuring local bands performing classic rock. All ticket proceeds support medical and care costs for animal rescue organization.','2025-12-05 20:00:00','Downtown Music Hall','321 Sound Street, Entertainment District',4,35.00,'paid',20000.00,12710.00,1,300,'2025-10-19 04:14:38','2025-10-19 04:16:46'),(5,'Coding for Kids Workshop','Free programming workshop introducing kids to computer science','In this interactive workshop, children will learn programming basics. Suitable for ages 8-12. Pre-registration required. Donations optional.','2025-10-25 10:00:00','Tech Innovation Center','654 Code Avenue, Tech Park',5,0.00,'free',5000.00,3200.00,1,30,'2025-10-19 04:14:38','2025-10-19 04:14:38'),(6,'Charity Basketball Tournament','3v3 basketball competition supporting youth sports programs','Form your team for this exciting 3v3 basketball tournament! All skill levels welcome. Prizes include trophies and sports equipment.','2025-11-12 09:00:00','City Sports Complex','987 Sport Way, Athletic District',6,15.00,'paid',8000.00,4545.00,1,100,'2025-10-19 04:14:38','2025-10-19 04:16:46'),(7,'Winter Gala for Homeless Shelter','Winter charity dinner raising funds for homeless shelter','Join us this holiday season to support the homeless shelter. Event includes dinner, dancing, and raffle prizes.','2025-12-15 18:30:00','Riverside Convention Center','147 Event Boulevard, Riverside',2,75.00,'paid',25000.00,18450.00,1,250,'2025-10-19 04:14:38','2025-10-19 04:16:46'),(8,'Sunset Yoga for Mental Health','Sunset yoga class supporting mental health awareness','Join a relaxing yoga class against the beautiful backdrop of park sunset. All levels welcome. Please bring your own yoga mat.','2025-09-20 17:30:00','Sunset Park','258 Serenity Road, Westside',5,20.00,'paid',3000.00,2160.00,1,50,'2025-10-19 04:14:38','2025-10-19 04:16:46'),(9,'Cancelled: Summer Festival 2025','Summer festival cancelled due to weather conditions','This event has been cancelled. All purchased tickets will be fully refunded.','2025-08-10 12:00:00','City Park',NULL,4,0.00,'free',10000.00,0.00,0,NULL,'2025-10-19 04:14:38','2025-10-19 04:14:38');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `ticket_quantity` int NOT NULL DEFAULT '1',
  `special_requirements` text COLLATE utf8mb4_unicode_ci,
  `registration_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_status` enum('pending','paid','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_email` (`email`),
  KEY `idx_registration_date` (`registration_date`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES (1,1,'John Smith','john.smith@email.com','+61 412 345 678','Jane Smith','+61 423 456 789','123 Main Street, Sydney NSW 2000',2,'Vegetarian meal preference','2025-10-19 04:15:45',50.00,'paid'),(2,1,'Sarah Johnson','sarah.johnson@email.com','+61 498 765 432','Michael Johnson','+61 487 654 321','456 Park Avenue, Melbourne VIC 3000',1,'Allergic to nuts','2025-10-19 04:15:45',25.00,'paid'),(3,1,'David Wilson','david.wilson@email.com','+61 411 223 344','Emma Wilson','+61 422 334 455','789 Beach Road, Brisbane QLD 4000',3,'Wheelchair access required','2025-10-19 04:15:45',75.00,'pending'),(4,2,'Robert Brown','robert.brown@email.com','+61 455 667 788','Lisa Brown','+61 466 778 899','321 Oak Street, Perth WA 6000',2,'Seating preference: near stage','2025-10-19 04:15:45',300.00,'paid'),(5,2,'Jennifer Davis','jennifer.davis@email.com','+61 477 889 900','Thomas Davis','+61 488 990 011','654 Pine Road, Adelaide SA 5000',1,'No special requirements','2025-10-19 04:15:45',150.00,'paid'),(6,2,'Christopher Lee','christopher.lee@email.com','+61 499 001 122','Amanda Lee','+61 400 112 233','987 Cedar Lane, Hobart TAS 7000',4,'Vegetarian meals for all','2025-10-19 04:15:45',600.00,'pending'),(7,3,'Michelle Taylor','michelle.taylor@email.com','+61 433 445 566','James Taylor','+61 444 556 677','147 Maple Avenue, Darwin NT 0800',1,'Interested in modern art','2025-10-19 04:15:45',0.00,'paid'),(8,3,'Daniel Clark','daniel.clark@email.com','+61 466 778 899','Sophia Clark','+61 477 889 900','258 Elm Street, Canberra ACT 2600',2,'Bringing partner','2025-10-19 04:15:45',0.00,'paid'),(9,4,'Jessica White','jessica.white@email.com','+61 488 990 011','Andrew White','+61 499 001 122','369 Birch Road, Gold Coast QLD 4217',2,'Prefer standing area','2025-10-19 04:15:45',70.00,'paid'),(10,4,'Matthew Harris','matthew.harris@email.com','+61 411 223 344','Olivia Harris','+61 422 334 455','741 Spruce Boulevard, Newcastle NSW 2300',1,'Allergic to seafood','2025-10-19 04:15:45',35.00,'pending'),(11,5,'Emily Martin','emily.martin@email.com','+61 433 445 566','William Martin','+61 444 556 677','852 Willow Way, Wollongong NSW 2500',1,'Child age: 10 years','2025-10-19 04:15:45',0.00,'paid'),(12,5,'Kevin Anderson','kevin.anderson@email.com','+61 455 667 788','Rachel Anderson','+61 466 778 899','963 Palm Court, Geelong VIC 3220',2,'Two children ages 8 and 11','2025-10-19 04:15:45',0.00,'pending'),(13,6,'Brian Thompson','brian.thompson@email.com','+61 477 889 900','Nicole Thompson','+61 488 990 011','159 Oak Lane, Townsville QLD 4810',1,'Team name: Thunder','2025-10-19 04:15:45',15.00,'paid'),(14,6,'Amanda Garcia','amanda.garcia@email.com','+61 499 001 122','Carlos Garcia','+61 400 112 233','753 Pine Street, Cairns QLD 4870',3,'Team of 3 players','2025-10-19 04:15:45',45.00,'pending'),(15,7,'Steven Robinson','steven.robinson@email.com','+61 411 223 344','Michelle Robinson','+61 422 334 455','486 Cedar Avenue, Sunshine Coast QLD 4560',2,'Table preference: near entrance','2025-10-19 04:15:45',150.00,'paid'),(16,7,'Melissa Walker','melissa.walker@email.com','+61 433 445 566','Richard Walker','+61 444 556 677','624 Maple Road, Launceston TAS 7250',1,'Vegetarian meal','2025-10-19 04:15:45',75.00,'pending'),(17,8,'Patrick King','patrick.king@email.com','+61 455 667 788','Sarah King','+61 466 778 899','937 Birch Lane, Ballarat VIC 3350',1,'Beginner level','2025-10-19 04:15:45',20.00,'paid'),(18,8,'Rebecca Scott','rebecca.scott@email.com','+61 477 889 900','Mark Scott','+61 488 990 011','281 Elm Court, Bendigo VIC 3550',2,'Bringing own yoga mats','2025-10-19 04:15:45',40.00,'pending');
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-19 12:17:49
