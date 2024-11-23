const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');

const VALID_STATUSES = ['Pendente', 'Verificado', 'Alerta falso'];

const validateInfractionId = (req, res, next) => {
    const { id } = req.params;
    const parsedId = parseInt(id);
    
    if (isNaN(parsedId)) {
        logger.warn(`Invalid infraction ID format: ${id}`);
        return res.status(400).json({ message: 'ID da infração deve ser um número válido.' });
    }
    
    req.params.id = parsedId; 
    next();
};

router.post('/infractions', (req, res) => {
    const { camera_id, vehicle_type, infraction_type, image_base64, status = 'Pendente' } = req.body;
    const imageBuffer = Buffer.from(image_base64, 'base64');
    
    if (!VALID_STATUSES.includes(status)) {
        logger.info('Status inválido.');
        return res.status(400).json({ 
            message: `Status inválido. Use um dos seguintes: ${VALID_STATUSES.join(', ')}`
        });
    }

    const query = 'INSERT INTO infractions (camera_id, vehicle_type, infraction_type, image_bytes, status) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [camera_id, vehicle_type, infraction_type, imageBuffer, status], (err, result) => {
        if (err) {
            logger.error('Error creating infraction:', err);
            return res.status(500).json({ message: 'Erro ao criar a infração.' });            
        }
        logger.info(`Infração ${infraction_type} adicionada com sucesso!`);
        res.status(201).json({ id: result.insertId });
    });
});

router.get('/infractions', (req, res) => {
    const query = `
        SELECT i.*, c.name AS camera_name, c.location AS camera_location 
        FROM infractions i
        LEFT JOIN cameras c ON i.camera_id = c.id 
        ORDER BY i.timestamp DESC 
        LIMIT 5
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            logger.error('Error listing infractions:', err);
            return res.status(500).json({ message: 'Erro ao listar as infrações.' });
        }
        
        const infractionsWithBase64 = results.map(infraction => {
            return {
                id: infraction.infraction_id,
                camera_id: infraction.camera_id,
                vehicle_type: infraction.vehicle_type,
                infraction_type: infraction.infraction_type,
                status: infraction.status || 'Pendente',
                timestamp: infraction.timestamp,
                image_base64: Buffer.from(infraction.image_bytes).toString('base64'),
                camera_name: infraction.camera_name,
                camera_location: infraction.camera_location
            };
        });
        
        logger.info('Últimas 5 infrações listadas com sucesso!');
        res.status(200).json(infractionsWithBase64);
    });
});

router.delete('/deleteAll', async (req, res) => {
    try {
        const query = 'DELETE FROM infractions';
        db.query(query, (err, result) => {
            if (err) {
                logger.error('Error deleting all infractions:', err);
                return res.status(500).json({ message: 'Erro ao deletar as infrações.' });
            }

            logger.info(`Todas as infrações foram deletadas com sucesso. ${result.affectedRows} registros removidos.`);
            res.status(200).json({ 
                message: 'Todas as infrações foram deletadas com sucesso',
                deletedCount: result.affectedRows 
            });
        });
    } catch (error) {
        logger.error('Error in delete all route:', error);
        res.status(500).json({ message: 'Erro interno ao deletar infrações.' });
    }
});

router.get('/infractions/:id', validateInfractionId, (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT i.*, c.name AS camera_name, c.location AS camera_location 
        FROM infractions i
        LEFT JOIN cameras c ON i.camera_id = c.id 
        WHERE i.infraction_id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(`Error getting infraction ${id}:`, err);
            return res.status(500).json({ message: 'Erro ao listar a infração.' });
        }
        if (result.length === 0) {
            logger.warn(`Attempted to fetch non-existent infraction with ID ${id}`);
            return res.status(404).json({ message: 'Infração não encontrada' });
        }

        const infraction = {
            id: result[0].infraction_id,
            camera_id: result[0].camera_id,
            vehicle_type: result[0].vehicle_type,
            infraction_type: result[0].infraction_type,
            status: result[0].status || 'Pendente',
            timestamp: result[0].timestamp,
            image_base64: Buffer.from(result[0].image_bytes).toString('base64'),
            camera_name: result[0].camera_name,
            camera_location: result[0].camera_location
        };

        logger.info(`Infração ${id} listada com sucesso!`);
        res.status(200).json(infraction);
    });
});

router.put('/infractions/:id/status', validateInfractionId, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    logger.info(`Attempting to update status for infraction ${id} to ${status}`);

    if (!status) {
        logger.warn(`Status update failed: No status provided for infraction ${id}`);
        return res.status(400).json({ message: 'Status é obrigatório' });
    }

    if (!VALID_STATUSES.includes(status)) {
        logger.warn(`Status update failed: Invalid status "${status}" for infraction ${id}`);
        return res.status(400).json({ 
            message: `Status inválido. Use um dos seguintes: ${VALID_STATUSES.join(', ')}`
        });
    }

    const updateQuery = 'UPDATE infractions SET status = ? WHERE infraction_id = ?';
    db.query(updateQuery, [status, id], (err, result) => {
        if (err) {
            logger.error(`Database error updating status for infraction ${id}:`, err);
            return res.status(500).json({ message: 'Erro ao atualizar o status da infração.' });
        }

        if (result.affectedRows === 0) {
            logger.warn(`Status update failed: Infraction ${id} not found`);
            return res.status(404).json({ message: 'Infração não encontrada.' });
        }

        logger.info(`Status da infração ${id} atualizado para ${status}`);
        res.status(200).json({ 
            message: 'Status atualizado com sucesso',
            id: id,
            status: status
        });
    });
});

router.put('/infractions/:id', validateInfractionId, (req, res) => {
    const { id } = req.params;
    const { camera_id, vehicle_type, infraction_type, image_base64, status } = req.body;

    let updateFields = [];
    let queryParams = [];

    if (camera_id) {
        updateFields.push('camera_id = ?');
        queryParams.push(camera_id);
    }
    if (vehicle_type) {
        updateFields.push('vehicle_type = ?');
        queryParams.push(vehicle_type);
    }
    if (infraction_type) {
        updateFields.push('infraction_type = ?');
        queryParams.push(infraction_type);
    }
    if (image_base64) {
        updateFields.push('image_bytes = ?');
        queryParams.push(Buffer.from(image_base64, 'base64'));
    }
    if (status) {
        if (!VALID_STATUSES.includes(status)) {
            logger.warn(`Update failed: Invalid status "${status}" for infraction ${id}`);
            return res.status(400).json({ 
                message: `Status inválido. Use um dos seguintes: ${VALID_STATUSES.join(', ')}`
            });
        }
        updateFields.push('status = ?');
        queryParams.push(status);
    }

    if (updateFields.length === 0) {
        logger.warn(`Update failed: No fields provided for infraction ${id}`);
        return res.status(400).json({ message: 'Nenhum campo para atualizar fornecido.' });
    }

    queryParams.push(id);
    const query = `UPDATE infractions SET ${updateFields.join(', ')} WHERE infraction_id = ?`;
    
    db.query(query, queryParams, (err, result) => {
        if (err) {
            logger.error(`Error updating infraction ${id}:`, err);
            return res.status(500).json({ message: 'Erro ao atualizar a infração.' });
        }

        if (result.affectedRows === 0) {
            logger.warn(`Update failed: Infraction ${id} not found`);
            return res.status(404).json({ message: 'Infração não encontrada.' });
        }

        logger.info(`Infração ${id} atualizada com sucesso!`);
        res.status(200).json({ message: 'Infração atualizada com sucesso' });
    });
});

router.delete('/infractions/:id', validateInfractionId, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM infractions WHERE infraction_id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(`Error deleting infraction ${id}:`, err);
            return res.status(500).json({ message: 'Erro ao deletar a infração.' });
        }

        if (result.affectedRows === 0) {
            logger.warn(`Attempted to delete non-existent infraction with ID ${id}`);
            return res.status(404).json({ message: 'Infração não encontrada.' });
        }

        logger.info(`Infração ${id} deletada com sucesso!`);
        res.status(200).json({ message: 'Infração deletada com sucesso' });
    });
});

module.exports = router;