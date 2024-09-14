const express = require('express');
const cors = require("cors")
const app = express();


const userRoutes = require('./routes/users');
const cameraRoutes = require('./routes/cameras');
const infractionRoutes = require('./routes/infractions');
const infractionsStatsRoutes = require('./routes/infractionsStats');
const videoRoutes = require('./routes/video');

app.use(cors())
app.use(express.json());
app.use('/', userRoutes);
app.use('/', cameraRoutes);
app.use('/', infractionRoutes);
app.use('/', infractionsStatsRoutes);
app.use('/', videoRoutes);


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
