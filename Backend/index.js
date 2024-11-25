require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');  
const cors = require('cors');  
const userRoutes = require('./routes/userRoute');  
const companyRoutes = require('./routes/companyRoute'); 
const gameRoutes = require('./routes/gameRoute');
const authRoutes =  require('./routes/authRoute');
const commentRoutes =  require('./routes/commentRoute');
const app = express();
const server = http.createServer(app); 

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3001',  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    credentials: true, 
}));


// Middleware to parse JSON requests
app.use(express.json());

// Environment variables
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

// User routes
app.use("/api/users", userRoutes);

// Company routes
app.use("/api/companies", companyRoutes);

// Game routes
app.use('/api/games', gameRoutes);

// Comment routes
app.use('/api/comments', commentRoutes);

// Auth routes
app.use('/api/auths', authRoutes)


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to database");
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error("Connection failed", error.message);
    });
