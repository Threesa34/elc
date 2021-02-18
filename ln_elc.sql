-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 18, 2021 at 01:12 PM
-- Server version: 10.4.13-MariaDB
-- PHP Version: 7.3.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ln_elc`
--

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(1000) DEFAULT NULL,
  `gender` varchar(1000) DEFAULT NULL,
  `email` varchar(1000) DEFAULT NULL,
  `mobile1` bigint(20) DEFAULT NULL,
  `mobile2` bigint(20) DEFAULT NULL,
  `dob` datetime DEFAULT NULL,
  `createddate` datetime NOT NULL DEFAULT current_timestamp(),
  `createdby` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `listallocation`
--

CREATE TABLE `listallocation` (
  `id` int(11) NOT NULL,
  `listid` int(11) DEFAULT NULL,
  `userid` int(11) DEFAULT NULL,
  `createddate` datetime NOT NULL DEFAULT current_timestamp(),
  `createdby` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `listnos`
--

CREATE TABLE `listnos` (
  `id` int(11) NOT NULL,
  `listno` varchar(1000) DEFAULT NULL,
  `oldlistno` varchar(1000) DEFAULT NULL,
  `createddate` datetime NOT NULL DEFAULT current_timestamp(),
  `modifieddate` datetime NOT NULL DEFAULT current_timestamp(),
  `createdby` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(1000) DEFAULT NULL,
  `email` varchar(1000) DEFAULT NULL,
  `mobile` bigint(20) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `customerid` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 0,
  `password` varchar(200) DEFAULT NULL,
  `firstlogin` int(11) DEFAULT NULL,
  `createddate` datetime NOT NULL DEFAULT current_timestamp(),
  `createdby` int(11) DEFAULT NULL,
  `deviceid` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `role`, `customerid`, `status`, `password`, `firstlogin`, `createddate`, `createdby`, `deviceid`) VALUES
(1, 'Mayur Mhatre', 'mhatre975@gmail.com', 9768241151, 'Superadmin', NULL, 0, 'da00acb882ad42f756f10038703d7347', 1, '2021-02-10 16:48:01', NULL, NULL),
(2, 'Yogesh M Bhoir.', 'threesainfoway00@gmail.com', 9768634000, 'admin', NULL, 0, 'dbf5b38c657d26e0f0af937f57716368', 1, '2021-02-10 18:53:28', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `voters`
--

CREATE TABLE `voters` (
  `id` int(11) NOT NULL,
  `name` varchar(1000) DEFAULT NULL,
  `email` varchar(1000) DEFAULT NULL,
  `mobile1` bigint(20) DEFAULT NULL,
  `mobile2` bigint(20) DEFAULT NULL,
  `dob` datetime DEFAULT NULL,
  `gender` varchar(1000) DEFAULT NULL,
  `address` varchar(2000) DEFAULT NULL,
  `building` varchar(1000) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 0,
  `remark` varchar(100) DEFAULT NULL,
  `familyid` int(11) DEFAULT NULL,
  `note` varchar(1000) DEFAULT NULL,
  `listno` int(11) DEFAULT NULL,
  `rctno` varchar(500) DEFAULT NULL,
  `indexno` varchar(500) DEFAULT NULL,
  `createddate` datetime NOT NULL DEFAULT current_timestamp(),
  `createdby` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `voters`
--

INSERT INTO `voters` (`id`, `name`, `email`, `mobile1`, `mobile2`, `dob`, `gender`, `address`, `building`, `status`, `remark`, `familyid`, `note`, `listno`, `rctno`, `indexno`, `createddate`, `createdby`) VALUES
(3, 'Pareen', NULL, 917045885207, NULL, NULL, 'Male', NULL, NULL, 1, NULL, 1, NULL, NULL, NULL, NULL, '2021-02-10 18:05:31', 1),
(4, 'Shobha Chavan', '', 917045885221, NULL, NULL, 'UNKNOWN', NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2021-02-10 18:05:33', 1),
(5, 'Anil Mumbai', '', 917045885239, NULL, NULL, '', NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2021-02-10 18:05:35', 1),
(6, 'Britania Salu', '', 917045885257, NULL, NULL, '', NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2021-02-10 18:05:38', 1);

-- --------------------------------------------------------

--
-- Table structure for table `voters_family`
--

CREATE TABLE `voters_family` (
  `id` int(11) NOT NULL,
  `name` varchar(1000) DEFAULT NULL,
  `voterid` int(11) DEFAULT NULL,
  `createddate` datetime NOT NULL DEFAULT current_timestamp(),
  `createdby` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `voters_family`
--

INSERT INTO `voters_family` (`id`, `name`, `voterid`, `createddate`, `createdby`) VALUES
(1, NULL, NULL, '2021-02-10 18:05:51', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `listallocation`
--
ALTER TABLE `listallocation`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `listnos`
--
ALTER TABLE `listnos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `voters`
--
ALTER TABLE `voters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `voters_family`
--
ALTER TABLE `voters_family`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `listallocation`
--
ALTER TABLE `listallocation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `listnos`
--
ALTER TABLE `listnos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `voters`
--
ALTER TABLE `voters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `voters_family`
--
ALTER TABLE `voters_family`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
