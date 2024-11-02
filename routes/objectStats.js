// routes/objectStats.js
const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');

router.get('/object-stats/summary', (req, res) => {
    const queries = {
        totalObjects: `
            SELECT COUNT(*) as total 
            FROM objects
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `,
        dailyAverage: `
            SELECT ROUND(AVG(daily_count), 0) as average
            FROM (
                SELECT DATE(timestamp) as date, COUNT(*) as daily_count
                FROM objects
                WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(timestamp)
            ) as daily_stats
        `,
        mostCommonObject: `
            SELECT class_label, COUNT(*) as count
            FROM objects
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY class_label
            ORDER BY COUNT(*) DESC
            LIMIT 1
        `,
        activeLocations: `
            SELECT COUNT(DISTINCT c.location) as count
            FROM cameras c
            JOIN objects o ON c.id = o.camera_id
            WHERE o.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
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
                    totalObjects: results.totalObjects?.total || 0,
                    dailyAverage: results.dailyAverage?.average || 0,
                    mostCommonObject: results.mostCommonObject?.class_label || 'N/A',
                    activeLocations: results.activeLocations?.count || 0
                });
            }
        });
    });
});

router.get('/object-stats/hourly', (req, res) => {
    const query = `
        SELECT 
            c.location,
            HOUR(o.timestamp) as hour,
            o.class_label,
            COUNT(*) as count
        FROM cameras c
        JOIN objects o ON c.id = o.camera_id
        WHERE o.timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY c.location, HOUR(o.timestamp), o.class_label
        ORDER BY c.location, hour, o.class_label
    `;

    db.query(query, (err, rows) => {
        if (err) {
            logger.error('Error fetching hourly object statistics:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const locations = [...new Set(rows.map(row => row.location))];
        const result = {};

        locations.forEach(location => {
            result[location] = Array(24).fill(0);
            rows
                .filter(row => row.location === location)
                .forEach(row => {
                    result[location][row.hour] = (result[location][row.hour] || 0) + row.count;
                });
        });

        res.json(result);
    });
});

router.get('/object-stats/types-by-location', (req, res) => {
    const query = `
        SELECT 
            c.location,
            o.class_label,
            COUNT(*) as count
        FROM cameras c
        JOIN objects o ON c.id = o.camera_id
        WHERE o.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY c.location, o.class_label
        ORDER BY c.location, count DESC
    `;

    db.query(query, (err, rows) => {
        if (err) {
            logger.error('Error fetching object types by location:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const result = {};
        rows.forEach(row => {
            if (!result[row.location]) {
                result[row.location] = [];
            }
            result[row.location].push({
                class_label: row.class_label,
                count: row.count
            });
        });

        res.json(result);
    });
});

router.get('/object-stats/peak-hours', (req, res) => {
    const query = `
        SELECT 
            c.location,
            HOUR(o.timestamp) as hour,
            COUNT(*) as count,
            GROUP_CONCAT(DISTINCT o.class_label) as object_types
        FROM cameras c
        JOIN objects o ON c.id = o.camera_id
        WHERE o.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY c.location, HOUR(o.timestamp)
        ORDER BY count DESC
        LIMIT 10
    `;

    db.query(query, (err, rows) => {
        if (err) {
            logger.error('Error fetching peak detection hours:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

router.get('/object-stats/trends', (req, res) => {
    const query = `
        SELECT 
            DATE(o.timestamp) as date,
            c.location,
            COUNT(*) as total_count,
            GROUP_CONCAT(DISTINCT o.class_label) as object_types
        FROM cameras c
        JOIN objects o ON c.id = o.camera_id
        WHERE o.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(o.timestamp), c.location
        ORDER BY date DESC, total_count DESC
    `;

    db.query(query, (err, rows) => {
        if (err) {
            logger.error('Error fetching object detection trends:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

module.exports = router;