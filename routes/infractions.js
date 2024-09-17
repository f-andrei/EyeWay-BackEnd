const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');


router.post('/infractions', (req, res) => {
    const { camera_id, vehicle_type, infraction_type, timestamp, image_base64 } = req.body;
    const imageBuffer = Buffer.from(image_base64, 'base64');
    const query = 'INSERT INTO infractions (camera_id, vehicle_type, infraction_type, timestamp, image_bytes) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [camera_id, vehicle_type, infraction_type, timestamp, imageBuffer], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);            
        }
        res.status(201).json({ infraction_id: result.insertId });
        console.log("Infração " + infraction_type + " adicionada com sucesso!");
    });
});

router.get('/infractions', (req, res) => {
    const query = 'SELECT * FROM infractions';
    db.query(query, (err, results) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        
        const infractionsWithBase64 = results.map(infraction => {
            return {
                camera_id: infraction.camera_id,
                vehicle_type: infraction.vehicle_type,
                infraction_type: infraction.infraction_type,
                timestamp: infraction.timestamp,
                image_base64: Buffer.from(infraction.image_bytes).toString('base64') 
            };
        });
        
        res.status(200).json(infractionsWithBase64);
        console.log("Infrações listadas com sucesso!");
    });
});

router.get('/infractions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM infractions WHERE infraction_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        if (result.length === 0) return res.status(404).json({ message: 'Infraction not found' });

        const infraction = {
            camera_id: result[0].camera_id,
            vehicle_type: result[0].vehicle_type,
            infraction_type: result[0].infraction_type,
            timestamp: result[0].timestamp,
            image_base64: Buffer.from(result[0].image_bytes).toString('base64')
        };

        res.status(200).json(infraction);
        console.log("Infração " + id + " listada com sucesso!");
    });
});

router.put('/infractions/:id', (req, res) => {
    const { id } = req.params;
    const { camera_id, vehicle_type, infraction_type, timestamp, image_bytes } = req.body;
    const query = 'UPDATE infractions SET camera_id = ?, vehicle_type = ?, infraction_type = ?, timestamp = ?, image_bytes = ? WHERE infraction_id = ?';
    db.query(query, [camera_id, vehicle_type, infraction_type, timestamp, image_bytes, id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        res.status(200).json({ message: 'Infraction updated' });
        console.log("Infração " + id + " atualizada com sucesso!");
    });
});


router.delete('/infractions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM infractions WHERE infraction_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        res.status(200).json({ message: 'Infraction deleted' });
        console.log("Infração " + id + " deletada com sucesso!");
    });
});


module.exports = router;