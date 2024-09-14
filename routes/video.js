const express = require('express');
const router = express.Router();
const db = require('../config/ConnectDatabase');

router.post('/video', (req, res) => {
    const { url } = req.body;
    const query = 'INSERT INTO video (video_url) VALUES (?)';
    db.query(query, [url], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ url });
        console.log("Usuário " +  + " enviado com sucesso!");
    });
});

router.get('/video', (req,res)  => {
    const query = 'SELECT * FROM video';
    db.query(query, [], (err,result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json( result[result.length -1] );
    });
});

module.exports = router;
