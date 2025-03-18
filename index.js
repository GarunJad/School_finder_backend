// index.js
import express from 'express';
import bodyParser from 'body-parser';
import {haversineDistance} from './utils.js';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Configure dotenv to load environment variables
dotenv.config();


const app = express();
app.use(bodyParser.json());

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  pool.getConnection()
    .then(() => {
      console.log("Connected to the database successfully.");
    })
    .catch((err) => {
      console.error("Database connection failed:", err);
    });
// Utility function for distance calculation


// Add School API
app.post('/addSchool', async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validate input
    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Insert into MySQL database
        const [result] = await pool.query(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
            [name, address, latitude, longitude]
        );
        res.status(201).json({ message: 'School added successfully!', schoolId: result.insertId });
    } catch (error) {
        console.error('Error adding school:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/listSchools', async (req, res) => {
    const { latitude, longitude } = req.query;

    // Check if latitude and longitude are provided
    if (!latitude || !longitude) {
        return res.status(400).json({ error: "User latitude and longitude are required." });
    }

    try {
        // Fetch all schools from the database
        const [schools] = await pool.query(`SELECT id, name, address, latitude, longitude FROM schools`);

        // Calculate distances and filter schools within a certain range (e.g., 50 km)
        const userLatitude = parseFloat(latitude);
        const userLongitude = parseFloat(longitude);
        const maxDistance = 50; // Example: maximum distance of 50 kilometers
       

        const nearbySchools = schools
            .map(school => {
                const distance = haversineDistance(
                    userLatitude,
                    userLongitude,
                    school.latitude,
                    school.longitude
                );
                return { ...school, distance };
            })
            /*.filter(school => school.distance <= maxDistance) // Filter out schools beyond 50km*/
            .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)
            
        // Send the filtered list of schools as the response
        res.status(200).json(nearbySchools);
    } catch (error) {
        console.error('Error fetching schools:', error.message);
        res.status(500).json({ error: 'Error fetching schools' });
    }
});
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
