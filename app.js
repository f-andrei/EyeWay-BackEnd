const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));


const userRoutes = require('./routes/users');
const cameraRoutes = require('./routes/cameras');
const infractionRoutes = require('./routes/infractions');
const infractionsStatsRoutes = require('./routes/infractionsStats');


app.use('/users', userRoutes);
app.use('/cameras', cameraRoutes);
app.use('/infractions', infractionRoutes);
app.use('/infractions-stats', infractionsStatsRoutes);


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});