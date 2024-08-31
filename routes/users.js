const express = require('express');
const router = express.Router();


router.post('/users', (req, res) => {
    const { name, email, password_hash} = req.body;
    const query = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';
    db.query(query, [name, email, password_hash], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ user_id: result.insertId });
    });
});


router.get('/users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(results);
    });
});


router.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM users WHERE user_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(result[0]);
    });
});


router.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password_hash } = req.body;
    const query = 'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE user_id = ?';
    db.query(query, [name, email, password_hash, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: 'User updated' });
    });
});


router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE user_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: 'User deleted' });
    });
});


module.exports = router;