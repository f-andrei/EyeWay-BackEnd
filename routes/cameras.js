const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');

router.post('/cameras', (req, res) => {
    const { 
        name, 
        location, 
        address, 
        type,
        imageSize,
        imageData,      
        linePairs,      
        rois           
    } = req.body;

    if (!name || !location || !address || !type || !imageSize || !imageData) {
        logger.info('Todos os campos são obrigatórios: name, location, address, type, imageSize, imageData');
        return res.status(400).json({ 
            message: 'Todos os campos são obrigatórios: name, location, address, type, imageSize, imageData' 
        });
    }

    const validTypes = ['youtube_video', 'youtube_stream', 'ip_camera'];
    if (!validTypes.includes(type)) {
        logger.info('type inválido. Deve ser: youtube_video, youtube_stream ou ip_camera');
        return res.status(400).json({ 
            message: 'type inválido. Deve ser: youtube_video, youtube_stream ou ip_camera'
        });
    }

    if (!imageData.match(/^data:image\/(jpeg|png|gif);base64,/)) {
        logger.info('Formato de imagem inválido. Deve ser base64 com cabeçalho data:image');
        return res.status(400).json({ 
            message: 'Formato de imagem inválido. Deve ser base64 com cabeçalho data:image' 
        });
    }

    db.beginTransaction(err => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao iniciar transação.' });
        }

        const cameraQuery = 'INSERT INTO cameras (name, location, address, type, image_data, image_width, image_height) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(cameraQuery, [
            name, 
            location, 
            address, 
            type,
            imageData,
            imageSize.width, 
            imageSize.height
        ], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    logger.error(err);
                    res.status(500).json({ message: 'Erro ao cadastrar a câmera.' });
                });
            }

            const cameraId = result.insertId;

            const linePromises = [];
            if (linePairs && linePairs.length > 0) {
                const linePairQuery = 'INSERT INTO line_pairs (camera_id, crossing_start_x, crossing_start_y, crossing_end_x, crossing_end_y, direction_start_x, direction_start_y, direction_end_x, direction_end_y) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                
                linePairs.forEach(pair => {
                    linePromises.push(new Promise((resolve, reject) => {
                        db.query(linePairQuery, [
                            cameraId,
                            pair.crossing[0].x,
                            pair.crossing[0].y,
                            pair.crossing[1].x,
                            pair.crossing[1].y,
                            pair.direction[0].x,
                            pair.direction[0].y,
                            pair.direction[1].x,
                            pair.direction[1].y
                        ], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }));
                });
            }

            const roiPromises = [];
            if (rois && rois.length > 0) {
                const roiQuery = 'INSERT INTO rois (camera_id, coordinates) VALUES (?, ?)';
                
                rois.forEach(roi => {
                    roiPromises.push(new Promise((resolve, reject) => {
                        const coordinatesJson = JSON.stringify(roi);
                        db.query(roiQuery, [cameraId, coordinatesJson], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }));
                });
            }

            Promise.all([...linePromises, ...roiPromises])
                .then(() => {
                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => {
                                logger.error(err);
                                res.status(500).json({ message: 'Erro ao salvar configurações.' });
                            });
                        }
                        logger.info("Câmera " + name + " cadastrada com sucesso!");
                        res.status(201).json({ 
                            id: cameraId,
                            message: 'Câmera cadastrada com sucesso'
                        });
                    });
                })
                .catch(err => {
                    db.rollback(() => {
                        logger.error(err);
                        res.status(500).json({ message: 'Erro ao salvar configurações.' });
                    });
                });
        });
    });
});

router.get('/cameras', (req, res) => {
    const query = 'SELECT id, name, location, address, type, image_data, image_width, image_height FROM cameras';
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
    
    const cameraQuery = 'SELECT * FROM cameras WHERE name = ?';
    db.query(cameraQuery, [id], (err, cameraResult) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({message: 'Erro ao buscar a câmera.'});
        }
        if (cameraResult.length === 0) {
            return res.status(404).json({ message: 'Câmera não encontrada' });
        }

        const camera = cameraResult[0];
        const cameraId = camera.id;

        const linePairQuery = 'SELECT * FROM line_pairs WHERE camera_id = ?';
        db.query(linePairQuery, [cameraId], (err, lineResult) => {
            if (err) {
                logger.error(err);
                return res.status(500).json({message: 'Erro ao buscar as linhas.'});
            }

            const linePairs = lineResult.map(line => ({
                crossing: [
                    { x: line.crossing_start_x, y: line.crossing_start_y },
                    { x: line.crossing_end_x, y: line.crossing_end_y }
                ],
                direction: [
                    { x: line.direction_start_x, y: line.direction_start_y },
                    { x: line.direction_end_x, y: line.direction_end_y }
                ]
            }));

            const roiQuery = 'SELECT coordinates FROM rois WHERE camera_id = ?';
            db.query(roiQuery, [cameraId], (err, roiResult) => {
                if (err) {
                    logger.error(err);
                    return res.status(500).json({message: 'Erro ao buscar as ROIs.'});
                }

                const rois = roiResult.map(roi => JSON.parse(roi.coordinates));

                const response = {
                    ...camera,
                    imageSize: {
                        width: camera.image_width,
                        height: camera.image_height
                    },
                    imageData: camera.image_data,
                    linePairs,
                    rois
                };

                delete response.image_width;
                delete response.image_height;
                delete response.image_data;

                logger.info('Câmera encontrada com sucesso!');
                res.status(200).json(response);
            });
        });
    });
});


router.get('/cameras-line-pairs/:id', (req, res) => {
    const { id } = req.params;
    
    const cameraQuery = 'SELECT id, image_width, image_height FROM cameras WHERE name = ?';
    db.query(cameraQuery, [id], (err, cameraResult) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({message: 'Erro ao buscar a câmera.'});
        }
        if (cameraResult.length === 0) {
            return res.status(404).json({ message: 'Câmera não encontrada' });
        }

        const camera = cameraResult[0];
        const cameraId = camera.id;

        const linePairQuery = 'SELECT crossing_start_x, crossing_start_y, crossing_end_x, crossing_end_y, direction_start_x, direction_start_y, direction_end_x, direction_end_y FROM line_pairs WHERE camera_id = ?';
        db.query(linePairQuery, [cameraId], (err, lineResult) => {
            if (err) {
                logger.error(err);
                return res.status(500).json({message: 'Erro ao buscar as linhas.'});
            }

            const linePairs = lineResult.map(line => ({
                crossing: [
                    { x: line.crossing_start_x, y: line.crossing_start_y },
                    { x: line.crossing_end_x, y: line.crossing_end_y }
                ],
                direction: [
                    { x: line.direction_start_x, y: line.direction_start_y },
                    { x: line.direction_end_x, y: line.direction_end_y }
                ]
            }));

            const response = {
                imageSize: {
                    width: camera.image_width,
                    height: camera.image_height
                },
                linePairs
            };

            logger.info('Dados de linha da câmera encontrados com sucesso!');
            res.status(200).json(response);
        });
    });
});

router.put('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const { name, location, address, type } = req.body;

    if (!name || !location || !address || !type) {
        logger.info('Todos os campos são obrigatórios: name (nome), location (local), address (url), type.');
        return res.status(400).json({ 
            message: 'Todos os campos são obrigatórios: nome, local, url e type.' 
        });
    }

    const validTypes = ['youtube_video', 'youtube_stream', 'ip_camera'];
    if (!validTypes.includes(type)) {
        logger.info('type inválido. Deve ser: youtube_video, youtube_stream ou ip_camera');
        return res.status(400).json({ 
            message: 'type inválido. Deve ser: youtube_video, youtube_stream ou ip_camera'
        });
    }

    const query = 'UPDATE cameras SET name = ?, location = ?, address = ?, type = ? WHERE name = ?';
    db.query(query, [name, location, address, type, id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao atualizar a câmera.' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Câmera não encontrada' });
        }

        logger.info("Câmera " + id + " atualizada com sucesso!");
        res.status(200).json({ message: 'Câmera atualizada com sucesso' });
    });
});

router.delete('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM cameras WHERE name = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao deletar a câmera.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Câmera não encontrada' });
        }

        logger.info("Câmera " + id + " deletada com sucesso!");
        res.status(200).json({ message: 'Câmera deletada com sucesso' });
    });
});

module.exports = router;