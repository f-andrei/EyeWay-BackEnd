const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');
const { log } = require('winston');


router.post('/infractions', (req, res) => {
    const { camera_id, vehicle_type, infraction_type, image_base64 } = req.body;
    const imageBuffer = Buffer.from(image_base64, 'base64');
    
    // if (!camera_id || !vehicle_type || !infraction_type || !image_base64) {
    //     logger.info('Todos os campos são obrigatórios: camera_id, vehicle_type, infraction_type, image_base64.');

    //     return res.status(400).json({ message: 'Todos os campos são obrigatórios: camera_id, vehicle_type, infraction_type, image_base64.' });
    // }
    const query = 'INSERT INTO infractions (camera_id, vehicle_type, infraction_type, image_bytes) VALUES (?, ?, ?, ?)';
    db.query(query, [camera_id, vehicle_type, infraction_type, imageBuffer], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao criar a infração.' });            
        }
        logger.info("Infração " + infraction_type + " adicionada com sucesso!");
        res.status(201).json({ infraction_id: result.insertId });
    });
});

router.get('/infractions', (req, res) => {
    const query = `
        SELECT i.*, c.name AS camera_name, c.location AS camera_location 
        FROM infractions i
        JOIN cameras c ON i.camera_id = c.id
        ORDER BY i.timestamp DESC 
        LIMIT 5
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            logger.error('Erro ao listar as infrações:', err);
            return res.status(500).json({ message: 'Erro ao listar as infrações.' });
        }
        
        const infractionsWithBase64 = results.map(infraction => {
            return {
                infraction_id: infraction.infraction_id,
                camera_id: infraction.camera_id,
                vehicle_type: infraction.vehicle_type,
                infraction_type: infraction.infraction_type,
                timestamp: infraction.timestamp,
                image_base64: Buffer.from(infraction.image_bytes).toString('base64'),
                created_at: infraction.created_at,
                camera_name: infraction.camera_name,
                camera_location: infraction.camera_location
            };
        });
        
        logger.info('Últimas 5 infrações listadas com sucesso!');
        res.status(200).json(infractionsWithBase64);
    });
});

router.get('/infractions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM infractions WHERE infraction_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao listar a infração.' });
        }
        if (result.length === 0) return res.status(404).json({ message: 'Infraction not found' });

        const infraction = {
            camera_id: result[0].camera_id,
            vehicle_type: result[0].vehicle_type,
            infraction_type: result[0].infraction_type,
            timestamp: result[0].timestamp,
            image_base64: Buffer.from(result[0].image_bytes).toString('base64')
        };

        logger.info("Infração " + id + " listada com sucesso!");
        res.status(200).json(infraction);
    });
});

router.put('/infractions/:id', (req, res) => {
    const { id } = req.params;
    const { camera_id, vehicle_type, infraction_type, image_bytes } = req.body;

    if (!camera_id || !vehicle_type || !infraction_type || !image_bytes) {
        logger.info('Todos os campos são obrigatórios: camera_id, vehicle_type, infraction_type, timestamp, image_base64.');
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: camera_id, vehicle_type, infraction_type, timestamp, image_base64.' });
    }

    const query = 'UPDATE infractions SET camera_id = ?, vehicle_type = ?, infraction_type = ?, image_bytes = ? WHERE infraction_id = ?';
    db.query(query, [camera_id, vehicle_type, infraction_type, image_bytes, id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao atualizar a infração.' });
        }

        logger.info("Infraction " + id + " updated!");
        res.status(200).json({ message: 'Infraction updated' });    });
});


router.delete('/infractions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM infractions WHERE infraction_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao deletar a infração.' });
        }

        logger.info("Infraction " + id + " deleted!");
        res.status(200).json({ message: 'Infraction deleted' });
    });
});


module.exports = router;