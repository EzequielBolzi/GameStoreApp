require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');  
const companyRoute = require('./routes/companyRoute'); 
const gameRoutes = require('./routes/gameRoute');
const app = express();

app.use(express.json());

//environment variables
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

//user routes
app.use("/api/users", userRoute);

//company routes
app.use("/api/companies", companyRoute);

//game routes
app.use('/api/games', gameRoutes);


app.get('/', (req, res) => {
    res.send("Hello from Node API Server Update");
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to database");
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        });
    })
    .catch((error) => {
        console.error("Connection failed", error.message);
    });