const express = require('express');
const app = express();


const userRoutes = require('./routes/users');
const cameraRoutes = require('./routes/cameras');
const infractionRoutes = require('./routes/infractions');
const infractionsStatsRoutes = require('./routes/infractionsStats');

app.use(express.json({limit: '50mb'}));
app.use('/', userRoutes);
app.use('/', cameraRoutes);
app.use('/', infractionRoutes);
app.use('/', infractionsStatsRoutes);


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
