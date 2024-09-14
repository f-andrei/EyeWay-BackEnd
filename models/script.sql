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
    camera_id INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    ip_address VARCHAR(255) NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE infractions (
    infraction_id INT AUTO_INCREMENT PRIMARY KEY,
    camera_id INT NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    infraction_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_bytes LONGBLOB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE InfractionsStats (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    camera_id INT NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    infraction_type VARCHAR(50) NOT NULL,
    count INT DEFAULT 0,
    period VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES Cameras(camera_id)
);
CREATE TABLE video(
    video_id INT AUTO_INCREMENT PRIMARY KEY,
    video_url VARCHAR(200) NOT NULL
)
