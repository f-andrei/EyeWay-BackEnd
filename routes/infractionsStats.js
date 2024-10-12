const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');


router.post('/infractions-stats', (req, res) => {
    const { camera_id, infraction_type, vehicle_type,  count, period } = req.body;

    if (!camera_id || !infraction_type || !vehicle_type || !count || !period) {
        logger.info('Todos os campos são obrigatórios: camera_id, infraction_type, vehicle_type,  count, period.');
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: camera_id, infraction_type, vehicle_type, count, period..' });
    }

    const query = 'INSERT INTO InfractionsStats (camera_id, infraction_type, vehicle_type, count, period) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [camera_id, infraction_type, vehicle_type, count, period], (err, result) => {

        if (err) {
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                logger.info('Não existe camera_id cadastrado.');
                return res.status(400).json({ message: 'Não existe camera_id cadastrado.' });
            }
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao criar o Infractions Stats.' });
        }
        logger.info("Infractions Stats criada com sucesso!");
        res.status(201).json({ stat_id: result.insertId });
    });
});


router.get('/infractions-stats', (req, res) => {
    const query = 'SELECT * FROM InfractionsStats';
    db.query(query, (err, results) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        res.status(200).json(results);
        console.log("Estatísticas de infrações listadas com sucesso!");
    });
});


router.get('/infractions-stats/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM InfractionsStats WHERE stat_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        if (result.length === 0) return res.status(404).json({ message: 'Stat not found' });
        res.status(200).json(result[0]);
        console.log("Estatística de infração " + id + " listada com sucesso!");
    });
});


router.put('/infractions-stats/:id', (req, res) => {
    const { id } = req.params;
    const { camera_id, infraction_type, vehicle_type, count, period } = req.body;

    if (!camera_id || !infraction_type || !vehicle_type || !count || !period) {
        logger.info('Todos os campos são obrigatórios: camera_id, infraction_type, vehicle_type,  count, period.');
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: camera_id, infraction_type, vehicle_type, count, period..' });
    }

    const query = 'UPDATE InfractionsStats SET camera_id = ?, infraction_type = ?, vehicle_type = ?, count = ?, period = ? WHERE stat_id = ?';

    db.query(query, [camera_id, infraction_type, vehicle_type, count, period, id], (err, result) => {
        if (err) {
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                logger.info('Não existe camera_id cadastrado.');
                return res.status(400).json({ message: 'Não existe camera_id cadastrado.' });
            }
            logger.error(err);
            return res.status(500).json(err);
        }
        logger.info("Estatística de infração " + id + " atualizada com sucesso!");
        res.status(200).json({ message: 'Stat updated' });
    });
});


router.delete('/infractions-stats/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM InfractionsStats WHERE stat_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        logger.info("Estatística de infração " + id + " deletada com sucesso!");
        res.status(200).json({ message: 'Stat deleted' });
    });
});


   

module.exports = router;