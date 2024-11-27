const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');

router.post('/manualInfractions', (req, res) => {
    const { date, user, image, text } = req.body;

    // Validação simples para evitar erros de desestruturação
    if (!date || !user || !image || !text) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const imageBuffer = Buffer.from(image, 'base64');

    const query = 'INSERT INTO manual_Infractions (date, user, image, text) VALUES (?, ?, ?, ?)';
    db.query(query, [date, user, imageBuffer, text], (err, result) => {
        if (err) {
            logger.error('Erro ao criar a infração:', err);
            return res.status(500).json({ message: 'Erro ao criar a infração.' });
        }
        logger.info(`Infração adicionada com sucesso!`);
        res.status(201).json({ id: result.insertId });
    });
});


router.get('/manualInfractions', (req, res) => {
    const query = `
        SELECT * FROM manual_Infractions
    `;
    
    db.query(query, (err, results) => { 
        if (err) {
            logger.error('Error listing infractions:', err);
            return res.status(500).json({ message: 'Erro ao listar as infrações.' });
        }
        if (results.length === 0){
            return res.status(404).json({ message: 'Infractions not found' });
        }
        
        res.status(200).json({ message: 'Infrações listadas com sucesso!', results });
    });
});

router.get('/manualInfractions/:id', (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT * FROM manual_Infractions WHERE id = ?
    `;
    db.query(query, [id], (err, results) => {
        if (err) {
            logger.error(`Error listing infraction: ${id}`, err);
            return res.status(500).json({ message: 'Erro ao listar a infração.' });
        }
        if (results.length === 0){
            return res.status(404).json({ message: 'Infraction not found' });
        }
        res.status(200).json({ message: 'Infração listada com sucesso!', results });
    });

});

router.put('/manualInfractions/:id', (req, res) => {
    const { id } = req.params;
    const { date, user, image, text } = req.body;

    const query = 'UPDATE manual_Infractions SET date = ?, user = ?, image = ?, text = ? WHERE id = ?';

    db.query(query, [date, user, image, text, id], (err) => {
        if (err) {
            logger.error(`Error updating infraction: ${id}`, err);
            return res.status(500).json({ message: 'Erro ao atualizar a infração.' });
        }
        logger.info(`Infração ${id} atualizada com sucesso!`);
        res.status(200).json({ message: 'Infraction updated' });
    });
});

router.delete('/manualInfractions', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM manual_Infractions';
    db.query(query, [id], (err, results) => {
        if (err) {
            logger.error(`Error deleting infractions`, err);
            return res.status(500).json({ message: 'Erro ao deletar a infrações.' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Infractions not found' });
        }
        logger.info(`Infrações deletadas com sucesso!`);
        res.status(200).json({ message: 'Infractions deleted' });
    });
});

router.delete('/manualInfractions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM manual_Infractions WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            logger.error(`Error deleting infraction: ${id}`, err);
            return res.status(500).json({ message: 'Erro ao deletar a infração.' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Infraction not found' });
        }
        logger.info(`Infração ${id} deletada com sucesso!`);
        res.status(200).json({ message: 'Infraction deleted' });
    });
});


module.exports = router;