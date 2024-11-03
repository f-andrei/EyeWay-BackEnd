CREATE SCHEMA `EyeWay` DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_general_ci;
USE `EyeWay`;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cameras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    image_data LONGTEXT,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE infractions (
    infraction_id INT AUTO_INCREMENT PRIMARY KEY,
    camera_id INT NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    infraction_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_bytes LONGBLOB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id)
);

CREATE TABLE InfractionsStats (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    camera_id INT NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    infraction_type VARCHAR(50) NOT NULL,
    count INT NOT NULL,
    period VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id)
);

CREATE TABLE line_pairs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    camera_id INT NOT NULL,
    crossing_start_x INT NOT NULL,
    crossing_start_y INT NOT NULL,
    crossing_end_x INT NOT NULL,
    crossing_end_y INT NOT NULL,
    direction_start_x INT NOT NULL,
    direction_start_y INT NOT NULL,
    direction_end_x INT NOT NULL,
    direction_end_y INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
);

CREATE TABLE rois (
    id INT PRIMARY KEY AUTO_INCREMENT,
    camera_id INT NOT NULL,
    coordinates JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
);

CREATE TABLE objects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    camera_id INT NOT NULL,
    class_label VARCHAR(50) NOT NULL,
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id)
);

ALTER TABLE cameras
ADD COLUMN image_width INT NOT NULL,
ADD COLUMN image_height INT NOT NULL;