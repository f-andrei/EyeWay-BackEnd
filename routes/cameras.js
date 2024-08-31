const express = require('express');
const router = express.Router();


router.post('/cameras', (req, res) => {
    const { location, ip_address, status } = req.body;
    const query = 'INSERT INTO cameras (location, ip_address, status) VALUES (?, ?, ?)';
    db.query(query, [location, ip_address, status], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ camera_id: result.insertId });
    });
});

router.get('/cameras', (req, res) => {
    const query = 'SELECT * FROM cameras';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(results);
    });
});

router.get('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM cameras WHERE camera_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: 'Camera not found' });
        res.status(200).json(result[0]);
    });
});

router.put('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const { location, ip_address, status } = req.body;
    const query = 'UPDATE cameras SET location = ?, ip_address = ?, status = ? WHERE camera_id = ?';
    db.query(query, [location, ip_address, status, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: 'Camera updated' });
    });
});

router.delete('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM cameras WHERE camera_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: 'Camera deleted' });
    });
});


module.exports = router;