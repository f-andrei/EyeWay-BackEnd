const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');

router.post('/objects', (req, res) => {
    const { objects } = req.body;
    
    if (!objects || !Array.isArray(objects)) {
        logger.error('Invalid request: objects array is required');
        return res.status(400).json({ message: 'Invalid request: objects array is required' });
    }

    const query = 'INSERT INTO objects (camera_id, class_label, timestamp) VALUES ?';
    const values = objects.map(obj => [
        obj.camera_id,
        obj.class_label, 
        new Date(obj.timestamp)
    ]);

    db.query(query, [values], (err, result) => {
        if (err) {
            logger.error('Error inserting object counts:', err);
            return res.status(500).json({ message: 'Error storing object counts' });
        }
        
        logger.info(`Successfully stored ${objects.length} object counts`);
        res.status(200).json({ 
            message: 'Objects stored successfully',
            count: result.affectedRows
        });
    });
});

router.get('/objects', (req, res) => {
    const { camera_id, class_label, start_date, end_date } = req.query;
    
    let query = 'SELECT * FROM objects WHERE 1=1';
    const params = [];

    if (camera_id) {
        query += ' AND camera_id = ?';
        params.push(camera_id);
    }
    if (class_label) {
        query += ' AND class_label = ?';
        params.push(class_label);
    }
    if (start_date) {
        query += ' AND timestamp >= ?';
        params.push(new Date(start_date));
    }
    if (end_date) {
        query += ' AND timestamp <= ?';
        params.push(new Date(end_date));
    }

    query += ' ORDER BY timestamp DESC LIMIT 1000';

    db.query(query, params, (err, results) => {
        if (err) {
            logger.error('Error retrieving object counts:', err);
            return res.status(500).json({ message: 'Error retrieving object counts' });
        }

        logger.info(`Retrieved ${results.length} object counts`);
        res.status(200).json(results);
    });
});

module.exports = router;