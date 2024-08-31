const express = require('express');
const router = express.Router();


router.post('/infractions', (req, res) => {
    const { camera_id, infraction_type, timestamp, image_base64, location } = req.body;
    const query = 'INSERT INTO infractions (camera_id, infraction_type, timestamp, image_base64, location) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [camera_id, infraction_type, timestamp, image_base64, location], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ infraction_id: result.insertId });
    });
});

router.get('/infractions', (req, res) => {
    const query = 'SELECT * FROM infractions';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(results);
    });
});

router.get('/infractions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM infractions WHERE infraction_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: 'Infraction not found' });
        res.status(200).json(result[0]);
    });
});

router.put('/infractions/:id', (req, res) => {
    const { id } = req.params;
    const { camera_id, infraction_type, timestamp, image_base64, location } = req.body;
    const query = 'UPDATE infractions SET camera_id = ?, infraction_type = ?, timestamp = ?, image_base64 = ?, location = ? WHERE infraction_id = ?';
    db.query(query, [camera_id, infraction_type, timestamp, image_base64, location, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: 'Infraction updated' });
    });
});


router.delete('/infractions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM infractions WHERE infraction_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: 'Infraction deleted' });
    });
});


module.exports = router;