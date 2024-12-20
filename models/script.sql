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
    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
);

ALTER TABLE cameras
ADD COLUMN image_width INT NOT NULL,
ADD COLUMN image_height INT NOT NULL;


ALTER TABLE objects 
DROP FOREIGN KEY objects_ibfk_1;

ALTER TABLE objects
ADD CONSTRAINT objects_ibfk_1 
FOREIGN KEY (camera_id) 
REFERENCES cameras(id) 
ON DELETE CASCADE;


-- Add name field to line_pairs table
ALTER TABLE line_pairs
ADD COLUMN name VARCHAR(100) NOT NULL AFTER type;

-- Add name and type fields to rois table
ALTER TABLE rois
ADD COLUMN name VARCHAR(100) NOT NULL AFTER camera_id,
ADD COLUMN type ENUM('Presença', 'Cruzamento') NOT NULL AFTER name;

SET FOREIGN_KEY_CHECKS=0;

-- Modify the status column with new ENUM values
ALTER TABLE infractions 
    MODIFY COLUMN status ENUM('Pendente', 'Verificado', 'Alerta falso') 
    NOT NULL DEFAULT 'Pendente';

-- Update any existing values if needed
UPDATE infractions SET status = 'Pendente' WHERE status = 'pending' OR status = 'PENDENTE';
UPDATE infractions SET status = 'Verificado' WHERE status = 'confirmed' OR status = 'VERIFICADO';
UPDATE infractions SET status = 'Alerta falso' WHERE status = 'rejected' OR status = 'ALERTA_FALSO';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE manual_infractions (
    id_manual INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    user VARCHAR(50) NOT NULL,
    adress VARCHAR(255) NOT NULL,
    image LONGBLOB NOT NULL,
    text VARCHAR(255),
    status ENUM('Pendente', 'Verificado', 'Alerta falso') 
    NOT NULL DEFAULT 'Pendente',
    camera_id INT NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    infraction_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);