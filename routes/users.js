const express = require('express');
const router = express.Router();
const db = require('../config/connectDataBase');
const logger = require('../logger');
const jose = require('jose');
const crypto = require('node:crypto');
const secret = crypto.createSecretKey("senha","utf-8"); 
router.post('/users', (req, res) => {
    const { nome, email, senha} = req.body;

    if (!nome || !email || !senha) {
        logger.info('Todos os campos são obrigatórios: nome, email, senha.');
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: nome, email, senha.' });
    }
    
    if(senha.length < 4 && !(/\d/.test(senha))){
        return res.status(400).json({ message: 'Senha muito fraca. Necessario ser maior que 4 caracteres com numeros e letras' });
    }

    const hash = crypto.createHash("sha256")
    const password_hash = hash.update(senha).digest("hex");

    const query = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';

    db.query(query, [nome, email, password_hash], (err, result) => {

        if (err) {
            console.log(err)
            if (err.code === 'ER_DUP_ENTRY') {
                logger.info('Usuário com e-mail já cadastrado.');
                return res.status(400).json({ message: 'Usuário com este e-mail já cadastrado.' });
            }

            logger.error(err);
            return res.status(500).json({ message: 'Erro ao criar o usuário.' });
        }
        
        logger.info("Usuário " + nome + " criado com sucesso!");
        res.status(201).json({ user_id: result.insertId });
    });
});

router.post('/login', (req, res) => {
    const { email, senha} = req.body;

    if (!email || !senha) {
        logger.info('Todos os campos são obrigatórios: email e password_hash.');
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: email, password_hash.' });
    }

    const hash = crypto.createHash("sha256")
    const password_hash = hash.update(senha).digest("hex");

    const query = 'SELECT * FROM users WHERE email =  ? AND password_hash = ?';

    db.query(query, [ email, password_hash], async (err, result) => {
        console.log(email,password_hash,err);
        if (err || !result.length)  {
            logger.error(err);
            return res.status(500).json({ message: 'Email ou senha está incorreto.' });
        }
        
        const jwt = await new jose.SignJWT({email}).setExpirationTime("1d").setProtectedHeader({alg:"HS256"}).sign(secret);
        logger.info("Usuário " + " Logado com sucesso!");
        res.status(201).json({ token:jwt, user_id:result[0].user_id });
        console.log(result)
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