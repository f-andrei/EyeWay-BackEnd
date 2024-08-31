const express = require('express');
const router = express.Router();


router.post('/infractions-stats', (req, res) => {
    const { camera_id, infraction_type, count, period } = req.body;
    const query = 'INSERT INTO InfractionsStats (camera_id, infraction_type, count, period) VALUES (?, ?, ?, ?)';
    db.query(query, [camera_id, infraction_type, count, period], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ stat_id: result.insertId });
    });
});


router.get('/infractions-stats', (req, res) => {
    const query = 'SELECT * FROM InfractionsStats';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(results);
    });
});


router.get('/infractions-stats/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM InfractionsStats WHERE stat_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: 'Stat not found' });
        res.status(200).json(result[0]);
    });
});


router.put('/infractions-stats/:id', (req, res) => {
    const { id } = req.params;
    const { camera_id, infraction_type, count, period } = req.body;
    const query = 'UPDATE InfractionsStats SET camera_id = ?, infraction_type = ?, count = ?, period = ? WHERE stat_id = ?';
    db.query(query, [camera_id, infraction_type, count, period, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: 'Stat updated' });
    });
});


router.delete('/infractions-stats/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM InfractionsStats WHERE stat_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: 'Stat deleted' });
    });
});


   

module.exports = router;