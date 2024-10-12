const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');
const { camera_id } = require('../sampleBase64');


router.post('/cameras', (req, res) => {
    const { camera_id, location, ip_address, status } = req.body;

    if (!camera_id || !location || !ip_address || !status) {
        logger.info('Todos os campos são obrigatórios: camera_id, location, ip_address,  status.');
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: camera_id, location, ip_address, status.' });
    }

    const query = 'INSERT INTO cameras (camera_id, location, ip_address, status) VALUES (?, ?, ?, ?)';

    db.query(query, [camera_id, location, ip_address, status], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao criar a câmera.' });
        }
        logger.info("Câmera " + id + " criada com sucesso!");
        res.status(201).json({ id: result.insertId });
    });
});

router.get('/cameras', (req, res) => {
    const query = 'SELECT * FROM cameras';
    db.query(query, (err, results) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao listar as câmeras.' });
        }
        logger.info('Câmeras listadas com sucesso!');
        res.status(200).json(results);
    });
});

router.get('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM cameras WHERE camera_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({message: 'Erro ao listar a câmera' + camera_id + '.'});
        }
        if (result.length === 0) return res.status(404).json({ message: 'Camera not found' });

        logger.info('Câmera listada com sucesso!');
        res.status(200).json(result[0]);
    });
});

router.put('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const { camera_id, location, ip_address, status } = req.body;

    if (!camera_id || !location || !ip_address || !status) {
        logger.info('Todos os campos são obrigatórios: camera_id, location, ip_address,  status.');
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: camera_id, location, ip_address,  status.' });
    }
    const query = 'UPDATE cameras SET camera_id = ?, location = ?, ip_address = ?, status = ? WHERE camera_id = ?';
    db.query(query, [camera_id, location, ip_address, status, id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao atualizar a câmera.' });
        }
        logger.info("Câmera " + id + " atualizada com sucesso!");
        res.status(200).json({ message: 'Camera ' + id + ' updated' });    });
});

router.delete('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM cameras WHERE camera_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao deletar a câmera.' });
        }
        logger.info("Câmera " + id + " deletada com sucesso!");
        res.status(200).json({ message: 'Camera '+ id + ' deleted' });
    });
});


module.exports = router;