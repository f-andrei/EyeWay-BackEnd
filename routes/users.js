const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');


router.post('/users', (req, res) => {
    const { name, email, password_hash} = req.body;

    if (!name || !email || !password_hash) {
        logger.info('Todos os campos são obrigatórios: name, email, password_hash.');
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: name, email, password_hash.' });
    }

    const query = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';

    db.query(query, [name, email, password_hash], (err, result) => {

        if (err) {

            if (err.code === 'ER_DUP_ENTRY') {
                logger.info('Usuário com e-mail já cadastrado.');
                return res.status(400).json({ message: 'Usuário com este e-mail já cadastrado.' });
            }

            logger.error(err);
            return res.status(500).json({ message: 'Erro ao criar o usuário.' });
        }
        
        logger.info("Usuário " + name + " criado com sucesso!");
        res.status(201).json({ user_id: result.insertId });
    });
});


router.get('/users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {

        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }

        logger.info('Usuários listados com sucesso!');
        res.status(200).json(results);
    });
});


router.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM users WHERE user_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }
        if (result.length === 0) return res.status(404).json({ message: 'User not found' });

        logger.info("Usuário " + id + " listado com sucesso!");
        res.status(200).json(result[0]);
    });
});


router.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password_hash } = req.body;

    if (!name || !email || !password_hash) {
        logger.info('Todos os campos são obrigatórios: name, email, password_hash.');
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: name, email, password_hash.' });
    }
    
    const query = 'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE user_id = ?';

    db.query(query, [name, email, password_hash, id], (err, result) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ message: 'Erro ao atualizar o usuário.' });
        }
        logger.info("Usuário " + id + " atualizado com sucesso!");
        res.status(200).json({ message: 'User updated' });
    });
});


router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE user_id = ?';
    db.query(query, [id], (err, result) => {
        
        if (err) {
            logger.error(err);
            return res.status(500).json(err);
        }

        logger.info("Usuário " + id + " deletado com sucesso!");
        res.status(200).json({ message: 'User deleted' });
    });
});


module.exports = router;