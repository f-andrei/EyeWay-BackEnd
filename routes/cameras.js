const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');


router.post('/cameras', (req, res) => {
    const { camera_id, location, ip_address, status } = req.body;
    const query = 'INSERT INTO cameras (camera_id, location, ip_address, status) VALUES (?, ?, ?, ?)';
    db.query(query, [camera_id, location, ip_address, status], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        res.status(201).json({ camera_id: result.insertId });
        console.log("Câmera " + ip_address + " adicionada com sucesso!");
    });
});

router.get('/cameras', (req, res) => {
    const query = 'SELECT * FROM cameras';
    db.query(query, (err, results) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        res.status(200).json(results);
        console.log("Câmeras listadas com sucesso!");
    });
});

router.get('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM cameras WHERE camera_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        if (result.length === 0) return res.status(404).json({ message: 'Camera not found' });
        res.status(200).json(result[0]);
        console.log("Câmera " + id + " listada com sucesso!");
    });
});

router.put('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const { camera_id, location, ip_address, status } = req.body;
    const query = 'UPDATE cameras SET camera_id, location = ?, ip_address = ?, status = ? WHERE camera_id = ?';
    db.query(query, [camera_id, location, ip_address, status, id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        res.status(200).json({ message: 'Camera updated' });
        console.log("Câmera " + id + " atualizada com sucesso!");
    });
});

router.delete('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM cameras WHERE camera_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        res.status(200).json({ message: 'Camera deleted' });
        console.log("Câmera " + id + " deletada com sucesso!");
    });
});


module.exports = router;