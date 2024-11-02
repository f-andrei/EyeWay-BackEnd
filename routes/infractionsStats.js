const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');

router.get('/statistics/summary', (req, res) => {
    const queries = {
        totalInfractions: `
            SELECT COUNT(*) as total 
            FROM infractions
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `,
        dailyAverage: `
            SELECT ROUND(AVG(daily_count), 0) as average
            FROM (
                SELECT DATE(timestamp) as date, COUNT(*) as daily_count
                FROM infractions
                WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(timestamp)
            ) as daily_stats
        `,
        mostCommonType: `
            SELECT infraction_type, COUNT(*) as count
            FROM infractions
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY infraction_type
            ORDER BY COUNT(*) DESC
            LIMIT 1
        `,
        mostCommonVehicle: `
            SELECT vehicle_type, COUNT(*) as count
            FROM infractions
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY vehicle_type
            ORDER BY COUNT(*) DESC
            LIMIT 1
        `
    };

    let results = {};
    let completedQueries = 0;

    Object.entries(queries).forEach(([key, query]) => {
        db.query(query, (err, rows) => {
            if (err) {
                logger.error('Error executing query:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            results[key] = rows[0];
            completedQueries++;

            if (completedQueries === Object.keys(queries).length) {
                res.json({
                    totalInfractions: results.totalInfractions?.total || 0,
                    dailyAverage: results.dailyAverage?.average || 0,
                    mostCommonType: results.mostCommonType?.infraction_type || 'N/A',
                    mostCommonVehicle: results.mostCommonVehicle?.vehicle_type || 'N/A'
                });
            }
        });
    });
});

router.get('/statistics/weekly', (req, res) => {
    const query = `
        SELECT 
            DATE_FORMAT(date_group, '%a') as day,
            count
        FROM (
            SELECT 
                DATE(timestamp) as date_group,
                COUNT(*) as count
            FROM infractions
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(timestamp)
            ORDER BY date_group
        ) as daily_counts
    `;

    db.query(query, (err, rows) => {
        if (err) {
            logger.error('Error fetching weekly statistics:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        try {
            const dataMap = new Map();
            rows.forEach(row => {
                dataMap.set(row.day, row.count);
            });

            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const processedData = daysOfWeek.map(day => ({
                day: day,
                count: dataMap.get(day) || 0
            }));

            res.json(processedData);
        } catch (error) {
            logger.error('Error processing weekly statistics:', error);
            res.status(500).json({ error: 'Data processing error' });
        }
    });
});

router.get('/statistics/by-location', (req, res) => {
    const query = `
        SELECT 
            c.id as camera_id,
            c.name as camera_name,
            c.location,
            c.address,
            COUNT(i.infraction_id) as infraction_count,
            COUNT(DISTINCT i.vehicle_type) as unique_vehicles,
            COUNT(DISTINCT i.infraction_type) as unique_infractions,
            MAX(i.timestamp) as last_infraction
        FROM cameras c
        LEFT JOIN infractions i ON c.id = i.camera_id
        WHERE i.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY c.id, c.name, c.location, c.address
        ORDER BY infraction_count DESC
    `;

    db.query(query, (err, rows) => {
        if (err) {
            logger.error('Error fetching location statistics:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

router.get('/statistics/vehicle-types', (req, res) => {
    const query = `
        SELECT 
            vehicle_type,
            COUNT(*) as count
        FROM infractions
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY vehicle_type
        ORDER BY COUNT(*) DESC
    `;

    db.query(query, (err, rows) => {
        if (err) {
            logger.error('Error fetching vehicle type statistics:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const mainVehicleTypes = ['Carro', 'Moto', 'Caminhão', 'Ônibus'];
        const resultMap = new Map(rows.map(row => [row.vehicle_type, row.count]));
        
        const completeData = mainVehicleTypes.map(type => ({
            vehicle_type: type,
            count: resultMap.get(type) || 0
        }));

        res.json(completeData);
    });
});

router.get('/statistics/hourly-by-location', (req, res) => {
    const query = `
        SELECT 
            c.location,
            HOUR(i.timestamp) as hour,
            COUNT(*) as count
        FROM cameras c
        JOIN infractions i ON c.id = i.camera_id
        WHERE i.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY c.location, HOUR(i.timestamp)
        ORDER BY c.location, hour
    `;

    db.query(query, (err, rows) => {
        if (err) {
            logger.error('Error fetching hourly statistics by location:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const locations = [...new Set(rows.map(row => row.location))];
        const result = {};

        locations.forEach(location => {
            result[location] = Array(24).fill(0);
            rows
                .filter(row => row.location === location)
                .forEach(row => {
                    result[location][row.hour] = row.count;
                });
        });

        res.json(result);
    });
});

router.get('/statistics/vehicle-types-by-location', (req, res) => {
    const query = `
        SELECT 
            c.location,
            i.vehicle_type,
            COUNT(*) as count
        FROM cameras c
        JOIN infractions i ON c.id = i.camera_id
        WHERE i.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY c.location, i.vehicle_type
        ORDER BY c.location, count DESC
    `;

    db.query(query, (err, rows) => {
        if (err) {
            logger.error('Error fetching vehicle types by location:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const result = {};
        rows.forEach(row => {
            if (!result[row.location]) {
                result[row.location] = [];
            }
            result[row.location].push({
                vehicle_type: row.vehicle_type,
                count: row.count
            });
        });

        res.json(result);
    });
});

router.get('/statistics/camera-details/:cameraId', (req, res) => {
    const { cameraId } = req.params;
    const queries = {
        info: `
            SELECT c.*, 
                COUNT(i.infraction_id) as total_infractions,
                COUNT(DISTINCT DATE(i.timestamp)) as active_days
            FROM cameras c
            LEFT JOIN infractions i ON c.id = i.camera_id
            WHERE c.id = ?
            GROUP BY c.id
        `,
        vehicleTypes: `
            SELECT vehicle_type, COUNT(*) as count
            FROM infractions
            WHERE camera_id = ?
            GROUP BY vehicle_type
            ORDER BY count DESC
        `,
        infractionTypes: `
            SELECT infraction_type, COUNT(*) as count
            FROM infractions
            WHERE camera_id = ?
            GROUP BY infraction_type
            ORDER BY count DESC
        `,
        hourlyDistribution: `
            SELECT HOUR(timestamp) as hour, COUNT(*) as count
            FROM infractions
            WHERE camera_id = ?
            GROUP BY HOUR(timestamp)
            ORDER BY hour
        `
    };

    let results = {};
    let completedQueries = 0;

    Object.entries(queries).forEach(([key, query]) => {
        db.query(query, [cameraId], (err, rows) => {
            if (err) {
                logger.error(`Error executing ${key} query:`, err);
                return res.status(500).json({ error: 'Database error' });
            }

            results[key] = key === 'info' ? rows[0] : rows;
            completedQueries++;

            if (completedQueries === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

module.exports = router;