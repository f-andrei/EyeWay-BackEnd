const express = require('express');
const cors = require("cors")
const app = express();
const data = require('./sampleBase64');


const userRoutes = require('./routes/users');
const cameraRoutes = require('./routes/cameras');
const infractionRoutes = require('./routes/infractions');
const infractionsStatsRoutes = require('./routes/infractionsStats');
const videoRoutes = require('./routes/video');

app.use(cors())
app.use(express.json());
app.use(express.json({limit: '50mb'}));
app.use('/', userRoutes);
app.use('/', cameraRoutes);
app.use('/', infractionRoutes);
app.use('/', infractionsStatsRoutes);
app.use('/', videoRoutes);


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    // fetch('http:localhost:3000/infractions', {
    //     method: 'POST', 
    //     headers: {
    //       'Content-Type': 'application/json' 
    //     },
    //     body: JSON.stringify(data)
    //   })
    //   .then(response => response.json()) 
    //   .then(data => {
    //     console.log('Success:', data); 
    //   })
    //   .catch(error => {
    //     console.error('Error:', error);
    //   });
});

module.exports = app;
